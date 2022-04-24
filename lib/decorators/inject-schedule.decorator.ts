import { Inject } from '@nestjs/common';
import { SCHEDULE } from '../schedule.constants';

export const InjectSchedule = () => Inject(SCHEDULE);
