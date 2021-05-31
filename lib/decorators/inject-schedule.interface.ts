import { Inject } from '@nestjs/common';
import { NEST_SCHEDULE_PROVIDER } from '../constants';

/**
 * 依赖注入装饰器
 */
export const InjectSchedule = () => Inject(NEST_SCHEDULE_PROVIDER);
