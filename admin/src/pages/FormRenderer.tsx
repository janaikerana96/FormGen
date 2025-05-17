"use client"

import { Alert, Box, CircularProgress } from "@mui/material"
import { Form } from "@rjsf/mui"
import validator from "@rjsf/validator-ajv8"
import { useState } from "react"
import { ExternalSourceSelectWidget, ExternalValidationWidget } from "../components/RJSFCustomWidgets"

interface FormRendererProps {
  schemaJson: string
  onSubmit?: (data: Record<string, any>) => void
}

export const FormRenderer = ({ schemaJson, onSubmit }: FormRendererProps) => {
  const [error, setError] = useState<string | null>(null)
  const [schema, setSchema] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Definir widgets personalizados
  const widgets = {
    ExternalSourceSelectWidget,
    ExternalValidationWidget,
  }

  // Função para gerar uiSchema com base no schema
  const generateUiSchema = () => {
    if (!schema || !schema.properties) return {}

    const uiSchema: Record<string, any> = {}

    // Percorrer as propriedades do schema
    Object.entries(schema.properties).forEach(([fieldName, fieldSchema]: [string, any]) => {
      // Verificar se o campo tem fonte externa
      if (fieldSchema["x-externalSource"]?.enabled) {
        if (!uiSchema[fieldName]) uiSchema[fieldName] = {}
        uiSchema[fieldName]["ui:widget"] = "ExternalSourceSelectWidget"
      }

      // Verificar se o campo tem validação externa
      if (fieldSchema["x-validation"]?.externalSource?.enabled) {
        if (!uiSchema[fieldName]) uiSchema[fieldName] = {}
        uiSchema[fieldName]["ui:widget"] = "ExternalValidationWidget"
      }

      // Adicionar placeholders
      if (fieldSchema.placeholder) {
        if (!uiSchema[fieldName]) uiSchema[fieldName] = {}
        uiSchema[fieldName]["ui:placeholder"] = fieldSchema.placeholder
      }
    })

    return uiSchema
  }

  // Processar o schema JSON
  useState(() => {
    try {
      const parsedSchema = JSON.parse(schemaJson)
      setSchema(parsedSchema)
      setError(null)
    } catch (err) {
      setError(`Erro ao processar o schema: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsLoading(false)
    }
  })

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return (
    <Box>
      <Form
        schema={schema}
        uiSchema={generateUiSchema()}
        widgets={widgets}
        validator={validator}
        onSubmit={({ formData }) => onSubmit && onSubmit(formData)}
      />
    </Box>
  )
}
