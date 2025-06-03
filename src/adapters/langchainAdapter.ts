import { PipelineError } from '../core/types';
import { OpenAI } from 'langchain/llms/openai';
import { AzureOpenAI } from 'langchain/llms/azure_openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { AzureOpenAIEmbeddings } from 'langchain/embeddings/azure_openai';

// --- LLM Provider Abstraction ---
export type LLMProvider = 'openai' | 'azureai';

export interface LLMOptions {
    provider: LLMProvider;
    apiKey: string;
    endpoint?: string; // For Azure
    deploymentName?: string; // For Azure
    model?: string; // For OpenAI
    maxTokens?: number;
    temperature?: number;
    [key: string]: any;
}

export function llmCompletion(prompt: string, options: LLMOptions) {
    try {
        if (options.provider === 'openai') {
            const llm = new OpenAI({
                openAIApiKey: options.apiKey,
                modelName: options.model,
                maxTokens: options.maxTokens,
                temperature: options.temperature,
                ...options
            });
            return llm.invoke(prompt);
        } else if (options.provider === 'azureai') {
            const llm = new AzureOpenAI({
                azureOpenAIApiKey: options.apiKey,
                azureOpenAIApiInstanceName: options.endpoint,
                azureOpenAIApiDeploymentName: options.deploymentName,
                maxTokens: options.maxTokens,
                temperature: options.temperature,
                ...options
            });
            return llm.invoke(prompt);
        } else {
            throw new PipelineError('Unsupported LLM provider', 'llmCompletion');
        }
    } catch (err: any) {
        throw new PipelineError(err.message || 'LLM completion error', 'llmCompletion');
    }
}

export function llmEmbedding(text: string, options: LLMOptions) {
    try {
        if (options.provider === 'openai') {
            const embedder = new OpenAIEmbeddings({
                openAIApiKey: options.apiKey,
                modelName: options.model,
                ...options
            });
            return embedder.embedQuery(text);
        } else if (options.provider === 'azureai') {
            const embedder = new AzureOpenAIEmbeddings({
                azureOpenAIApiKey: options.apiKey,
                azureOpenAIApiInstanceName: options.endpoint,
                azureOpenAIApiDeploymentName: options.deploymentName,
                ...options
            });
            return embedder.embedQuery(text);
        } else {
            throw new PipelineError('Unsupported LLM provider', 'llmEmbedding');
        }
    } catch (err: any) {
        throw new PipelineError(err.message || 'LLM embedding error', 'llmEmbedding');
    }
}

// --- Backward compatible chain runner ---
export async function runLangchainChain(chainId: string, input: any) {
    try {
        const { getChainById } = await import('langchain');
        const chain = await getChainById(chainId);
        if (!chain) {
            throw new PipelineError(`Langchain chain not found: ${chainId}`, chainId);
        }
        const result = await chain.run(input);
        return result;
    } catch (err: any) {
        throw new PipelineError(err.message || 'Unknown error', chainId);
    }
}