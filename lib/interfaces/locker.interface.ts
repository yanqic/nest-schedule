import { IScheduleConfig } from './schedule-config.interface';

export interface ILocker {
  name: string;
  init(key: string, config: IScheduleConfig): void;

  tryLock(): Promise<boolean> | boolean;

  release(): any;
}
