
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
    debug: (msg: string, meta?: any) => void;
    info: (msg: string, meta?: any) => void;
    warn: (msg: string, meta?: any) => void;
    error: (msg: string, meta?: any) => void;
}

// Simple production-ready logger (can be replaced with winston/pino)
export const logger: Logger = {
    debug: (msg, meta) => {
        if (process.env.LOG_LEVEL === 'debug') {
            process.stdout.write(`[DEBUG] ${msg}${meta ? ' ' + JSON.stringify(meta) : ''}\n`);
        }
    },
    info: (msg, meta) => {
        if (['debug', 'info'].includes(process.env.LOG_LEVEL || 'info')) {
            process.stdout.write(`[INFO] ${msg}${meta ? ' ' + JSON.stringify(meta) : ''}\n`);
        }
    },
    warn: (msg, meta) => {
        if (['debug', 'info', 'warn'].includes(process.env.LOG_LEVEL || 'info')) {
            process.stderr.write(`[WARN] ${msg}${meta ? ' ' + JSON.stringify(meta) : ''}\n`);
        }
    },
    error: (msg, meta) => {
        process.stderr.write(`[ERROR] ${msg}${meta ? ' ' + JSON.stringify(meta) : ''}\n`);
    },
};
