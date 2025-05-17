import type { RJSFSchema } from "@rjsf/utils"
import type { FormField, FormSchema } from "../types"

// Função para converter JSON Schema para nosso formato interno
export const convertJsonSchemaToInternal = (jsonSchema: RJSFSchema): FormSchema => {
  const fields: FormField[] = []
  const properties = jsonSchema.properties || {}
  const required = jsonSchema.required || []

  Object.entries(properties).forEach(([name, property]: [string, any]) => {
    const field: FormField = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      name,
      title: property.title || name,
      type: property.type || "string",
      description: property.description,
      placeholder: property.placeholder,
      default: property.default,
      format: property.format,
      required: required.includes(name),
    }

    // Adicionar validações
    if (
      property.pattern ||
      property.minimum !== undefined ||
      property.maximum !== undefined ||
      property.minLength !== undefined ||
      property.maxLength !== undefined
    ) {
      field.validation = {
        pattern: property.pattern,
        min: property.minimum,
        max: property.maximum,
        minLength: property.minLength,
        maxLength: property.maxLength,
      }
    }

    // Processar opções para campos enum
    if (property.enum) {
      field.options = property.enum.map((value: string, index: number) => ({
        value: value,
        label: property.enumNames?.[index] || value,
      }))
    }

    // Processar fonte externa para dados
    if (property["x-externalSource"]) {
      field.externalSource = {
        enabled: true,
        endpoint: property["x-externalSource"].endpoint,
        authKey: property["x-externalSource"].authKey,
        method: property["x-externalSource"].method || "GET",
        responseMapping: property["x-externalSource"].responseMapping,
        requestParams: property["x-externalSource"].requestParams,
        headers: property["x-externalSource"].headers,
      }
    }

    // Processar fonte externa para validação
    if (property["x-validation"]?.externalSource) {
      if (!field.validation) field.validation = {}
      field.validation.externalSource = {
        enabled: true,
        endpoint: property["x-validation"].externalSource.endpoint,
        authKey: property["x-validation"].externalSource.authKey,
        method: property["x-validation"].externalSource.method || "GET",
        requestParams: property["x-validation"].externalSource.requestParams,
        headers: property["x-validation"].externalSource.headers,
      }
    }

    fields.push(field)
  })

  return {
    id: jsonSchema.$id || Date.now().toString(),
    title: jsonSchema.title || "Formulário",
    description: jsonSchema.description,
    fields,
  }
}

// Função para converter nosso formato interno para JSON Schema
export const convertInternalToJsonSchema = (formSchema: FormSchema): RJSFSchema => {
  const properties: Record<string, any> = {}
  const required: string[] = []
  const uiSchema: Record<string, any> = {}

  formSchema.fields.forEach((field: FormField) => {
    // Verificar se o campo é obrigatório
    if (field.required) {
      required.push(field.name)
    }

    const fieldSchema: Record<string, any> = {
      type: field.type,
      title: field.title,
    }

    if (field.description) fieldSchema.description = field.description
    if (field.default !== undefined) fieldSchema.default = field.default
    if (field.format) fieldSchema.format = field.format
    if (field.placeholder) fieldSchema.placeholder = field.placeholder

    // Adicionar validações
    if (field.validation) {
      if (field.validation.pattern) fieldSchema.pattern = field.validation.pattern
      if (field.validation.min !== undefined) fieldSchema.minimum = field.validation.min
      if (field.validation.max !== undefined) fieldSchema.maximum = field.validation.max
      if (field.validation.minLength !== undefined) fieldSchema.minLength = field.validation.minLength
      if (field.validation.maxLength !== undefined) fieldSchema.maxLength = field.validation.maxLength

      // Adicionar validação externa
      if (field.validation.externalSource?.enabled) {
        fieldSchema["x-validation"] = {
          externalSource: {
            endpoint: field.validation.externalSource.endpoint,
            authKey: field.validation.externalSource.authKey,
            method: field.validation.externalSource.method,
            requestParams: field.validation.externalSource.requestParams,
            headers: field.validation.externalSource.headers,
          },
        }
      }
    }

    // Adicionar opções para campos enum
    if (field.options && field.options.length > 0) {
      fieldSchema.enum = field.options.map((opt) => opt.value)
      fieldSchema.enumNames = field.options.map((opt) => opt.label)
    }

    // Adicionar informações sobre fonte externa como metadados
    if (field.externalSource?.enabled) {
      fieldSchema["x-externalSource"] = {
        endpoint: field.externalSource.endpoint,
        authKey: field.externalSource.authKey,
        method: field.externalSource.method,
        responseMapping: field.externalSource.responseMapping,
        requestParams: field.externalSource.requestParams,
        headers: field.externalSource.headers,
      }
    }

    properties[field.name] = fieldSchema

    // Configurações de UI específicas
    if (field.placeholder) {
      if (!uiSchema[field.name]) uiSchema[field.name] = {}
      uiSchema[field.name]["ui:placeholder"] = field.placeholder
    }
  })

  return {
    type: "object",
    $id: formSchema.id,
    title: formSchema.title,
    description: formSchema.description,
    properties,
    required: required.length > 0 ? required : undefined,
  }
}
