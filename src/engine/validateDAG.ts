export function validateDAG(pipeline: any) {
    if (!pipeline.steps || !Array.isArray(pipeline.steps)) {
        throw new Error('Pipeline must have a steps array');
    }
    // Enforce: no step should have a schedule property
    for (const step of pipeline.steps) {
        if ('schedule' in step) {
            throw new Error(`Step-level scheduling is not supported. Remove 'schedule' from step '${step.id}'. Use pipeline-level scheduling instead.`);
        }
    }
    const ids = new Set<string>();
    pipeline.steps.forEach((step: any) => {
        if (!step.id) {
            throw new Error('All steps must have an id');
        }
        if (ids.has(step.id)) {
            throw new Error(`Duplicate step id: ${step.id}`);
        }
        ids.add(step.id);
    });
    // Check for missing dependencies
    pipeline.steps.forEach((step: any) => {
        const deps = step.dependsOn || [];
        deps.forEach((depId: string) => {
            if (!ids.has(depId)) {
                throw new Error(`Step ${step.id} depends on missing step: ${depId}`);
            }
        });
    });
}