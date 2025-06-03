# langpipe

A production-ready, developer-friendly TypeScript pipeline orchestration library supporting DAG execution, retries, context, secret injection, LLM (Langchain) integration, observability (Langfuse), scheduling, and extensibility.

---

## Features
- **DAG-based pipeline execution** with topological sort and validation
- **Step and pipeline-level retries** with exponential/linear backoff
- **Context management** for passing data between steps
- **Advanced secret injection** (env, masking, per-step)
- **LLM integration** (OpenAI, AzureAI via Langchain)
- **Observability**: Step-level tracing (Langfuse) and production logger
- **Cron-based scheduling** (pipeline-level)
- **Extensible**: Strong generics, adapters, and type safety
- **NPM-ready**: Clean exports, typings, and examples

---

## Installation

```bash
npm install langpipe
```

---

## Quick Start Example

```ts
import { PipelineEngine } from 'langpipe';
import { llmCompletion } from 'langpipe/adapters/langchainAdapter';

const pipelineDef = {
  schedule: '0 0 * * *', // daily at midnight
  steps: [
    {
      id: 'uppercase',
      run: async ({ text }) => ({ uppercased: text.toUpperCase() }),
      params: { text: 'hello world' }
    },
    {
      id: 'llm',
      run: async ({ prompt }) => ({ completion: await llmCompletion(prompt, {
        provider: 'openai',
        apiKey: process.env.OPENAI_API_KEY || '',
        model: 'gpt-3.5-turbo',
        maxTokens: 32,
        temperature: 0.7
      }) }),
      dependsOn: ['uppercase'],
      params: { prompt: 'Write a poem about: HELLO WORLD' }
    }
  ]
};

const engine = new PipelineEngine(pipelineDef);
engine.run();
```

---

## API Overview

### Pipeline Types
- `PipelineStep<Input, Output, Context>`: Step definition
- `PipelineDefinition<Step>`: Pipeline structure
- `PipelineContext<T>`: Context interface

### Engine
- `PipelineEngine`: Orchestrates validation, execution, context, and retries
- `executePipeline`: Low-level execution (for advanced use)

### Scheduling
- `scheduleCronJob(cronExpr, job, options)`: Schedule pipeline with cron

### LLM Integration
- `llmCompletion(prompt, options)`: OpenAI/AzureAI completions
- `llmEmbedding(text, options)`: Embeddings

### Secrets
- `injectSecrets(step, secrets, options)`: Inject and mask secrets

### Observability
- `logger`: Production logger (debug/info/warn/error)
- `recordTrace`: Step-level tracing (Langfuse)

---

## Configuration

### Retries
- Set `retryOptions` on steps or pipeline: `{ retries, backoffMs, backoffStrategy }`

### Scheduling
- Add `schedule` (cron string) at pipeline level only

### Secrets
- Use `injectSecrets` to inject secrets per step, with masking and env support

### LLM
- Use `llmCompletion`/`llmEmbedding` with provider, apiKey, model, etc.

### Logging
- Set `LOG_LEVEL=debug` for verbose logs

---

## Example: Combined Pipeline

See [`examples/combinedPipelineExample.ts`](./examples/combinedPipelineExample.ts) for a full example with classic and LLM steps, scheduling, and context.

---

## Extensibility
- Strong generics for custom input/output/context types
- Add new adapters for other LLMs, databases, or APIs
- Extend logger, tracing, or secret management as needed

---

## License
MIT
