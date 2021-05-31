export type JobCallback = () => Promise<Stop> | Stop;
export type Stop = boolean;
export type TryLock = (method: string) => TryRelease;
export type TryRelease = boolean | (() => void);
