import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';

// Estrutura mínima para um Step
export type Step = {
  id?: string;
  title: string;
  schema: any;
};

interface MultiStepWizardBuilderProps {
  steps: Step[];
  onChange: (steps: Step[]) => void;
  onEditStepFields: (stepIndex: number) => void; // Chama o editor de campos da etapa
}

export const MultiStepWizardBuilder: React.FC<MultiStepWizardBuilderProps> = ({
  steps,
  onChange,
  onEditStepFields,
}) => {
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [stepTitle, setStepTitle] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Adicionar nova etapa
  const handleAddStep = () => {
    setStepTitle('');
    setIsAddDialogOpen(true);
  };
  const confirmAddStep = () => {
    const newStep: Step = {
      id: `step-${Date.now()}`,
      title: stepTitle || `Etapa ${steps.length + 1}`,
      schema: {
        type: 'object',
        properties: {},
        required: [],
      },
    };
    onChange([...steps, newStep]);
    setIsAddDialogOpen(false);
  };

  // Remover etapa
  const handleRemoveStep = (idx: number) => {
    if (window.confirm('Remover esta etapa?')) {
      const newSteps = steps.slice();
      newSteps.splice(idx, 1);
      onChange(newSteps);
    }
  };

  // Editar nome da etapa
  const handleEditStepTitle = (idx: number) => {
    setEditingStepIndex(idx);
    setStepTitle(steps[idx].title);
  };
  const confirmEditStepTitle = () => {
    if (editingStepIndex !== null) {
      const newSteps = steps.slice();
      newSteps[editingStepIndex].title = stepTitle;
      onChange(newSteps);
      setEditingStepIndex(null);
    }
  };

  // Reordenar etapas
  const moveStep = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= steps.length) return;
    const newSteps = steps.slice();
    const [removed] = newSteps.splice(fromIdx, 1);
    newSteps.splice(toIdx, 0, removed);
    onChange(newSteps);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Etapas do Formulário Multi-Etapa
      </Typography>
      <List>
        {steps.map((step, idx) => (
          <ListItem
            key={step.id}
            sx={{
              border: editingStepIndex === idx ? "2px solid #1976d2" : "1px solid #eee",
              borderRadius: 2,
              p: 2,
              mb: 2,
              background: editingStepIndex === idx ? "#e3f2fd" : "#fafbfc",
              transition: "border .2s, background .2s"
            }}
            secondaryAction={
              <Stack direction="row" spacing={1}>
                <IconButton onClick={() => moveStep(idx, idx - 1)} disabled={idx === 0}>
                  <ArrowUpward fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={() => moveStep(idx, idx + 1)}
                  disabled={idx === steps.length - 1}
                >
                  <ArrowDownward fontSize="small" />
                </IconButton>
                <IconButton onClick={() => handleEditStepTitle(idx)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton onClick={() => handleRemoveStep(idx)} color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <Button size="small" variant="outlined" onClick={() => onEditStepFields(idx)}>
                  Editar Campos
                </Button>
              </Stack>
            }
          >
            <ListItemText
              primary={step.title || `Etapa ${idx + 1}`}
              secondary={`Campos: ${Object.keys(step.schema?.properties || {}).length}`}
            />
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 2 }}>
        <Button startIcon={<AddIcon />} variant="contained" onClick={handleAddStep}>
          Nova Etapa
        </Button>
      </Box>

      {/* Dialog para adicionar/editar step */}
      <Dialog
        open={isAddDialogOpen || editingStepIndex !== null}
        onClose={() => {
          setIsAddDialogOpen(false);
          setEditingStepIndex(null);
        }}
      >
        <DialogTitle>
          {editingStepIndex !== null ? 'Editar Nome da Etapa' : 'Adicionar Nova Etapa'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Título da Etapa"
            value={stepTitle}
            fullWidth
            onChange={(e) => setStepTitle(e.target.value)}
            autoFocus
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsAddDialogOpen(false);
              setEditingStepIndex(null);
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={editingStepIndex !== null ? confirmEditStepTitle : confirmAddStep}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
