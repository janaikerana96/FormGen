import type { RJSFSchema } from "@rjsf/utils"
import type { FormField, FormSchema, JsonSchema } from "../types"

// Função para converter JSON Schema para nosso formato interno
export const convertJsonSchemaToInternal = (json: any): FormSchema => {
  if (json?.isMultiStep && Array.isArray(json.steps)) {
    return {
      id: Date.now().toString(),
      title: json.title || 'Formulário Multi-etapas',
      description: json.description || '',
      isMultiStep: true,
      fields: [],
      steps: json.steps.map((s: any, index: number) => ({
        id: s.id || `step-${index}-${Date.now()}`,
        title: s.title || `Etapa ${index + 1}`,
        schema: s.schema || { type: 'object', properties: {} },
      })),
    };
  }

  // Simples
  const fields: FormField[] = Object.entries(json.properties || {}).map(([name, def]: any) => ({
    id: Date.now().toString(),
    name,
    type: def.type || 'string',
    label: def.title || name,
    placeholder: def.placeholder || '',
    options: def.enum || [],
    required: (json.required || []).includes(name),
  }));

  return {
    id: Date.now().toString(),
    title: json.title || 'Formulário',
    description: json.description || '',
    isMultiStep: false,
    fields,
  };
};

// Função para converter nosso formato interno para JSON Schema
export const convertInternalToJsonSchema = (form: FormSchema): JsonSchema => {
  const schema: JsonSchema = {
    $id: `${Date.now()}`,
    type: 'object',
    title: form.title,
    description: form.description,
    properties: {},
    required: [],
  };

  for (const field of form.fields) {
    const fieldSchema: any = {
      type: field.type || 'string',
      title: field.label,
      placeholder: field.placeholder,
    };

    // Adiciona validações
    if (field.validation) {
      const v = field.validation;
      if (v.pattern) fieldSchema.pattern = v.pattern;
      if (v.min !== undefined) fieldSchema.minimum = v.min;
      if (v.max !== undefined) fieldSchema.maximum = v.max;
      if (v.minLength !== undefined) fieldSchema.minLength = v.minLength;
      if (v.maxLength !== undefined) fieldSchema.maxLength = v.maxLength;
    }

    // Adiciona opções (enum)
    if (field.options && field.options.length > 0) {
      fieldSchema.enum = field.options.map(opt => opt.value);
      fieldSchema.enumNames = field.options.map(opt => opt.label);
    }

    // Adiciona metadados da fonte externa
    if (field.externalSource?.enabled) {
      fieldSchema["x-externalSource"] = {
        endpoint: field.externalSource.endpoint,
        method: field.externalSource.method,
        headers: field.externalSource.headers,
        requestParams: field.externalSource.requestParams,
        authKey: field.externalSource.authKey,
        responseMapping: field.externalSource.responseMapping,
      };
    }

    schema.properties[field.name] = fieldSchema;

    if (field.required) {
      schema.required?.push(field.name);
    }
  }

  return schema;
};