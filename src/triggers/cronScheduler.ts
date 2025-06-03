import cron from 'node-cron';

export interface CronJobOptions {
    timezone?: string;
    runOnInit?: boolean;
}

export function scheduleCronJob(
    cronExpr: string,
    job: () => void,
    options: CronJobOptions = {}
) {
    if (!cron.validate(cronExpr)) {
        throw new Error(`Invalid cron expression: ${cronExpr}`);
    }
    const task = cron.schedule(cronExpr, job, {
        timezone: options.timezone,
    });
    if (options.runOnInit) {
        job();
    }
    return task;
}

export function stopCronJob(task: any) {
    task.stop();
}

export function startCronJob(task: any) {
    task.start();
}