import { recordTrace } from '../observability/recordTrace';
import { logger } from '../observability/logger';
import { PipelineStep, PipelineDefinition, PipelineContext } from '../core/types';

export interface RetryOptions {
    retries?: number;
    backoffMs?: number;
    backoffStrategy?: 'exponential' | 'linear' | 'none';
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
    retries: 0,
    backoffMs: 0,
    backoffStrategy: 'exponential',
};

export function getRetryOptions(step: any, pipelineRetryOptions: RetryOptions): Required<RetryOptions> {
    return {
        ...DEFAULT_RETRY_OPTIONS,
        ...pipelineRetryOptions,
        ...(step.retryOptions || {}),
    };
}

export async function runWithRetry(fn: () => Promise<any>, stepId: string, retryOptions: RetryOptions = {}) {
    const opts = { ...DEFAULT_RETRY_OPTIONS, ...retryOptions };
    let attempt = 0;
    let lastError;
    while (attempt <= opts.retries) {
        try {
            return await fn();
        } catch (err) {
            lastError = err;
            if (attempt < opts.retries) {
                let backoff = 0;
                if (opts.backoffStrategy === 'exponential') {
                    backoff = opts.backoffMs * Math.pow(2, attempt);
                } else if (opts.backoffStrategy === 'linear') {
                    backoff = opts.backoffMs * (attempt + 1);
                }
                if (backoff > 0) {
                    logger.warn(`Retrying step ${stepId} (attempt ${attempt + 1} of ${opts.retries}) after ${backoff}ms...`, { stepId, attempt, backoff });
                    await new Promise(res => setTimeout(res, backoff));
                } else {
                    logger.warn(`Retrying step ${stepId} (attempt ${attempt + 1} of ${opts.retries})...`, { stepId, attempt });
                }
            }
            attempt++;
        }
    }
    throw lastError;
}

export async function executePipeline<
    Input = any,
    Output = any,
    Ctx = any,
    Step extends PipelineStep<Input, Output, Ctx> = PipelineStep<Input, Output, Ctx>,
    Def extends PipelineDefinition<Step> = PipelineDefinition<Step>,
    CtxImpl extends PipelineContext<Output> = PipelineContext<Output>
>(
    layers: Step[][],
    pipeline: Def,
    context: CtxImpl,
    retryOptions: RetryOptions = {}
) {
    for (const layer of layers) {
        await Promise.all(layer.map(async (step: Step) => {
            const start = Date.now();
            let output: Output | null = null;
            let error: any = null;
            const stepRetryOptions = getRetryOptions(step, retryOptions);
            try {
                if (!step || typeof step !== 'object' || !step.id) {
                    throw new Error(`Invalid step definition: ${JSON.stringify(step)}`);
                }
                output = await runWithRetry(async () => {
                    logger.info(`Executing step: ${step.id}`);
                    // TODO: Replace with actual execution and set output
                    return (await step.run({ ...step['params'] }, context as unknown as Ctx));
                }, step.id, stepRetryOptions);
                error = null;
                // Optionally update context with output
                if (context && typeof context.set === 'function' && output !== null) {
                    context.set(step.id, output as Output);
                }
            } catch (err) {
                error = err;
                logger.error(`Error executing step ${step?.id || 'unknown'}`, { error: String(err), step });
                throw err;
            } finally {
                const duration = Date.now() - start;
                await recordTrace(step.id, step, output, error, duration);
            }
        }));
    }
}