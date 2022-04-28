/* eslint-disable @typescript-eslint/ban-types */
import { Logger } from '@nestjs/common';
import { Locker } from './interfaces/locker.interface';
import { JOB_EXECUTE_ERROR, TRY_LOCK_FAILED } from './schedule.messages';

const logger = new Logger('Schedule');

export class ScheduleWrapper {
    public async immediately(name: string, target: Promise<Function>) {
        (await target)
            .call(null)
            .catch(e => logger.error(JOB_EXECUTE_ERROR(name), e));

        return target;
    }

    public async retryable(
        target: Promise<Function>,
        retries = -1,
        retry = 5000,
    ): Promise<Function> {
        let count = 0;
        let timer: NodeJS.Timeout;

        const targetRef = () => {
            return new Promise<void>(async (resolve, reject) => {
                const wrapperRef = async () => {
                    try {
                        await (await target).call(null);

                        count = 0;
                        resolve();
                    } catch (e) {
                        if (count < retries) {
                            if (timer) {
                                clearTimeout(timer);
                            }

                            count++;
                            timer = setTimeout(() => wrapperRef(), retry);

                            return;
                        }

                        count = 0;
                        reject(e);
                    }
                };

                await wrapperRef();
            });
        };

        return targetRef;
    }

    public async lockable(
        target: Promise<Function>,
        name: string,
        locker?: Locker,
    ): Promise<Function> {
        return async () => {
            if (locker) {
                try {
                    const locked = await locker.tryLock(name);

                    if (!locked) {
                        logger.warn(TRY_LOCK_FAILED(name));

                        return;
                    }

                    await (await target).call(null);
                    await locker.release(name);
                } catch (e) {
                    logger.error(JOB_EXECUTE_ERROR(name), e);
                }
            } else {
                await (await target).call(null);
            }
        };
    }
}
