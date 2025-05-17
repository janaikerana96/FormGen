// Tipos para o nosso form builder
export interface ExternalDataSource {
  enabled: boolean
  endpoint: string
  authKey?: string
  method?: "GET" | "POST"
  responseMapping?: {
    valueField: string
    labelField: string
  }
  requestParams?: Record<string, string>
  headers?: Record<string, string>
}

export interface FormField {
  id: string
  type: "string" | "number" | "boolean" | "array" | "object"
  format?: "date" | "date-time" | "email" | "uri" | "regex"
  title: string
  name: string
  description?: string
  placeholder?: string
  default?: any
  required?: boolean
  options?: { label: string; value: string }[]
  externalSource?: ExternalDataSource
  validation?: {
    externalSource?: ExternalDataSource
    pattern?: string
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
  }
}

// Adicione os tipos para suportar formulários multi-etapas
export interface FormStep {
  id: string
  title: string
  schema: any // O schema JSON original para esta etapa
}

// Atualize a interface FormSchema para incluir suporte a steps
export interface FormSchema {
  id: string
  title: string
  description?: string
  fields: FormField[]
  isMultiStep?: boolean
  steps?: FormStep[]
}

// Interface para autenticações
export interface ApiAuth {
  id: string
  name: string
  type: "api_key" | "oauth" | "basic"
  key: string
  secret?: string
  endpoint: string
  description: string
  status: "active" | "inactive"
}
