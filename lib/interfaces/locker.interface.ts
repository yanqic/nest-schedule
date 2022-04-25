export interface Locker {
    tryLock(jobName: string): Promise<boolean> | boolean;

    release(jobName: string): any;
}
