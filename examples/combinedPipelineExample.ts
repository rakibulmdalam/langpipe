import { PipelineEngine } from '../src';
import { PipelineStep } from '../src/core/types';
import { llmCompletion, LLMOptions } from '../src/adapters/langchainAdapter';

// --- Step 1: Normal step (uppercase transformation) ---
const uppercaseStep: PipelineStep<{ text: string }, { uppercased: string }> = {
    id: 'uppercase',
    async run(input) {
        return { uppercased: input.text.toUpperCase() };
    }
};

// --- Step 2: LLM step (completion using OpenAI or AzureAI) ---
const llmStep: PipelineStep<{ prompt: string }, { completion: string }> = {
    id: 'llm',
    async run(input) {
        const llmOptions: LLMOptions = {
            provider: 'openai', // or 'azureai'
            apiKey: process.env.OPENAI_API_KEY || '',
            model: 'gpt-3.5-turbo',
            maxTokens: 32,
            temperature: 0.7
        };
        const result = await llmCompletion(input.prompt, llmOptions);
        return { completion: result };
    }
};

// --- Pipeline definition ---
const pipelineDef = {
    schedule: '0 0 * * *', // Run the entire pipeline daily at midnight (example)
    steps: [
        {
            id: 'step1',
            run: uppercaseStep.run,
            params: { text: 'hello world' }
        },
        {
            id: 'step2',
            run: llmStep.run,
            dependsOn: ['step1'],
            params: { prompt: 'Write a poem about: HELLO WORLD' }
        }
    ]
};

// --- Run the pipeline ---
import { scheduleCronJob } from '../src/triggers/cronScheduler';

(async () => {
    const engine = new PipelineEngine(pipelineDef);
    if (pipelineDef.schedule) {
        scheduleCronJob(pipelineDef.schedule, async () => {
            await engine.run();
            console.log('Combined pipeline finished (scheduled)!');
        });
        console.log('Pipeline scheduled with cron:', pipelineDef.schedule);
    } else {
        await engine.run();
        console.log('Combined pipeline finished!');
    }
})();
