import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box
} from "@mui/material";
import { Form } from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";
import { MultiStepFormRenderer } from "../components/MultiStepFormRenderer";
import { convertInternalToJsonSchema } from "../utils/schema-converter";
import type { FormSchema } from "../types";

interface FormPreviewDialogProps {
  open: boolean;
  formPreview: FormSchema | null;
  onClose: () => void;
  onExport: () => void;
}

export const FormPreviewDialog: React.FC<FormPreviewDialogProps> = ({
  open,
  formPreview,
  onClose,
  onExport,
}) => (
  <Dialog
    open={open && !!formPreview}
    onClose={onClose}
    fullWidth
    maxWidth="md"
  >
    <DialogTitle>Preview: {formPreview?.title}</DialogTitle>
    <DialogContent>
      {formPreview && (
        <Box sx={{ p: 2 }}>
          {formPreview.isMultiStep && Array.isArray(formPreview.steps) ? (
            <MultiStepFormRenderer schema={formPreview} />
          ) : (
            <Form
              schema={convertInternalToJsonSchema(formPreview)}
              validator={validator}
              onSubmit={({ formData }) => console.log('Dados do formulário:', formData)}
            />
          )}
        </Box>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Fechar</Button>
      <Button variant="contained" onClick={onExport}>
        Exportar Schema
      </Button>
    </DialogActions>
  </Dialog>
);
