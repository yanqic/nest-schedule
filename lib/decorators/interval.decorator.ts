import { applyDecorators, SetMetadata } from '@nestjs/common';
import { isString } from 'lodash';
import { SchedulerType } from '../enums/scheduler-type.enum';
import {
    SCHEDULER_NAME,
    SCHEDULER_TYPE,
    SCHEDULE_INTERVAL_OPTIONS,
    SCHEDULER_OPTIONS,
} from '../schedule.constants';
import { IntervalOptions } from '../interfaces/interval-options.interface';

/**
 * Schedules an interval (`setInterval`).
 */
export function Interval(interval: number): MethodDecorator;
/**
 * Schedules an interval (`setInterval`).
 */
export function Interval(
    name: string,
    interval: number,
    options?: IntervalOptions,
): MethodDecorator;
/**
 * Schedules an interval (`setInterval`).
 */
export function Interval(
    nameOrTimeout: string | number,
    interval?: number,
    options?: IntervalOptions,
): MethodDecorator {
    const [name, intervalTimeout] = isString(nameOrTimeout)
        ? [nameOrTimeout, interval, options]
        : [undefined, nameOrTimeout, options];

    return applyDecorators(
        SetMetadata(SCHEDULE_INTERVAL_OPTIONS, { timeout: intervalTimeout }),
        SetMetadata(SCHEDULER_NAME, name),
        SetMetadata(SCHEDULER_OPTIONS, options),
        SetMetadata(SCHEDULER_TYPE, SchedulerType.INTERVAL),
    );
}
