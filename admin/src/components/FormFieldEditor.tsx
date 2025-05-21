import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Select,
  MenuItem,
  Stack,
  InputLabel,
  FormControl,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { FormField, ApiAuth, ExternalDataSource } from '../types';

interface FormFieldEditorProps {
  open: boolean;
  field: FormField | null;
  apiAuths: ApiAuth[];
  isLoading?: boolean;
  isTestingExternalSource?: boolean;
  externalSourceTestResults?: any;
  onChange: (field: FormField) => void;
  onClose: () => void;
  onSave: () => void;
  onTestExternalSource: (source: ExternalDataSource) => void;
}

export const FormFieldEditor: React.FC<FormFieldEditorProps> = ({
  open,
  field,
  apiAuths,
  isLoading = false,
  isTestingExternalSource = false,
  externalSourceTestResults = null,
  onChange,
  onClose,
  onSave,
  onTestExternalSource,
}) => {
  // Função para criar objeto ExternalSource default
  const createDefaultExternalSource = (): ExternalDataSource => ({
    enabled: true,
    endpoint: '',
    method: 'GET',
    responseMapping: {
      valueField: '',
      labelField: '',
    },
  });

  if (!field) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{field.id ? 'Editar Campo' : 'Novo Campo'}</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Título do Campo"
                fullWidth
                value={field.label}
                onChange={(e) => onChange({ ...field, label: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nome do Campo (ID)"
                fullWidth
                value={field.name}
                onChange={(e) => onChange({ ...field, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="field-type-label">Tipo de Campo</InputLabel>
                <Select
                  labelId="field-type-label"
                  label="Tipo de Campo"
                  value={field.type}
                  onChange={(e) =>
                    onChange({ ...field, type: e.target.value as FormField['type'] })
                  }
                >
                  <MenuItem value="string">Texto (string)</MenuItem>
                  <MenuItem value="number">Número (number)</MenuItem>
                  <MenuItem value="boolean">Booleano (boolean)</MenuItem>
                  <MenuItem value="array">Lista (array)</MenuItem>
                  <MenuItem value="object">Objeto (object)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {field.type === 'string' && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="field-format-label">Formato</InputLabel>
                  <Select
                    labelId="field-format-label"
                    label="Formato"
                    value={field.format || ''}
                    onChange={(e) =>
                      onChange({ ...field, format: e.target.value as FormField['format'] })
                    }
                  >
                    <MenuItem value="">Nenhum</MenuItem>
                    <MenuItem value="date">Data</MenuItem>
                    <MenuItem value="date-time">Data e Hora</MenuItem>
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="uri">URL</MenuItem>
                    <MenuItem value="regex">Regex</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                label="Descrição"
                fullWidth
                value={field.description || ''}
                onChange={(e) => onChange({ ...field, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Placeholder"
                fullWidth
                value={field.placeholder || ''}
                onChange={(e) => onChange({ ...field, placeholder: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Valor Padrão"
                fullWidth
                value={field.default || ''}
                onChange={(e) => onChange({ ...field, default: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.required || false}
                    onChange={(e) => onChange({ ...field, required: e.target.checked })}
                  />
                }
                label="Campo obrigatório"
              />
            </Grid>
            {/* Fonte de Dados Externa */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Fonte de Dados Externa</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        label="Endpoint da API"
                        fullWidth
                        value={field.externalSource?.endpoint || ''}
                        onChange={(e) => {
                          const externalSource =
                            field.externalSource || createDefaultExternalSource();
                          onChange({
                            ...field,
                            externalSource: {
                              ...externalSource,
                              endpoint: e.target.value,
                            },
                          });
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel id="external-method-label">Método</InputLabel>
                        <Select
                          labelId="external-method-label"
                          label="Método"
                          value={field.externalSource?.method || 'GET'}
                          onChange={(e) => {
                            const externalSource =
                              field.externalSource || createDefaultExternalSource();
                            onChange({
                              ...field,
                              externalSource: {
                                ...externalSource,
                                method: e.target.value as 'GET' | 'POST',
                              },
                            });
                          }}
                        >
                          <MenuItem value="GET">GET</MenuItem>
                          <MenuItem value="POST">POST</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel id="external-auth-label">Chave de Autenticação</InputLabel>
                        <Select
                          labelId="external-auth-label"
                          label="Chave de Autenticação"
                          value={field.externalSource?.authKey || ''}
                          onChange={(e) => {
                            const externalSource =
                              field.externalSource || createDefaultExternalSource();
                            onChange({
                              ...field,
                              externalSource: {
                                ...externalSource,
                                authKey: e.target.value,
                              },
                            });
                          }}
                        >
                          <MenuItem value="">Nenhuma</MenuItem>
                          {apiAuths.map((auth) => (
                            <MenuItem key={auth.id} value={auth.id}>
                              {auth.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Campo de Valor na Resposta"
                        fullWidth
                        value={field.externalSource?.responseMapping?.valueField || ''}
                        onChange={(e) => {
                          const externalSource =
                            field.externalSource || createDefaultExternalSource();
                          onChange({
                            ...field,
                            externalSource: {
                              ...externalSource,
                              responseMapping: {
                                ...externalSource.responseMapping,
                                valueField: e.target.value,
                                labelField: externalSource.responseMapping?.labelField || '',
                              },
                            },
                          });
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Campo de Rótulo na Resposta"
                        fullWidth
                        value={field.externalSource?.responseMapping?.labelField || ''}
                        onChange={(e) => {
                          const externalSource =
                            field.externalSource || createDefaultExternalSource();
                          onChange({
                            ...field,
                            externalSource: {
                              ...externalSource,
                              responseMapping: {
                                ...externalSource.responseMapping,
                                labelField: e.target.value,
                                valueField: externalSource.responseMapping?.valueField || '',
                              },
                            },
                          });
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          if (field.externalSource) {
                            onTestExternalSource(field.externalSource);
                          }
                        }}
                        disabled={isLoading || !field.externalSource}
                      >
                        Testar Fonte de Dados
                      </Button>
                    </Grid>

                    {isTestingExternalSource && externalSourceTestResults && (
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                          Resultados do Teste
                        </Typography>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Valor</TableCell>
                              <TableCell>Rótulo</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {externalSourceTestResults.map((item: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell>
                                  {
                                    item[
                                      field.externalSource?.responseMapping?.valueField || 'code'
                                    ]
                                  }
                                </TableCell>
                                <TableCell>
                                  {
                                    item[
                                      field.externalSource?.responseMapping?.labelField ||
                                        'description'
                                    ]
                                  }
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
            {/* Validações */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Validações</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    {field.type === 'string' && (
                      <>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Comprimento Mínimo"
                            type="number"
                            fullWidth
                            value={field.validation?.minLength?.toString() || ''}
                            onChange={(e) => {
                              const value = e.target.value
                                ? Number.parseInt(e.target.value)
                                : undefined;
                              onChange({
                                ...field,
                                validation: {
                                  ...field.validation,
                                  minLength: value,
                                },
                              });
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Comprimento Máximo"
                            type="number"
                            fullWidth
                            value={field.validation?.maxLength?.toString() || ''}
                            onChange={(e) => {
                              const value = e.target.value
                                ? Number.parseInt(e.target.value)
                                : undefined;
                              onChange({
                                ...field,
                                validation: {
                                  ...field.validation,
                                  maxLength: value,
                                },
                              });
                            }}
                          />
                        </Grid>
                        {field.format === 'regex' && (
                          <Grid item xs={12}>
                            <TextField
                              label="Padrão Regex"
                              fullWidth
                              value={field.validation?.pattern || ''}
                              onChange={(e) => {
                                onChange({
                                  ...field,
                                  validation: {
                                    ...field.validation,
                                    pattern: e.target.value,
                                  },
                                });
                              }}
                            />
                          </Grid>
                        )}
                      </>
                    )}

                    {field.type === 'number' && (
                      <>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Valor Mínimo"
                            type="number"
                            fullWidth
                            value={field.validation?.min?.toString() || ''}
                            onChange={(e) => {
                              const value = e.target.value
                                ? Number.parseFloat(e.target.value)
                                : undefined;
                              onChange({
                                ...field,
                                validation: {
                                  ...field.validation,
                                  min: value,
                                },
                              });
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Valor Máximo"
                            type="number"
                            fullWidth
                            value={field.validation?.max?.toString() || ''}
                            onChange={(e) => {
                              const value = e.target.value
                                ? Number.parseFloat(e.target.value)
                                : undefined;
                              onChange({
                                ...field,
                                validation: {
                                  ...field.validation,
                                  max: value,
                                },
                              });
                            }}
                          />
                        </Grid>
                      </>
                    )}

                    {/* Validação externa */}
                    <Grid item xs={12}>
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>Validação Externa</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={3}>
                            <Grid item xs={12}>
                              <TextField
                                label="Endpoint de Validação"
                                fullWidth
                                value={field.validation?.externalSource?.endpoint || ''}
                                onChange={(e) => {
                                  const validation = field.validation || {};
                                  const externalSource = validation.externalSource || {
                                    enabled: true,
                                    endpoint: '',
                                    method: 'GET', // <-- aqui
                                  };

                                  onChange({
                                    ...field,
                                    validation: {
                                      ...validation,
                                      externalSource: {
                                        ...externalSource,
                                        endpoint: e.target.value,
                                      },
                                    },
                                  });
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <FormControl fullWidth>
                                <InputLabel id="validation-method-label">Método</InputLabel>
                                <Select
                                  labelId="validation-method-label"
                                  label="Método"
                                  value={field.validation?.externalSource?.method || 'GET'}
                                  onChange={(e) => {
                                    const validation = field.validation || {};
                                    const externalSource = validation.externalSource || {
                                      enabled: true,
                                      endpoint: '',
                                    };

                                    onChange({
                                      ...field,
                                      validation: {
                                        ...validation,
                                        externalSource: {
                                          ...externalSource,
                                          method: e.target.value as 'GET' | 'POST',
                                        },
                                      },
                                    });
                                  }}
                                >
                                  <MenuItem value="GET">GET</MenuItem>
                                  <MenuItem value="POST">POST</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <FormControl fullWidth>
                                <InputLabel id="validation-auth-label">
                                  Chave de Autenticação
                                </InputLabel>
                                <Select
                                  labelId="validation-auth-label"
                                  label="Chave de Autenticação"
                                  value={field.validation?.externalSource?.authKey || ''}
                                  onChange={(e) => {
                                    const validation = field.validation || {};
                                    const externalSource = validation.externalSource || {
                                      enabled: true,
                                      endpoint: '',
                                      method: 'GET', // <-- aqui
                                    };

                                    onChange({
                                      ...field,
                                      validation: {
                                        ...validation,
                                        externalSource: {
                                          ...externalSource,
                                          authKey: e.target.value,
                                        },
                                      },
                                    });
                                  }}
                                >
                                  <MenuItem value="">Nenhuma</MenuItem>
                                  {apiAuths.map((auth) => (
                                    <MenuItem key={auth.id} value={auth.id}>
                                      {auth.name}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
            {/* Opções para campos de seleção */}
            {field.type === 'string' && field.format !== 'date' && field.format !== 'date-time' && (
              <Grid item xs={12}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Opções (para campos de seleção)</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Button
                      startIcon={<AddIcon />}
                      variant="contained"
                      onClick={() => {
                        const options = [...(field.options || [])];
                        options.push({
                          label: `Opção ${options.length + 1}`,
                          value: `option-${options.length + 1}`,
                        });
                        onChange({ ...field, options });
                      }}
                      sx={{ mb: 3 }}
                    >
                      Adicionar Opção
                    </Button>
                    {field.options?.map((option, index) => (
                      <Box key={index} sx={{ mb: 2, display: 'flex', gap: 2 }}>
                        <TextField
                          label="Rótulo"
                          value={option.label}
                          onChange={(e) => {
                            const options = [...(field.options || [])];
                            options[index].label = e.target.value;
                            onChange({ ...field, options });
                          }}
                        />
                        <TextField
                          label="Valor"
                          value={option.value}
                          onChange={(e) => {
                            const options = [...(field.options || [])];
                            options[index].value = e.target.value;
                            onChange({ ...field, options });
                          }}
                        />
                        <IconButton
                          color="error"
                          onClick={() => {
                            const options = [...(field.options || [])];
                            options.splice(index, 1);
                            onChange({ ...field, options });
                          }}
                          sx={{ alignSelf: 'center' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </AccordionDetails>
                </Accordion>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onSave}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
