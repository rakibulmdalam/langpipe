// Minimal module declaration to suppress TypeScript errors for langchain import
// Extend as needed for more type safety

declare module 'langchain' {
  export function getChainById(chainId: string): Promise<any>;
}

declare module 'langchain/llms/openai' {
  export class OpenAI {
    constructor(options: any);
    invoke(prompt: string): Promise<any>;
  }
}
declare module 'langchain/llms/azure_openai' {
  export class AzureOpenAI {
    constructor(options: any);
    invoke(prompt: string): Promise<any>;
  }
}
declare module 'langchain/embeddings/openai' {
  export class OpenAIEmbeddings {
    constructor(options: any);
    embedQuery(text: string): Promise<any>;
  }
}
declare module 'langchain/embeddings/azure_openai' {
  export class AzureOpenAIEmbeddings {
    constructor(options: any);
    embedQuery(text: string): Promise<any>;
  }
}
