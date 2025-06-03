import { loadPipelineDefinition } from './loadPipelineDefinition';
import { validateDAG } from './validateDAG';
import { topologicalSort } from './topologicalSort';
import { executePipeline } from './executePipeline';
import { initContext } from './initContext';
import { PipelineStep, PipelineDefinition, PipelineContext } from '../core/types';

export class PipelineEngine<
    Input = any,
    Output = any,
    Ctx = any,
    Step extends PipelineStep<Input, Output, Ctx> = PipelineStep<Input, Output, Ctx>,
    Def extends PipelineDefinition<Step> = PipelineDefinition<Step>,
    CtxImpl extends PipelineContext<Output> = PipelineContext<Output>
> {
    constructor(private definition: Def) {}

    async run() {
        try {
            const pipeline = loadPipelineDefinition(this.definition);
            validateDAG(pipeline);
            const layers = topologicalSort(pipeline);
            const context = initContext();
            await executePipeline(layers, pipeline as any, context);
            // Use logger in production
        } catch (error) {
            // Use logger in production
            throw error;
        }
    }
}