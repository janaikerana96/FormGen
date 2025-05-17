import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Box, Tabs, Tab, TextField, FormControlLabel, Checkbox
} from "@mui/material";

interface ImportSchemaDialogProps {
  open: boolean;
  importMethod: "url" | "file" | "text";
  importUrl: string;
  importText: string;
  importFile: File | null;
  importAsSteps: boolean;
  isLoading: boolean;
  onClose: () => void;
  onMethodChange: (method: "url" | "file" | "text") => void;
  onUrlChange: (url: string) => void;
  onTextChange: (text: string) => void;
  onFileChange: (file: File | null) => void;
  onAsStepsChange: (checked: boolean) => void;
  onImport: () => void;
}

export const ImportSchemaDialog: React.FC<ImportSchemaDialogProps> = ({
  open,
  importMethod,
  importUrl,
  importText,
  importFile,
  importAsSteps,
  isLoading,
  onClose,
  onMethodChange,
  onUrlChange,
  onTextChange,
  onFileChange,
  onAsStepsChange,
  onImport
}) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
    <DialogTitle>Importar Schema JSON</DialogTitle>
    <DialogContent>
      <Box sx={{ p: 2 }}>
        <Tabs value={importMethod} onChange={(_, newValue) => onMethodChange(newValue)} sx={{ mb: 3 }}>
          <Tab label="URL" value="url" />
          <Tab label="Arquivo" value="file" />
          <Tab label="Texto" value="text" />
        </Tabs>

        <FormControlLabel
          control={<Checkbox checked={importAsSteps} onChange={e => onAsStepsChange(e.target.checked)} />}
          label="Importar múltiplos schemas como um formulário de etapas"
          sx={{ mb: 2 }}
        />

        {importMethod === "url" && (
          <TextField
            label="URL do Schema JSON"
            placeholder="https://exemplo.com/schema.json"
            fullWidth
            value={importUrl}
            onChange={e => onUrlChange(e.target.value)}
          />
        )}

        {importMethod === "file" && (
          <Box>
            <input
              accept="application/json"
              style={{ display: "none" }}
              id="import-file-button"
              type="file"
              onChange={e => {
                if (e.target.files && e.target.files.length > 0) {
                  onFileChange(e.target.files[0]);
                }
              }}
            />
            <label htmlFor="import-file-button">
              <Button variant="outlined" component="span" fullWidth>
                {importFile ? importFile.name : "Selecionar arquivo JSON"}
              </Button>
            </label>
          </Box>
        )}

        {importMethod === "text" && (
          <TextField
            label="Schema JSON"
            placeholder='{"type": "object", "properties": {...}}'
            fullWidth
            multiline
            rows={10}
            value={importText}
            onChange={e => onTextChange(e.target.value)}
          />
        )}
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancelar</Button>
      <Button
        variant="contained"
        onClick={onImport}
        disabled={
          isLoading ||
          (importMethod === "url" && !importUrl) ||
          (importMethod === "file" && !importFile) ||
          (importMethod === "text" && !importText)
        }
      >
        {isLoading ? "Importando..." : "Importar"}
      </Button>
    </DialogActions>
  </Dialog>
);
