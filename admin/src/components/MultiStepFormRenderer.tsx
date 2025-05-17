'use client';

import { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { Form } from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import { ExternalSourceSelectWidget, ExternalValidationWidget } from './RJSFCustomWidgets';

interface MultiStepFormRendererProps {
  schema: any;
  onSubmit?: (data: Record<string, any>) => void;
}

export const MultiStepFormRenderer = ({ schema, onSubmit }: MultiStepFormRendererProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<number, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const widgets = {
    ExternalSourceSelectWidget,
    ExternalValidationWidget,
  };

  const generateUiSchema = (stepSchema: any) => {
    if (!stepSchema || !stepSchema.properties) return {};
    const uiSchema: Record<string, any> = {};

    Object.entries(stepSchema.properties).forEach(([fieldName, fieldSchema]: [string, any]) => {
      if (fieldSchema['x-externalSource']?.enabled) {
        uiSchema[fieldName] = { 'ui:widget': 'ExternalSourceSelectWidget' };
      }
      if (fieldSchema['x-validation']?.externalSource?.enabled) {
        uiSchema[fieldName] = { 'ui:widget': 'ExternalValidationWidget' };
      }
      if (fieldSchema.placeholder) {
        uiSchema[fieldName] = {
          ...(uiSchema[fieldName] || {}),
          'ui:placeholder': fieldSchema.placeholder,
        };
      }
    });

    return uiSchema;
  };

  if (!schema || !schema.steps || !Array.isArray(schema.steps)) {
    return <Alert severity="error">Schema inválido ou não é multi-etapas.</Alert>;
  }

  const totalSteps = schema.steps.length;
  const current = schema.steps[currentStep];

  const handleStepSubmit = ({ formData: stepData }: any) => {
    const updatedData = { ...formData, [currentStep]: stepData };
    setFormData(updatedData);

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsSubmitting(true);
      try {
        const finalData = Object.assign({}, ...Object.values(updatedData));
        onSubmit && onSubmit(finalData);
      } catch (err) {
        setError('Erro ao submeter o formulário.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {current.title || `Etapa ${currentStep + 1} de ${totalSteps}`}
      </Typography>

      <Form
        schema={current.schema}
        uiSchema={generateUiSchema(current.schema)}
        formData={formData[currentStep] || {}}
        widgets={widgets}
        validator={validator}
        onSubmit={handleStepSubmit}
        onChange={({ formData: newFormData }) => {
          const updated = { ...formData, [currentStep]: newFormData };

          // Aplicar mapeamento automaticamente em tempo real
          Object.entries(current.schema.properties || {}).forEach(
            ([fieldName, fieldSchema]: [string, any]) => {
              const mapping = fieldSchema['x-externalSource']?.responseDataMapping;
              const response = newFormData?.[`${fieldName}_response`];
              if (mapping && response) {
                Object.entries(mapping).forEach(([targetField, sourceKey]) => {
                  updated[currentStep] = {
                    ...updated[currentStep],
                    [targetField]: response[String(sourceKey)],
                  };
                });
              }
            }
          );

          setFormData(updated);
        }}
      >
        <Box mt={2} display="flex" justifyContent="space-between">
          <Button
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(currentStep - 1)}
            variant="outlined"
          >
            Voltar
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {currentStep === totalSteps - 1 ? 'Enviar' : 'Próxima'}
          </Button>
        </Box>
      </Form>

      {isSubmitting && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};
