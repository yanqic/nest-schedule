import { DynamicModule, Module, ModuleMetadata, Type } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { SchedulerMetadataAccessor } from './schedule-metadata.accessor';
import { ScheduleExplorer } from './schedule.explorer';
import { SchedulerOrchestrator } from './scheduler.orchestrator';
import { SchedulerRegistry } from './scheduler.registry';
import { ScheduleWrapper } from './schedule.wrapper';
import { Schedule } from './schedule';
import { Scanner } from './scanner';
import { SCHEDULE, SCHEDULE_LOCKER_SERVICE } from './schedule.constants';
import { DefaultLocker, Locker } from './interfaces';

export interface AsyncModuleConfig
    extends Pick<ModuleMetadata, 'imports' | 'exports'> {
    useClass?: Type<Locker>;
}

@Module({
    imports: [DiscoveryModule],
    providers: [SchedulerMetadataAccessor, SchedulerOrchestrator, Scanner],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ScheduleModule {
    static forRoot(options?: AsyncModuleConfig): DynamicModule {
        const scheduleProvider = {
            provide: SCHEDULE,
            useExisting: Schedule,
        };

        return {
            global: true,
            module: ScheduleModule,
            imports: options?.imports || [],
            providers: [
                ScheduleExplorer,
                SchedulerRegistry,
                ScheduleWrapper,
                Schedule,
                scheduleProvider,
                this.createLockerProvider(options),
            ],
            exports: [scheduleProvider],
        };
    }

    private static createLockerProvider(options?: AsyncModuleConfig) {
        return {
            provide: SCHEDULE_LOCKER_SERVICE,
            useClass: options?.useClass || DefaultLocker,
        };
    }
}
