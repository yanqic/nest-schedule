/* eslint-disable @typescript-eslint/ban-types */
import {
    Injectable,
    Logger,
    OnApplicationBootstrap,
    OnApplicationShutdown,
} from '@nestjs/common';
import { v4 } from 'uuid';
import { scheduleJob } from 'node-schedule';
import { SchedulerRegistry } from './scheduler.registry';
import {
    CronObject,
    CronObjLiteral,
    CronOptions,
} from './interfaces/cron-options.interface';
import { Locker } from './interfaces/locker.interface';
import { ScheduleWrapper } from './schedule.wrapper';
import { JOB_EXECUTE_ERROR } from './schedule.messages';
import { TimeoutOptions } from './interfaces/timeout-options.interface';
import { IntervalOptions } from './interfaces/interval-options.interface';

@Injectable()
export class SchedulerOrchestrator
    implements OnApplicationBootstrap, OnApplicationShutdown {
    private readonly logger = new Logger('Schedule');

    constructor(
        private readonly registry: SchedulerRegistry,
        private readonly wrapper: ScheduleWrapper,
    ) {}

    onApplicationBootstrap() {
        this.mountTimeouts();
        this.mountIntervals();
        this.mountCron();
    }

    onApplicationShutdown() {
        this.clearTimeouts();
        this.clearIntervals();
        this.closeCronJobs();
    }

    public mountIntervals() {
        this.registry.getIntervalJobs().forEach((job, name) => {
            const { options = {}, interval, target, locker, ref } = job;

            if (ref) {
                return;
            }

            let methodRef = this.wrapper.retryable(
                target as any,
                options.retries,
                options.retry,
            );

            if (options.immediate) {
                methodRef = this.wrapper.immediately(name, methodRef);
            }

            methodRef = this.wrapper.lockable(methodRef, name, locker);

            job.ref = setInterval(async () => {
                try {
                    await (await methodRef).call(null);
                } catch (e) {
                    this.logger.error(JOB_EXECUTE_ERROR(name), e);
                }
            }, interval);
        });
    }

    public mountTimeouts() {
        this.registry.getTimeoutJobs().forEach((job, name) => {
            const { options = {}, timeout, target, locker, ref } = job;

            if (ref) {
                return;
            }

            const methodRef = this.wrapper.lockable(
                this.wrapper.retryable(
                    target as any,
                    options.retries,
                    options.retry,
                ),
                name,
                locker,
            );

            job.ref = setTimeout(async () => {
                try {
                    await (await methodRef).call(null);
                } catch (e) {
                    this.logger.error(JOB_EXECUTE_ERROR(name), e);
                }
            }, timeout);
        });
    }

    public mountCron() {
        this.registry.getCronJobs().forEach((job, name) => {
            const { options = {}, target, rule, locker, ref } = job;

            if (ref) {
                return;
            }

            const methodRef = this.wrapper.lockable(
                this.wrapper.retryable(
                    target as any,
                    options.retries,
                    options.retry,
                ),
                name,
                locker,
            );

            job.ref = scheduleJob(name, rule as any, async () => {
                try {
                    await (await methodRef).call(null);
                } catch (e) {
                    this.logger.error(JOB_EXECUTE_ERROR(name), e);
                }
            });
        });
    }

    clearTimeouts() {
        const keys = Object.keys(this.registry.getTimeoutJobs());

        keys.forEach(key =>
            clearTimeout(this.registry.getTimeoutJob(key).ref!),
        );
    }

    clearIntervals() {
        const keys = Object.keys(this.registry.getIntervalJobs());

        keys.forEach(key =>
            clearInterval(this.registry.getIntervalJob(key).ref!),
        );
    }

    closeCronJobs() {
        const keys = Object.keys(this.registry.getCronJobs());

        keys.forEach(key => this.registry.getCronJob(key).ref!.cancel());
    }

    addTimeout(
        methodRef: Function,
        timeout: number,
        name: string,
        locker: Locker,
        options?: TimeoutOptions,
    ) {
        this.registry.addTimeoutJob(name, {
            target: methodRef,
            timeout,
            locker,
            options,
        });
    }

    addInterval(
        methodRef: Function,
        interval: number,
        name: string,
        locker: Locker,
        options?: IntervalOptions,
    ) {
        this.registry.addIntervalJob(name, {
            target: methodRef,
            interval,
            locker,
            options,
        });
    }

    addCron(
        methodRef: Function,
        rule: string | number | Date | CronObject | CronObjLiteral,
        locker: Locker,
        options?: CronOptions,
    ) {
        const name = options ? options.name || v4() : v4();

        this.registry.addCronJob(name, {
            target: methodRef,
            rule,
            locker,
            options,
        });
    }
}
