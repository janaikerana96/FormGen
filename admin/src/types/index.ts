export type JsonSchema = {
  $id?: string;
  type: 'object';
  title?: string;
  description?: string;
  required?: string[];
  properties: {
    [key: string]: any;
  };
  [key: string]: any;
};

export type ExternalDataSource = {
  enabled: boolean;
  endpoint: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  authKey?: string;
  requestParams?: Record<string, string>; // ✅ aqui
  responseMapping?: {
    valueField: string;
    labelField: string;
  };
};


export type FormField = {
  id: string;
  name: string;
  type: string;
  label: string;
  description?: string;     // ✅ adicionado
  default?: string | number | boolean; // ✅ opcionalmente, se usar valor inicial
  placeholder?: string;
  format?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    externalSource?: ExternalDataSource;
  };
  externalSource?: ExternalDataSource;
};

export type FormStep = {
  id: string;
  title: string;
  schema: JsonSchema;
};

export type FormSchema = {
  id: string | number;
  strapiId?: number;
  documentId?: string;
  title: string;
  description?: string;
  isMultiStep: boolean;
  fields: FormField[];
  steps?: FormStep[];
};

export type ApiAuth = {
  id: string;
  name: string;
  type: 'api_key' | 'basic' | 'oauth';
  key: string;
  secret?: string;
  endpoint: string;
  description: string;
  status: 'active' | 'inactive';
};
