'use client';

import { useState, useEffect } from 'react';
import type { WidgetProps } from '@rjsf/utils';
import {
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Box,
  TextField,
  FormHelperText,
} from '@mui/material';

// Widget personalizado para campos com fonte de dados externa
export const ExternalSourceSelectWidget = (props: WidgetProps) => {
  const { id, value, required, disabled, readonly, onChange, schema } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<{ value: string; label: string }[]>([]);

  // Extrair configuração da fonte externa do schema
  const externalSource = schema['x-externalSource'];

  useEffect(() => {
    if (!externalSource || !externalSource.enabled || !externalSource.endpoint) {
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Na implementação real, você faria uma chamada fetch real
        // const headers: Record<string, string> = { ...externalSource.headers };

        // if (externalSource.authKey) {
        //   // Aqui você buscaria a autenticação correspondente e adicionaria aos headers
        //   // Por exemplo:
        //   // const auth = await fetchAuthByKey(externalSource.authKey);
        //   // headers['Authorization'] = `Bearer ${auth.key}`;
        // }

        // const response = await fetch(externalSource.endpoint, {
        //   method: externalSource.method || 'GET',
        //   headers,
        //   body: externalSource.method === 'POST' ? JSON.stringify(externalSource.requestParams) : undefined
        // });

        // if (!response.ok) {
        //   throw new Error(`Erro na chamada à API: ${response.statusText}`);
        // }

        // const data = await response.json();

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

          // Mapear os dados para o formato esperado pelo select
          const valueField = externalSource?.responseMapping?.valueField || 'code';
          const labelField = externalSource?.responseMapping?.labelField || 'description';

          const mappedItems = mockData.map((item: any) => ({
            value: item[valueField] || '',
            label: item[labelField] || '',
          }));

          setItems(mappedItems);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        setError(`Erro ao carregar dados: ${err instanceof Error ? err.message : String(err)}`);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [externalSource]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Select
      id={id}
      name={id}
      value={value || ''}
      onChange={(e) => {
        const selectedValue = e.target.value;
        onChange(selectedValue);
        // Salvar a resposta completa do item selecionado para responseDataMapping
        const selectedItem = items.find((item) => item.value === selectedValue);
        if (
          selectedItem &&
          props.formContext &&
          typeof props.formContext.setFormData === 'function'
        ) {
          props.formContext.setFormData((prev: any) => ({
            ...prev,
            [`${id}_response`]: selectedItem,
          }));
        }
      }}
      disabled={disabled || readonly}
      required={required}
      fullWidth
      displayEmpty
    >
      <MenuItem value="">Selecione...</MenuItem>
      {items.map((item) => (
        <MenuItem key={item.value} value={item.value}>
          {item.label}
        </MenuItem>
      ))}
    </Select>
  );
};

// Widget personalizado para validação externa
export const ExternalValidationWidget = (props: WidgetProps) => {
  const { id, value, required, disabled, readonly, onChange, schema } = props;
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);

  // Extrair configuração da validação externa do schema
  const externalValidation = schema['x-validation']?.externalSource;

  // Função para validar o valor contra a API externa
  const validateExternally = async (val: string) => {
    if (
      !externalValidation ||
      !externalValidation.enabled ||
      !externalValidation.endpoint ||
      !val
    ) {
      return;
    }

    try {
      setIsValidating(true);
      setValidationError(null);

      // Na implementação real, você faria uma chamada fetch real
      // const headers: Record<string, string> = { ...externalValidation.headers };

      // if (externalValidation.authKey) {
      //   // Aqui você buscaria a autenticação correspondente e adicionaria aos headers
      // }

      // const url = externalValidation.method === 'GET'
      //   ? `${externalValidation.endpoint}?value=${encodeURIComponent(val)}`
      //   : externalValidation.endpoint;

      // const response = await fetch(url, {
      //   method: externalValidation.method || 'GET',
      //   headers,
      //   body: externalValidation.method === 'POST'
      //     ? JSON.stringify({ ...externalValidation.requestParams, value: val })
      //     : undefined
      // });

      // if (!response.ok) {
      //   throw new Error(`Erro na validação: ${response.statusText}`);
      // }

      // const data = await response.json();

      // Simulando uma resposta bem-sucedida
      setTimeout(() => {
        // Simulando validação de NIF
        const isValid = val.length === 9 && /^\d+$/.test(val);

        if (!isValid) {
          setValidationError('NIF inválido. Deve conter 9 dígitos.');
        } else {
          setValidationResult({
            isValid: true,
            message: 'NIF válido',
          });
        }

        setIsValidating(false);
      }, 500);
    } catch (err) {
      setValidationError(`Erro na validação: ${err instanceof Error ? err.message : String(err)}`);
      setIsValidating(false);
    }
  };

  // Validar quando o valor mudar
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value) {
        validateExternally(value);
      }
    }, 500); // Debounce para evitar muitas chamadas

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <Box>
      <TextField
        id={id}
        name={id}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || readonly || isValidating}
        required={required}
        fullWidth
        error={!!validationError}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: validationError
                ? 'error.main'
                : validationResult?.isValid
                  ? 'success.main'
                  : 'inherit',
            },
          },
        }}
      />
      {isValidating && <FormHelperText>Validando...</FormHelperText>}
      {validationError && <FormHelperText error>{validationError}</FormHelperText>}
      {validationResult?.isValid && (
        <FormHelperText sx={{ color: 'success.main' }}>{validationResult.message}</FormHelperText>
      )}
    </Box>
  );
};
