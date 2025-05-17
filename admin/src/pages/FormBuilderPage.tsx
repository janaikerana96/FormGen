'use client';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MultiStepWizardBuilder } from '../components/MultiStepWizardBuilder';
import type { ApiAuth, ExternalDataSource, FormField, FormSchema } from '../types';
import {
  convertInternalToJsonSchema,
  convertJsonSchemaToInternal,
} from '../utils/schema-converter';

// Material UI imports
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayArrowIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

// React JSON Schema Form
import { ArrowDropDownIcon } from '@mui/x-date-pickers/icons';
import type { Step } from '../components/MultiStepWizardBuilder';
import { FormFieldEditor } from '../components/FormFieldEditor';
import { FormPreviewDialog } from '../components/FormPreviewDialog';
import { ImportSchemaDialog } from '../components/ImportSchemaDialog';
import { MultiStepFormRenderer } from '../components/MultiStepFormRenderer';
export const FormBuilderPage = () => {
  const [isMultiStep, setIsMultiStep] = useState(false);
  const [multiSteps, setMultiSteps] = useState<Step[]>([]);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [stepCurrentField, setStepCurrentField] = useState<FormField | null>(null);
  const [stepFieldEditorOpen, setStepFieldEditorOpen] = useState(false);

  const [activeTab, setActiveTab] = useState(0);
  const [forms, setForms] = useState<FormSchema[]>([]);
  const [currentForm, setCurrentForm] = useState<FormSchema | null>(null);
  const [isEditingField, setIsEditingField] = useState(false);
  const [currentField, setCurrentField] = useState<FormField | null>(null);
  const [formPreview, setFormPreview] = useState<FormSchema | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [apiAuths, setApiAuths] = useState<ApiAuth[]>([]);
  const [isTestingExternalSource, setIsTestingExternalSource] = useState(false);
  const [externalSourceTestResults, setExternalSourceTestResults] = useState<any>(null);

  // Adicione estes estados no componente FormBuilderPage, junto com os outros estados
  const [importMethod, setImportMethod] = useState<'url' | 'file' | 'text'>('url');
  const [importText, setImportText] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  // Adicione este estado para controlar como importar múltiplos schemas
  const [importAsSteps, setImportAsSteps] = useState(false);

  const navigate = useNavigate();

  /*** Funções para editar campos do step multi-etapa */
  const handleEditStepFields = (idx: number) => {
    setEditingStepIndex(idx);
    setStepCurrentField(null);
    setStepFieldEditorOpen(false);
  };

  const handleAddFieldToStep = () => {
    setStepCurrentField({
      id: Date.now().toString(),
      type: 'string',
      title: 'Novo Campo',
      name: `field_${Date.now()}`,
    });
    setStepFieldEditorOpen(true);
  };

  const handleEditFieldInStep = (field: FormField) => {
    setStepCurrentField(field);
    setStepFieldEditorOpen(true);
  };

  const handleSaveFieldToStep = (field: FormField) => {
    if (editingStepIndex === null) return;

    const currentStep = multiSteps[editingStepIndex];
    const currentFields = Object.entries(currentStep.schema.properties || {}).map(
      ([name, schema]: [string, any]) => ({
        ...schema,
        name,
      })
    );

    let updatedFields;
    if (currentFields.some((f) => f.id === field.id)) {
      // Editar
      updatedFields = currentFields.map((f) => (f.id === field.id ? field : f));
    } else {
      // Novo
      updatedFields = [...currentFields, field];
    }

    const updatedStep = {
      ...currentStep,
      schema: {
        ...currentStep.schema,
        properties: Object.fromEntries(updatedFields.map((f) => [f.name, { ...f }])),
      },
    };

    const updatedSteps = [...multiSteps];
    updatedSteps[editingStepIndex] = updatedStep;
    setMultiSteps(updatedSteps);

    setStepFieldEditorOpen(false);
    setStepCurrentField(null);
  };

  /*** Fim das funções para editar campos do step multi-etapa */


  // Carregar formulários e autenticações ao montar o componente
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Aqui você faria chamadas para suas APIs Strapi
        // const formsResponse = await fetch('/api/form-schemas');
        // const formsData = await formsResponse.json();
        // setForms(formsData.map(schema => convertJsonSchemaToInternal(schema)));

        // const authsResponse = await fetch('/api/authentications');
        // const authsData = await authsResponse.json();
        // setApiAuths(authsData);

        // Por enquanto, vamos simular com dados de exemplo
        setTimeout(() => {
          setForms([
            {
              id: '1',
              title: 'Formulário de Cadastro',
              description: 'Formulário para cadastro de usuários',
              fields: [
                {
                  id: 'field1',
                  name: 'name',
                  title: 'Nome Completo',
                  type: 'string',
                  placeholder: 'Digite seu nome completo',
                  required: true,
                },
                {
                  id: 'field2',
                  name: 'email',
                  title: 'Email',
                  type: 'string',
                  format: 'email',
                  placeholder: 'seu@email.com',
                  required: true,
                },
                {
                  id: 'field3',
                  name: 'cae',
                  title: 'Código CAE',
                  type: 'string',
                  placeholder: 'Selecione o código CAE',
                  externalSource: {
                    enabled: true,
                    endpoint: 'https://api.exemplo.com/cae',
                    authKey: 'cae-api',
                    method: 'GET',
                    responseMapping: {
                      valueField: 'code',
                      labelField: 'description',
                    },
                  },
                },
              ],
            },
          ]);

          setApiAuths([
            {
              id: '1',
              name: 'API NIF',
              type: 'api_key',
              key: 'nif-api-key-123',
              endpoint: 'https://api.exemplo.com/nif',
              description: 'API para consulta de dados de NIF',
              status: 'active',
            },
            {
              id: '2',
              name: 'API CAE',
              type: 'api_key',
              key: 'cae-api-key-456',
              endpoint: 'https://api.exemplo.com/cae',
              description: 'API para consulta de códigos CAE',
              status: 'active',
            },
          ]);

          setIsLoading(false);
        }, 1000);
      } catch (err) {
        setError('Erro ao carregar dados');
        setIsLoading(false);
        console.error(err);
      }
    };

    loadData();
  }, []);

  // Função para importar schema de uma URL
  const importSchemaFromUrl = async () => {
    if (!importUrl) {
      setError('URL não pode ser vazia');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(importUrl);
      if (!response.ok) {
        throw new Error(`Erro ao buscar schema: ${response.statusText}`);
      }

      const jsonSchema = await response.json();

      // Verificar se é um array ou um objeto único
      const schemaArray = Array.isArray(jsonSchema) ? jsonSchema : [jsonSchema];

      if (importAsSteps && schemaArray.length > 1) {
        // Importar como um formulário de steps (mesmo código de acima)
        const combinedSchema = {
          id: Date.now().toString(),
          title: 'Formulário Multi-etapas',
          description: 'Formulário com múltiplas etapas',
          isMultiStep: true,
          steps: schemaArray.map((schema, index) => ({
            id: `step-${index}`,
            title: schema.title || `Etapa ${index + 1}`,
            schema: schema,
          })),
          fields: [],
        };

        setForms([...forms, combinedSchema]);
        setCurrentForm(combinedSchema);
      } else {
        // Importar como formulários separados
        const newForms = schemaArray.map((schema) => convertJsonSchemaToInternal(schema));
        setForms([...forms, ...newForms]);

        if (newForms.length > 0) {
          setCurrentForm(newForms[0]);
        }
      }

      setActiveTab(1);
      setIsImportModalOpen(false);
      setImportUrl('');
      setIsLoading(false);
    } catch (err) {
      setError(`Erro ao importar schema: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  };

  // Função para importar schema de um arquivo
  const importSchemaFromFile = async () => {
    if (!importFile) {
      setError('Nenhum arquivo selecionado');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (e.target?.result) {
            const jsonSchema = JSON.parse(e.target.result as string);

            // 👉 Checar multistep
            if (jsonSchema.isMultiStep && jsonSchema.steps) {
              setForms([...forms, jsonSchema]);
              setCurrentForm(jsonSchema);
              setActiveTab(1);
              setIsImportModalOpen(false);
              setImportFile(null);
              setIsLoading(false);
              return;
            }

            // Continua o fluxo normal para forms simples
            const internalSchema = convertJsonSchemaToInternal(jsonSchema);
            setForms([...forms, internalSchema]);
            setCurrentForm(internalSchema);
            setActiveTab(1);
            setIsImportModalOpen(false);
            setImportFile(null);
            setIsLoading(false);
          }
        } catch (err) {
          setError(
            `Erro ao processar arquivo JSON: ${err instanceof Error ? err.message : String(err)}`
          );
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        setError('Erro ao ler o arquivo');
        setIsLoading(false);
      };
      reader.readAsText(importFile);
    } catch (err) {
      setError(`Erro ao importar schema: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  };

  // Função para importar schema de texto
  const importSchemaFromText = () => {
    if (!importText) {
      setError('Texto não pode ser vazio');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const parsedData = JSON.parse(importText);
      if (parsedData.isMultiStep && parsedData.steps) {
        setForms([...forms, parsedData]);
        setCurrentForm(parsedData);
        setActiveTab(1);
        setIsImportModalOpen(false);
        setImportText('');
        setIsLoading(false);
        return;
      }

      // Verificar se é um array ou um objeto único
      const schemaArray = Array.isArray(parsedData) ? parsedData : [parsedData];

      if (importAsSteps && schemaArray.length > 1) {
        // Importar como um formulário de steps
        // Combinar os schemas em um único formulário com steps
        const combinedSchema = {
          id: Date.now().toString(),
          title: 'Formulário Multi-etapas',
          description: 'Formulário com múltiplas etapas',
          isMultiStep: true,
          steps: schemaArray.map((schema, index) => ({
            id: `step-${index}`,
            title: schema.title || `Etapa ${index + 1}`,
            schema: schema,
          })),
          fields: [], // Campos serão gerenciados por etapa
        };

        setForms([...forms, combinedSchema]);
        setCurrentForm(combinedSchema);
      } else {
        // Importar como formulários separados
        const newForms = schemaArray.map((jsonSchema) => {
          return convertJsonSchemaToInternal(jsonSchema);
        });

        setForms([...forms, ...newForms]);

        // Definir o primeiro schema como atual se houver algum
        if (newForms.length > 0) {
          setCurrentForm(newForms[0]);
        }
      }

      setActiveTab(1);
      setIsImportModalOpen(false);
      setImportText('');
      setIsLoading(false);
    } catch (err) {
      setError(`Erro ao processar JSON: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  };

  // Função para criar um novo formulário
  const createNewForm = () => {
    const newForm: FormSchema = {
      id: Date.now().toString(),
      title: 'Novo Formulário',
      description: 'Descrição do formulário',
      fields: [],
    };
    setForms([...forms, newForm]);
    setCurrentForm(newForm);
    setActiveTab(1); // Muda para a aba de edição
  };

  // Função para adicionar um novo campo ao formulário atual
  const addNewField = () => {
    if (!currentForm) return;

    const newField: FormField = {
      id: Date.now().toString(),
      type: 'string',
      title: 'Novo Campo',
      name: `field_${Date.now()}`,
      placeholder: 'Digite aqui',
    };

    const updatedForm = {
      ...currentForm,
      fields: [...currentForm.fields, newField],
    };

    setCurrentForm(updatedForm);
    updateFormInList(updatedForm);
    setCurrentField(newField);
    setIsEditingField(true);
  };

  // Função para atualizar o formulário na lista
  const updateFormInList = (updatedForm: FormSchema) => {
    const updatedForms = forms.map((form) => (form.id === updatedForm.id ? updatedForm : form));
    setForms(updatedForms);
  };

  // Função para salvar as alterações do campo
  const saveField = (field: FormField) => {
    if (!currentForm) return;

    const updatedFields = currentField
      ? currentForm.fields.map((f) => (f.id === field.id ? field : f))
      : [...currentForm.fields, field];

    const updatedForm = {
      ...currentForm,
      fields: updatedFields,
    };

    setCurrentForm(updatedForm);
    updateFormInList(updatedForm);
    setIsEditingField(false);
    setCurrentField(null);
  };

  // Função para remover um campo
  const removeField = (fieldId: string) => {
    if (!currentForm) return;

    const updatedFields = currentForm.fields.filter((f) => f.id !== fieldId);
    const updatedForm = {
      ...currentForm,
      fields: updatedFields,
    };

    setCurrentForm(updatedForm);
    updateFormInList(updatedForm);
  };

  // Função para salvar o formulário na API
  const saveFormToApi = async () => {
    if (!currentForm) return;

    try {
      setIsLoading(true);
      setError(null);

      let finalForm: FormSchema;

      if (isMultiStep) {
        // Se for multi-step, salva steps, limpa fields
        finalForm = {
          ...currentForm,
          isMultiStep: true,
          steps: multiSteps.map((step, i) => ({
            ...step,
            id: step.id ?? `step-${i + 1}`,
          })),

          fields: [],
        };
      } else {
        // Se for single, salva fields, limpa steps
        finalForm = {
          ...currentForm,
          isMultiStep: false,
          fields: currentForm.fields || [],
          steps: [],
        };
      }

      // Atualiza o estado antes de converter e salvar
      setCurrentForm(finalForm);
      updateFormInList(finalForm);

      const jsonSchema = convertInternalToJsonSchema(finalForm);

      // Aqui você faria a chamada real para a API Strapi
      // const response = await fetch('/api/form-schemas', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(jsonSchema)
      // });

      // if (!response.ok) {
      //   throw new Error(`Erro ao salvar: ${response.statusText}`);
      // }

      // Simulando uma resposta bem-sucedida
      setTimeout(() => {
        setIsLoading(false);
        // Mostrar mensagem de sucesso ou redirecionar
      }, 1000);
    } catch (err) {
      setError(`Erro ao salvar formulário: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  };


  // Função para exportar o schema do formulário
  const exportFormSchema = () => {
    if (!currentForm) return;

    const jsonSchema = convertInternalToJsonSchema(currentForm);
    const schema = JSON.stringify(jsonSchema, null, 2);
    const blob = new Blob([schema], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentForm.title.toLowerCase().replace(/\s+/g, '-')}-schema.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  // Função para abrir o preview do formulário
  const openFormPreview = () => {
    setFormPreview(currentForm);
    setIsPreviewOpen(true);
  };

  // Função para testar uma fonte de dados externa
  const testExternalSource = async (externalSource: ExternalDataSource) => {
    try {
      setIsLoading(true);
      setError(null);
      setIsTestingExternalSource(true);
      setExternalSourceTestResults(null);

      // Encontrar a autenticação correspondente
      const auth = apiAuths.find(
        (a) => a.id === externalSource.authKey || a.name === externalSource.authKey
      );

      // Configurar headers com a autenticação
      const headers: Record<string, string> = {
        ...(externalSource.headers || {}),
      };

      if (auth) {
        if (auth.type === 'api_key') {
          headers['X-API-Key'] = auth.key;
        } else if (auth.type === 'basic') {
          const basicAuth = btoa(`${auth.key}:${auth.secret || ''}`);
          headers['Authorization'] = `Basic ${basicAuth}`;
        } else if (auth.type === 'oauth') {
          headers['Authorization'] = `Bearer ${auth.key}`;
        }
      }

      // Simulando uma resposta bem-sucedida
      setTimeout(() => {
        // Dados simulados para teste
        const mockData = [
          { code: '01110', description: 'Cultivo de cereais' },
          { code: '01120', description: 'Cultivo de leguminosas' },
          { code: '01130', description: 'Cultivo de produtos hortícolas' },
          { code: '01210', description: 'Viticultura' },
          { code: '01220', description: 'Cultivo de frutos tropicais' },
        ];

        setExternalSourceTestResults(mockData);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError(`Erro ao testar fonte externa: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  };

  // Função para criar um objeto ExternalDataSource com valores padrão
  const createDefaultExternalSource = (): ExternalDataSource => {
    return {
      enabled: true,
      endpoint: '',
      method: 'GET',
      responseMapping: {
        valueField: '',
        labelField: '',
      },
    };
  };

  const exemplos = [
    { nome: 'Formulário Simples', arquivo: '/exemplos/form-simples.json' },
    { nome: 'Campos Booleanos e Arrays', arquivo: '/exemplos/form-booleans-arrays.json' },
    { nome: 'Objeto Aninhado (Documentos)', arquivo: '/exemplos/form-object-aninhado.json' },
    {
      nome: 'Validação Externa Multi-Step (NIF)',
      arquivo: '/exemplos/form-multistep-validation-external.json',
    },
    {
      nome: 'Renovação de Documento',
      arquivo: '/exemplos/form-multistep-renovacao-documento.json',
    },
    { nome: 'Pedido de Subsídio', arquivo: '/exemplos/form-multistep-pedido-subsidio.json' },
    {
      nome: 'External Mapping Multi-Step',
      arquivo: '/exemplos/form-multistep-external-mapping.json',
    },
    { nome: 'External Source Multi-Step', arquivo: '/exemplos/form-multistep-external.json' },
    {
      nome: 'Arrays de Objetos Multi-Step',
      arquivo: '/exemplos/form-multistep-arrays-objects.json',
    },
    {
      nome: 'Abertura de Atividade Empresarial',
      arquivo: '/exemplos/form-multistep-abertura-atividade.json',
    },
    { nome: 'Multi-Step Básico', arquivo: '/exemplos/form-multistep.json' },
    { nome: 'External Mapping Único', arquivo: '/exemplos/form-external-mapping.json' },
    { nome: 'External Source Único', arquivo: '/exemplos/form-external.json' },
  ];

  function BaixarExemploButton() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => setAnchorEl(null);

    const handleDownload = (arquivo: string) => {
      window.open(arquivo, '_blank');
      handleClose();
    };

    return (
      <>
        <Tooltip title="Baixe um exemplo de formulário">
        <Button variant="outlined" endIcon={<ArrowDropDownIcon />} onClick={handleClick}>
          Exemplos
        </Button>
        </Tooltip>
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          {exemplos.map((ex) => (
            <MenuItem key={ex.arquivo} onClick={() => handleDownload(ex.arquivo)}>
              {ex.nome}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  if (isLoading && forms.length === 0) {
    return (
      /*  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box> */

      <Box sx={{ p: 4 }}>
        {[...Array(3)].map((_, idx) => (
          <Box key={idx} sx={{ mb: 3 }}>
            <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: 2 }} />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <Button onClick={() => navigate(-1)} variant="outlined" startIcon={<ArrowBackIcon />}>
          Voltar
        </Button>
        <Typography variant="h6" fontWeight="bold">
          Construtor de Formulários
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 4 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Lista de Formulários" />
          {currentForm && <Tab label="Editor de Formulário" />}
        </Tabs>

        {activeTab === 0 && (
          <Box sx={{ p: 4 }}>
            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
              <Tooltip title="Crie um novo formulário">
              <Button startIcon={<AddIcon />} variant="contained" onClick={createNewForm}>
                Criar Novo Formulário
              </Button>
              </Tooltip>
              <Tooltip title="Importe um schema de formulário">
              <Button
                startIcon={<UploadIcon />}
                variant="outlined"
                onClick={() => setIsImportModalOpen(true)}
              >
                Importar Schema
              </Button>
              </Tooltip>
              <BaixarExemploButton />
            </Stack>

            <Grid container spacing={4}>
              {(forms || []).map((form) => (
                <Grid item key={form.id} xs={12} sm={6} md={4}>
                  <Card>
                    <CardHeader title={form.title} subheader={form.description} />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        {form.isMultiStep
                          ? form.steps?.reduce(
                              (acc, step) =>
                                acc + Object.keys(step.schema?.properties || {}).length,
                              0
                            )
                          : form.fields?.length || 0}{' '}
                        campos definidos
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => {
                          setCurrentForm(form);
                          setActiveTab(1);
                        }}
                      >
                        Editar
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {activeTab === 1 && currentForm && (
          <Box sx={{ p: 4 }}>
            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Título do Formulário"
                  fullWidth
                  value={currentForm.title}
                  onChange={(e) => {
                    const updatedForm = {
                      ...currentForm,
                      title: e.target.value,
                    };
                    setCurrentForm(updatedForm);
                    updateFormInList(updatedForm);
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Descrição"
                  fullWidth
                  value={currentForm.description || ''}
                  onChange={(e) => {
                    const updatedForm = {
                      ...currentForm,
                      description: e.target.value,
                    };
                    setCurrentForm(updatedForm);
                    updateFormInList(updatedForm);
                  }}
                />
              </Grid>
            </Grid>

            <FormControlLabel
              control={
                <Switch checked={isMultiStep} onChange={(e) => setIsMultiStep(e.target.checked)} />
              }
              label="Formulário multi-etapas"
            />

            {isMultiStep ? (
              <>
              <MultiStepWizardBuilder
                steps={multiSteps}
                onChange={setMultiSteps}
                onEditStepFields={handleEditStepFields}
              />

                {isMultiStep && multiSteps.length === 0 && (
                <Typography color="text.secondary" sx={{ mt: 2, mb: 2 }}>
                  Nenhuma etapa criada. Clique em "Nova Etapa" para começar!
                </Typography>
                )}

              {editingStepIndex !== null && (
                <Box sx={{ mt: 2, mb: 2, border: "1px solid #ddd", borderRadius: 2, p: 2, background: "#f6f8fa" }}>
                  <Typography variant="h6" gutterBottom>
                    Campos da Etapa: {multiSteps[editingStepIndex].title}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Button variant="contained" onClick={handleAddFieldToStep}>
                      Adicionar Campo
                    </Button>
                    <Button variant="outlined" onClick={() => setEditingStepIndex(null)}>
                      Fechar
                    </Button>
                  </Stack>
                  {(Object.entries(multiSteps[editingStepIndex].schema?.properties || {})).length === 0 ? (
                    <Typography variant="body2">Nenhum campo definido.</Typography>
                  ) : (
                    Object.entries(multiSteps[editingStepIndex].schema?.properties || {}).map(([fieldName, fieldSchema]: [string, any]) => (
                      <Box key={fieldSchema.id} sx={{ mb: 1, p: 1, border: "1px solid #eee", borderRadius: 1, background: "#fff" }}>
                        <Typography variant="subtitle2">
                          {fieldSchema.title} <small>({fieldSchema.type})</small>
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Button size="small" variant="outlined" onClick={() => handleEditFieldInStep({ ...fieldSchema, name: fieldName })}>
                            Editar
                          </Button>
                          <Button size="small" variant="outlined" color="error"
                            onClick={() => {
                              // Remove o campo
                              const step = multiSteps[editingStepIndex];
                              const newFields = Object.entries(step.schema?.properties || {}).filter(([k]) => k !== fieldName);
                              const updatedStep = {
                                ...step,
                                schema: {
                                  ...step.schema,
                                  properties: Object.fromEntries(newFields),
                                }
                              };
                              const updatedSteps = [...multiSteps];
                              updatedSteps[editingStepIndex] = updatedStep;
                              setMultiSteps(updatedSteps);
                            }}
                          >
                            Remover
                          </Button>
                        </Stack>
                      </Box>
                    ))
                  )}
                  {/* FieldEditor modal abaixo */}
                  <FormFieldEditor
                    open={stepFieldEditorOpen}
                    field={stepCurrentField}
                    apiAuths={apiAuths}
                    isLoading={isLoading}
                    isTestingExternalSource={isTestingExternalSource}
                    externalSourceTestResults={externalSourceTestResults}
                    onChange={setStepCurrentField}
                    onClose={() => setStepFieldEditorOpen(false)}
                    onSave={() => stepCurrentField && handleSaveFieldToStep(stepCurrentField)}
                    onTestExternalSource={testExternalSource}
                  />
                </Box>
              )}

              {isMultiStep && multiSteps.length > 0 && (
                <Accordion sx={{ mt: 4 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Previsualização do Formulário Multi-Etapas</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <MultiStepFormRenderer
                      schema={{
                        isMultiStep: true,
                        steps: multiSteps,
                      }}
                      onSubmit={data => {
                      }}
                    />
                  </AccordionDetails>
                </Accordion>
              )}
             </>
            ) : (
              <>
                <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                <Tooltip title="Adicione um novo campo nesta etapa">
                  <Button startIcon={<AddIcon />} variant="contained" onClick={addNewField}>
                    Adicionar Campo
                  </Button>
                  </Tooltip>
                  <Tooltip title="Salve o formulário para o banco de dados">
                  <Button variant="contained" color="success" onClick={saveFormToApi} disabled={isLoading}>
                    {isLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                    {isLoading ? "Salvando..." : "Salvar Formulário"}
                  </Button>
                  </Tooltip>
                  <Tooltip title="Exporte o schema do formulário">
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={exportFormSchema}
                  >
                    Exportar Schema
                  </Button>
                  </Tooltip>
                  <Tooltip title="Visualize o formulário">
                  <Button variant="outlined" onClick={openFormPreview}>
                    Visualizar Formulário
                  </Button>
                  </Tooltip>
                </Stack>
                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                  Campos do Formulário
                </Typography>
              </>
            )}
            {!currentForm.isMultiStep &&
              (
                <>
                  {(!currentForm.fields  || currentForm.fields.length === 0) ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {/* Nenhum campo criado ainda. Clique em "Adicionar Campo" para começar! */}
                    </Typography>
                  ) : (
              currentForm.fields.map((field, index) => (
                <Accordion key={field.id} expanded={currentField?.id === field.id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      {index + 1}. {field.title} ({field.type}
                      {field.format ? ` - ${field.format}` : ''})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2">Nome do Campo: {field.name}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2">Tipo: {field.type}</Typography>
                      </Grid>
                      {field.format && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2">Formato: {field.format}</Typography>
                        </Grid>
                      )}
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2">
                          Obrigatório: {field.required ? 'Sim' : 'Não'}
                        </Typography>
                      </Grid>
                      {field.placeholder && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2">Placeholder: {field.placeholder}</Typography>
                        </Grid>
                      )}
                      {field.externalSource?.enabled && (
                        <Grid item xs={12}>
                          <Typography variant="body2">
                            Fonte Externa: {field.externalSource.endpoint}
                          </Typography>
                          <Typography variant="body2">
                            Autenticação: {field.externalSource.authKey || 'Nenhuma'}
                          </Typography>
                        </Grid>
                      )}
                      {field.validation && (
                        <Grid item xs={12}>
                          <Typography variant="body2">Validações:</Typography>
                          <ul>
                            {field.validation.pattern && (
                              <li>Padrão: {field.validation.pattern}</li>
                            )}
                            {field.validation.min !== undefined && (
                              <li>Valor mínimo: {field.validation.min}</li>
                            )}
                            {field.validation.max !== undefined && (
                              <li>Valor máximo: {field.validation.max}</li>
                            )}
                            {field.validation.minLength !== undefined && (
                              <li>Comprimento mínimo: {field.validation.minLength}</li>
                            )}
                            {field.validation.maxLength !== undefined && (
                              <li>Comprimento máximo: {field.validation.maxLength}</li>
                            )}
                            {field.validation.externalSource?.enabled &&
                              field.validation.externalSource.endpoint && (
                                <li>
                                  Validação externa: {field.validation.externalSource.endpoint}
                                </li>
                              )}
                          </ul>
                        </Grid>
                      )}
                    </Grid>
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <Tooltip title="Edite o campo">
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => {
                          setCurrentField(field);
                          setIsEditingField(true);
                        }}
                      >
                        Editar
                      </Button>
                      </Tooltip>
                      <Tooltip title="Remova o campo">
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() =>
                        {
                          if (window.confirm("Tem certeza que deseja remover este campo?")) {
                            removeField(field.id)
                          }
                        }
                        }
                      >
                        Remover
                      </Button>
                      </Tooltip>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
                 ))
                )}
              </>
            )}
            {currentForm.isMultiStep && Array.isArray(currentForm.steps) && (
              <Box sx={{ mt: 4 }}>
                {currentForm.steps.map((step, idx) => (
                  <Box key={step.id || idx} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      {step.title || `Etapa ${idx + 1}`}
                    </Typography>
                    {Object.entries(step.schema.properties || {}).map(
                      ([fieldName, fieldSchema]) => (
                        <Typography key={fieldName} variant="body2" sx={{ ml: 2 }}>
                          • <b>{(fieldSchema as any).title || fieldName}</b>{' '}
                          <i>({(fieldSchema as any).type})</i>
                        </Typography>
                      )
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Modal para edição de campo */}
      <FormFieldEditor
        open={isEditingField}
        field={currentField}
        apiAuths={apiAuths}
        isLoading={isLoading}
        isTestingExternalSource={isTestingExternalSource}
        externalSourceTestResults={externalSourceTestResults}
        onChange={setCurrentField}
        onClose={() => setIsEditingField(false)}
        onSave={() => currentField && saveField(currentField)}
        onTestExternalSource={testExternalSource}
      />

      {/* Modal para preview do formulário */}

      <FormPreviewDialog
        open={isPreviewOpen && formPreview !== null}
        formPreview={formPreview}
        onClose={() => setIsPreviewOpen(false)}
        onExport={exportFormSchema}
      />

      {/* Modal para importar schema */}

      <ImportSchemaDialog
        open={isImportModalOpen}
        importMethod={importMethod}
        importUrl={importUrl}
        importText={importText}
        importFile={importFile}
        importAsSteps={importAsSteps}
        isLoading={isLoading}
        onClose={() => setIsImportModalOpen(false)}
        onMethodChange={setImportMethod}
        onUrlChange={setImportUrl}
        onTextChange={setImportText}
        onFileChange={setImportFile}
        onAsStepsChange={setImportAsSteps}
        onImport={() => {
          if (importMethod === 'url') importSchemaFromUrl();
          else if (importMethod === 'file') importSchemaFromFile();
          else if (importMethod === 'text') importSchemaFromText();
        }}
      />
    </Box>
  );
};
