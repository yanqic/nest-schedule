/* eslint-disable @typescript-eslint/ban-types */
import { Injectable } from '@nestjs/common';
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

@Injectable()
export class Schedule {
    constructor(
        private registry: SchedulerRegistry,
        private schedulerOrchestrator: SchedulerOrchestrator,
    ) {}

    public createTimeoutJob(
        methodRef: Function,
        timeout: number,
        locker?: Locker,
        options: TimeoutOptions = {},
    ) {
        const name = options.name || v4();

        this.registry.addTimeoutJob(name, {
            target: methodRef,
            timeout,
            locker,
            options,
        });
        this.schedulerOrchestrator.mountTimeouts();
    }

    public createIntervalJob(
        methodRef: Function,
        interval: number,
        locker?: Locker,
        options: IntervalOptions = {},
    ) {
        const name = options.name || v4();

        this.registry.addIntervalJob(name, {
            target: methodRef,
            interval,
            locker,
            options,
        });

        this.schedulerOrchestrator.mountIntervals();
    }

    public createCronJob(
        rule: string | number | Date | CronObject | CronObjLiteral,
        methodRef,
        locker?: Locker,
        options: CronOptions = {},
    ) {
        const name = options.name || v4();

        this.registry.addCronJob(name, {
            target: methodRef,
            rule,
            locker,
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
