const LANGFUSE_API_URL = process.env.LANGFUSE_API_URL || 'http://localhost:3000/api/public/ingestion/trace';
const LANGFUSE_API_KEY = process.env.LANGFUSE_API_KEY;

export async function recordTrace(stepId: string, input: any, output: any, error: any, duration: number) {
    if (!LANGFUSE_API_KEY) {
        console.warn('Langfuse API key not set. Skipping trace.');
        return;
    }
    const traceData = {
        stepId,
        input,
        output,
        error: error ? (error.message || String(error)) : null,
        duration,
        timestamp: new Date().toISOString(),
    };
    try {
        await fetch(LANGFUSE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LANGFUSE_API_KEY}`,
            },
            body: JSON.stringify(traceData),
        });
    } catch (err) {
        console.error('Failed to send trace to Langfuse:', err);
    }
}