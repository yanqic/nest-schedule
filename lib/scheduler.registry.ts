import { Injectable } from '@nestjs/common';
import { Job } from 'node-schedule';
import { DUPLICATE_SCHEDULER } from './schedule.messages';
import { Locker } from './interfaces/locker.interface';
import { TimeoutOptions } from './interfaces/timeout-options.interface';
import { IntervalOptions } from './interfaces/interval-options.interface';
import {
    CronObject,
    CronObjLiteral,
    CronOptions,
} from './interfaces/cron-options.interface';

interface TargetHost {
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: Function;
}

interface IntervalHost {
    interval: number;
    locker?: Locker;
    options?: IntervalOptions;
}

interface TimeoutHost {
    timeout: number;
    locker?: Locker;
    options?: TimeoutOptions;
}

interface RefHost<T> {
    ref?: T;
}

interface CronHost {
    rule: string | number | Date | CronObject | CronObjLiteral;
    locker?: Locker;
    options?: CronOptions;
    job?: Job;
}

export type IntervalJobOptions = TargetHost &
    IntervalHost &
    RefHost<NodeJS.Timeout>;
export type TimeoutJobOptions = TargetHost &
    TimeoutHost &
    RefHost<NodeJS.Timeout>;
export type CronJobOptions = TargetHost & CronHost & RefHost<Job>;

@Injectable()
export class SchedulerRegistry {
    private readonly cronJobs = new Map<string, CronJobOptions>();
    private readonly timeoutJobs = new Map<string, TimeoutJobOptions>();
    private readonly intervalJobs = new Map<string, IntervalJobOptions>();

    getCronJob(name: string) {
        return this.cronJobs.get(name);
    }

    getIntervalJob(name: string) {
        return this.intervalJobs.get(name);
    }

    getTimeoutJob(name: string) {
        return this.timeoutJobs.get(name);
    }

    addCronJob(name: string, cronJob: CronJobOptions) {
        const job = this.cronJobs.get(name);

        if (job) {
            throw new Error(DUPLICATE_SCHEDULER('Cron Job', name));
        }

        this.cronJobs.set(name, cronJob);
    }

    addIntervalJob(name: string, intervalJob: IntervalJobOptions) {
        const job = this.intervalJobs.get(name);

        if (job) {
            throw new Error(DUPLICATE_SCHEDULER('Interval', name));
        }

        this.intervalJobs.set(name, intervalJob);
    }

    addTimeoutJob(name: string, timeoutJob: TimeoutJobOptions) {
        const job = this.timeoutJobs.get(name);

        if (job) {
            throw new Error(DUPLICATE_SCHEDULER('Timeout', name));
        }

        this.timeoutJobs.set(name, timeoutJob);
    }

    getCronJobs(): Map<string, CronJobOptions> {
        return this.cronJobs;
    }

    deleteCronJob(name: string) {
        const job = this.cronJobs.get(name);

        if (job) {
            job.job?.cancel();
            this.cronJobs.delete(name);
        }
    }

    getIntervalJobs(): Map<string, IntervalJobOptions> {
        return this.intervalJobs;
    }

    deleteIntervalJob(name: string) {
        const job = this.intervalJobs.get(name);

        if (job) {
            clearInterval(job.ref!);
            this.intervalJobs.delete(name);
        }
    }

    getTimeoutJobs(): Map<string, TimeoutJobOptions> {
        return this.timeoutJobs;
    }

    deleteTimeoutJob(name: string) {
        const job = this.timeoutJobs.get(name);

        if (job) {
            clearTimeout(job.ref!);
            this.timeoutJobs.delete(name);
        }
    }
}
