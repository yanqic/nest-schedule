import { Job } from 'node-schedule';
import { IScheduleConfig } from './schedule-config.interface';

export interface IJob {
  key: string;
  config: IScheduleConfig | undefined;
  type: 'cron' | 'interval' | 'timeout';
  instance?: Job;
  timer?: NodeJS.Timer;
  method?: () => Promise<Stop> | Stop;
  tryLock?: TryLock | Promise<TryLock>;
  status: string;
}
