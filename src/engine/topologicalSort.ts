export function topologicalSort(pipeline: any) {
    if (!pipeline.steps || !Array.isArray(pipeline.steps)) {
        throw new Error('Pipeline must have a steps array');
    }
    const steps = pipeline.steps;
    const sorted: any[] = [];
    const visited: Record<string, boolean> = {};
    const temp: Record<string, boolean> = {};
    const stepMap: Record<string, any> = {};
    steps.forEach((step: any) => { stepMap[step.id] = step; });

    function visit(step: any) {
        if (temp[step.id]) {
            throw new Error(`Cycle detected at step: ${step.id}`);
        }
        if (!visited[step.id]) {
            temp[step.id] = true;
            const deps = step.dependsOn || [];
            deps.forEach((depId: string) => {
                if (!stepMap[depId]) {
                    throw new Error(`Missing dependency: ${depId} for step: ${step.id}`);
                }
                visit(stepMap[depId]);
            });
            visited[step.id] = true;
            temp[step.id] = false;
            sorted.push(step);
        }
    }

    steps.forEach(visit);
    // Group steps by layer (those with same depth)
    const layers: any[][] = [];
    const depthMap: Record<string, number> = {};
    function calcDepth(step: any): number {
        if (depthMap[step.id] !== undefined) return depthMap[step.id];
        const deps = step.dependsOn || [];
        if (deps.length === 0) return (depthMap[step.id] = 0);
        return (depthMap[step.id] = Math.max(...deps.map((d: string) => calcDepth(stepMap[d]))) + 1);
    }
    sorted.forEach(step => {
        const d = calcDepth(step);
        if (!layers[d]) layers[d] = [];
        layers[d].push(step);
    });
    return layers;
}