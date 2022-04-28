export interface Locker {
    tryLock(jobName: string): Promise<boolean> | boolean;

    release(jobName: string): any;
}

export class DefaultLocker implements Locker {
    async tryLock(_jobName: string): Promise<boolean> {
        return true;
    }

    release(_jobName: string): any {
        return;
    }
}
