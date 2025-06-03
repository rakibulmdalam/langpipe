export interface InjectSecretsOptions {
    maskForLogging?: boolean;
    injectToEnv?: boolean;
}

export function injectSecrets(
    step: any,
    secrets: Record<string, string>,
    options: InjectSecretsOptions = {}
) {
    if (!step || typeof step !== 'object') {
        throw new Error('Invalid step provided to injectSecrets');
    }
    if (!step.context) {
        step.context = {};
    }
    // Only inject secrets that are referenced by the step, if specified
    let filteredSecrets = { ...secrets };
    if (Array.isArray(step.requiredSecrets)) {
        filteredSecrets = {};
        for (const key of step.requiredSecrets) {
            if (secrets[key]) filteredSecrets[key] = secrets[key];
        }
    }
    // Optionally inject secrets as environment variables
    if (options.injectToEnv) {
        for (const [key, value] of Object.entries(filteredSecrets)) {
            process.env[key] = value;
        }
    }
    // Optionally mask secrets for logging
    if (options.maskForLogging) {
        step.context.secrets = Object.fromEntries(
            Object.entries(filteredSecrets).map(([k, v]) => [k, v ? '***' : v])
        );
    } else {
        step.context.secrets = { ...filteredSecrets };
    }
    return step;
}