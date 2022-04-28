/* eslint-disable @typescript-eslint/ban-types */
import { Inject, Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { TimeoutOptions } from './interfaces/timeout-options.interface';
import {
    CronJobOptions,
    IntervalJobOptions,
    SchedulerRegistry,
    TimeoutJobOptions,
} from './scheduler.registry';
import { SchedulerOrchestrator } from './scheduler.orchestrator';
import { IntervalOptions } from './interfaces/interval-options.interface';
import {
    CronObject,
    CronObjLiteral,
    CronOptions,
} from './interfaces/cron-options.interface';
import { Locker } from './interfaces/locker.interface';
import { SCHEDULE_LOCKER_SERVICE } from './schedule.constants';

@Injectable()
export class Schedule {
    constructor(
        @Inject(SCHEDULE_LOCKER_SERVICE) private readonly locker: Locker,
        private registry: SchedulerRegistry,
        private schedulerOrchestrator: SchedulerOrchestrator,
    ) {}

    private getLocker(locker?: Locker | false) {
        if (locker === false) {
            return undefined;
        }

        return locker || this.locker;
    }

    public createTimeoutJob(
        methodRef: Function,
        timeout: number,
        locker?: Locker | false,
        options: TimeoutOptions = {},
    ) {
        const name = options.name || v4();

        this.registry.addTimeoutJob(name, {
            target: methodRef,
            timeout,
            locker: this.getLocker(locker),
            options,
        });

        this.schedulerOrchestrator.mountTimeouts();
    }

    public createIntervalJob(
        methodRef: Function,
        interval: number,
        locker?: Locker | false,
        options: IntervalOptions = {},
    ) {
        const name = options.name || v4();

        this.registry.addIntervalJob(name, {
            target: methodRef,
            interval,
            locker: this.getLocker(locker),
            options,
        });

        this.schedulerOrchestrator.mountIntervals();
    }

    public createCronJob(
        rule: string | number | Date | CronObject | CronObjLiteral,
        methodRef,
        locker?: Locker | false,
        options: CronOptions = {},
    ) {
        const name = options.name || v4();

        this.registry.addCronJob(name, {
            target: methodRef,
            rule,
            locker: this.getLocker(locker),
            options,
        });

        this.schedulerOrchestrator.mountCron();
    }

    public deleteTimeoutJob(name: string) {
        this.registry.deleteTimeoutJob(name);
    }

    public deleteIntervalJob(name: string) {
        this.registry.deleteIntervalJob(name);
    }

    public deleteCronJob(name: string) {
        this.registry.deleteCronJob(name);
    }

    public getTimeoutJobs(): TimeoutJobOptions[] {
        return [...this.registry.getTimeoutJobs().values()];
    }

    public getIntervalJobs(): IntervalJobOptions[] {
        return [...this.registry.getIntervalJobs().values()];
    }

    public getCronJobs(): CronJobOptions[] {
        return [...this.registry.getCronJobs().values()];
    }
}
