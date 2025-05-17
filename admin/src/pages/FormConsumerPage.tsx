"use client"

import type React from "react"

import { ArrowBack as ArrowBackIcon } from "@mui/icons-material"
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material"
import { Form } from "@rjsf/mui"
import validator from "@rjsf/validator-ajv8"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { MultiStepFormRenderer } from "../components/MultiStepFormRenderer"
import { ExternalSourceSelectWidget, ExternalValidationWidget } from "../components/RJSFCustomWidgets"


export const FormConsumerPage = () => {
  const [schemaUrl, setSchemaUrl] = useState("")
  const [schema, setSchema] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Adicione estes estados no componente FormConsumerPage, junto com os outros estados
  const [importMethod, setImportMethod] = useState<"url" | "file" | "text">("url")
  const [importText, setImportText] = useState("")
  const [importFile, setImportFile] = useState<File | null>(null)

  // Definir widgets personalizados
  const widgets = {
    ExternalSourceSelectWidget,
    ExternalValidationWidget,
  }

  // Dentro do componente, adicione:
  const navigate = useNavigate()

  // Função para carregar o schema de uma URL
  const loadSchema = async () => {
    if (!schemaUrl) {
      setError("URL não pode ser vazia")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setSchema(null)
      setFormData(null)
      setIsSubmitted(false)

      const response = await fetch(schemaUrl)
      if (!response.ok) {
        throw new Error(`Erro ao buscar schema: ${response.statusText}`)
      }

      const jsonSchema = await response.json()
      setSchema(jsonSchema)
      setIsLoading(false)
    } catch (err) {
      setError(`Erro ao carregar schema: ${err instanceof Error ? err.message : String(err)}`)
      setIsLoading(false)
    }
  }

  // Adicione estas funções para carregar de arquivo e texto
  // Função para carregar o schema de um arquivo
  const loadSchemaFromFile = async () => {
    if (!importFile) {
      setError("Nenhum arquivo selecionado")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setSchema(null)
      setFormData(null)
      setIsSubmitted(false)

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          if (e.target?.result) {
            const jsonSchema = JSON.parse(e.target.result as string)
            setSchema(jsonSchema)
            setIsLoading(false)
          }
        } catch (err) {
          setError(`Erro ao processar arquivo JSON: ${err instanceof Error ? err.message : String(err)}`)
          setIsLoading(false)
        }
      }
      reader.onerror = () => {
        setError("Erro ao ler o arquivo")
        setIsLoading(false)
      }
      reader.readAsText(importFile)
    } catch (err) {
      setError(`Erro ao carregar schema: ${err instanceof Error ? err.message : String(err)}`)
      setIsLoading(false)
    }
  }

  // Função para carregar o schema de texto
  const loadSchemaFromText = () => {
    if (!importText) {
      setError("Texto não pode ser vazio")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setSchema(null)
      setFormData(null)
      setIsSubmitted(false)

      const jsonSchema = JSON.parse(importText)
      setSchema(jsonSchema)
      setIsLoading(false)
    } catch (err) {
      setError(`Erro ao processar JSON: ${err instanceof Error ? err.message : String(err)}`)
      setIsLoading(false)
    }
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

  // Função para lidar com o envio do formulário
  const handleSubmit = (data: any, event: React.FormEvent<any>) => {
    setFormData(data.formData)
    setIsSubmitted(true)

    // Aqui você poderia enviar os dados para uma API
    console.log("Dados do formulário:", data.formData)
  }

  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <Button onClick={() => navigate(-1)} variant="outlined" startIcon={<ArrowBackIcon />}>
          Voltar
        </Button>
        <Typography variant="h4">Renderizador de Formulários</Typography>
      </Stack>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Tabs value={importMethod} onChange={(_, newValue) => setImportMethod(newValue)} sx={{ mb: 3 }}>
          <Tab label="URL" value="url" />
          <Tab label="Arquivo" value="file" />
          <Tab label="Texto" value="text" />
        </Tabs>

        {importMethod === "url" && (
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                label="URL do Schema JSON"
                placeholder="https://exemplo.com/schema.json"
                fullWidth
                value={schemaUrl}
                onChange={(e) => setSchemaUrl(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button variant="contained" onClick={loadSchema} disabled={isLoading} fullWidth>
                {isLoading ? "Carregando..." : "Carregar Formulário"}
              </Button>
            </Grid>
          </Grid>
        )}

        {importMethod === "file" && (
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <input
                accept="application/json"
                style={{ display: "none" }}
                id="import-file-button"
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setImportFile(e.target.files[0])
                  }
                }}
              />
              <label htmlFor="import-file-button" style={{ width: "100%" }}>
                <Button variant="outlined" component="span" fullWidth>
                  {importFile ? importFile.name : "Selecionar arquivo JSON"}
                </Button>
              </label>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button variant="contained" onClick={loadSchemaFromFile} disabled={isLoading || !importFile} fullWidth>
                {isLoading ? "Carregando..." : "Carregar Formulário"}
              </Button>
            </Grid>
          </Grid>
        )}

        {importMethod === "text" && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Schema JSON"
                placeholder='{"type": "object", "properties": {...}}'
                fullWidth
                multiline
                rows={6}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={loadSchemaFromText} disabled={isLoading || !importText} fullWidth>
                {isLoading ? "Carregando..." : "Carregar Formulário"}
              </Button>
            </Grid>
          </Grid>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {schema && (
        <Paper sx={{ p: 3, mb: 4 }}>
          {schema.isMultiStep && Array.isArray(schema.steps) ? (
            <MultiStepFormRenderer schema={schema} onSubmit={(data) => handleSubmit(data, {} as React.FormEvent)} />
          ) : (
            <Form
              schema={schema}
              uiSchema={generateUiSchema()}
              widgets={widgets}
              validator={validator}
              onSubmit={handleSubmit}
            />
          )}
        </Paper>
      )}

      {isSubmitted && formData && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Dados Enviados:
          </Typography>
          <Box
            component="pre"
            sx={{
              p: 2,
              bgcolor: "grey.100",
              borderRadius: 1,
              overflow: "auto",
              maxHeight: "300px",
            }}
          >
            {JSON.stringify(formData, null, 2)}
          </Box>
        </Paper>
      )}
    </Box>
  )
}
