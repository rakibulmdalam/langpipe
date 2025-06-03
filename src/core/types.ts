export interface PipelineStep<Input = any, Output = any, Ctx = any> {
    id: string;
    run: (input: Input, context: Ctx) => Promise<Output>;
    dependsOn?: string[];
    params?: any; // Allow params for step execution
}

export interface PipelineDefinition<Step extends PipelineStep = PipelineStep> {
    steps: Step[];
    schedule?: string; // Optional cron schedule for the entire pipeline
}

export interface PipelineContext<T = any> {
    get: (key: string) => T;
    set: (key: string, value: T) => void;
}

export interface PipelineExecutionResult<Output = any> {
    success: boolean;
    error?: Error;
    outputs?: Record<string, Output>;
}

export class PipelineError extends Error {
    constructor(message: string, public stepId?: string) {
        super(message);
        this.name = 'PipelineError';
    }
}

export function isPipelineStep(obj: any): obj is PipelineStep {
    return obj && typeof obj.id === 'string' && typeof obj.run === 'function';
}