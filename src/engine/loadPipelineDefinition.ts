import Ajv from 'ajv';

const pipelineSchema = {
    type: 'object',
    properties: {
        steps: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
    },
    required: ['steps'],
};

export function loadPipelineDefinition(definition: any) {
    const ajv = new Ajv();
    const validate = ajv.compile(pipelineSchema);
    if (!validate(definition)) {
        console.error('Invalid pipeline definition:', validate.errors);
        throw new Error('Pipeline definition schema validation failed');
    }
    return definition;
}