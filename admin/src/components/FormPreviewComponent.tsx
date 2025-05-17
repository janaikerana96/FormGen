'use client';

import type React from 'react';

import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Grid,
  Button,
  Paper,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Interface para o schema do formulário
interface FormField {
  id: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'date';
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  externalSource?: {
    enabled: boolean;
    endpoint?: string;
    authKey?: string;
  };
}

interface FormSchema {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
}

interface FormPreviewProps {
  schema: FormSchema;
  onSubmit?: (data: Record<string, any>) => void;
}

export const FormPreviewComponent = ({ schema, onSubmit }: FormPreviewProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpar erro quando o campo for preenchido
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    schema.fields.forEach((field) => {
      if (field.required) {
        const value = formData[field.name];
        if (value === undefined || value === null || value === '') {
          newErrors[field.name] = 'Este campo é obrigatório';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      if (onSubmit) {
        onSubmit(formData);
      }
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Box mb={3}>
          <Typography variant="h5">{schema.name}</Typography>
          {schema.description && (
            <Typography variant="body2" color="textSecondary" mt={1}>
              {schema.description}
            </Typography>
          )}
        </Box>

        <Grid container spacing={3}>
          {schema.fields.map((field) => (
            <Grid item key={field.id} xs={12}>
              {field.type === 'text' && (
                <TextField
                  label={field.label}
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  fullWidth
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  error={!!errors[field.name]}
                  helperText={errors[field.name]}
                />
              )}
              {field.type === 'number' && (
                <TextField
                  label={field.label}
                  name={field.name}
                  type="number"
                  placeholder={field.placeholder}
                  required={field.required}
                  fullWidth
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, Number.parseFloat(e.target.value))}
                  error={!!errors[field.name]}
                  helperText={errors[field.name]}
                />
              )}
              {field.type === 'select' && (
                <FormControl fullWidth error={!!errors[field.name]}>
                  <InputLabel id={`label-${field.name}`}>{field.label}</InputLabel>
                  <Select
                    labelId={`label-${field.name}`}
                    name={field.name}
                    label={field.label}
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  >
                    {field.options?.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    )) || <MenuItem value="">Sem opções definidas</MenuItem>}
                  </Select>
                  {errors[field.name] && <FormHelperText>{errors[field.name]}</FormHelperText>}
                </FormControl>
              )}
              {field.type === 'checkbox' && (
                <FormControlLabel
                  control={
                    <Checkbox
                      name={field.name}
                      checked={Boolean(formData[field.name])}
                      onChange={(e) => handleChange(field.name, e.target.checked)}
                    />
                  }
                  label={field.label}
                />
              )}
              {field.type === 'date' && (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label={field.label}
                    value={formData[field.name] || null}
                    onChange={(date) => handleChange(field.name, date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: field.required || false,
                        error: !!errors[field.name],
                        helperText: errors[field.name] || '',
                      },
                    }}
                  />
                </LocalizationProvider>
              )}
            </Grid>
          ))}
        </Grid>

        <Box mt={3}>
          <Button type="submit" variant="contained" color="primary">
            Enviar
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};
