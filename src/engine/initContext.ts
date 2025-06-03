export function initContext() {
    const context = new Map<string, any>();
    return {
        get: (key: string) => {
            if (!context.has(key)) {
                console.warn(`Context key not found: ${key}`);
            }
            return context.get(key);
        },
        set: (key: string, value: any) => {
            context.set(key, value);
            console.log(`Context set: ${key}`);
        },
    };
}