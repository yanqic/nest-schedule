import { NestDistributedSchedule } from './nest-distributed.schedule';

export class NestSchedule extends NestDistributedSchedule {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor() {
    super();
  }

  async tryLock(_method: string): Promise<boolean> {
    return true;
  }
}
