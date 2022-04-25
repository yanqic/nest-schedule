import { DynamicModule, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { SchedulerMetadataAccessor } from './schedule-metadata.accessor';
import { ScheduleExplorer } from './schedule.explorer';
import { SchedulerOrchestrator } from './scheduler.orchestrator';
import { SchedulerRegistry } from './scheduler.registry';
import { ScheduleWrapper } from './schedule.wrapper';
import { Schedule } from './schedule';
import { Scanner } from './scanner';
import { SCHEDULE } from './schedule.constants';

@Module({
    imports: [DiscoveryModule],
    providers: [SchedulerMetadataAccessor, SchedulerOrchestrator, Scanner],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ScheduleModule {
    static forRoot(): DynamicModule {
        const scheduleProvider = {
            provide: SCHEDULE,
            useExisting: Schedule,
        };

        return {
            global: true,
            module: ScheduleModule,
            providers: [
                ScheduleExplorer,
                SchedulerRegistry,
                ScheduleWrapper,
                Schedule,
                scheduleProvider,
            ],
            exports: [scheduleProvider],
        };
    }
}
