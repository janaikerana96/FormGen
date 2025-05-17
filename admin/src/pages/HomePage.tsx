"use client"

import { Box, Typography, Button, Stack, Paper } from "@mui/material"
import { Link } from "react-router-dom"
import { Edit as EditIcon, Key as KeyIcon } from "@mui/icons-material"


export const HomePage = () => {


  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        FormGen - Construtor de Formulários
      </Typography>

      <Typography variant="body1" sx={{ mt: 2, mb: 4 }}>
        Bem-vindo ao construtor de formulários. Seleccione uma das opções abaixo para começar.
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Paper sx={{ p: 2 }}>
          <Button
            component={Link}
            to="form-builder"
            variant="contained"
            startIcon={<EditIcon />}
            fullWidth
            size="large"
          >
            Construir Formulários
          </Button>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Button
            component={Link}
            to="authentications"
            variant="outlined"
            startIcon={<KeyIcon />}
            fullWidth
            size="large"
          >
            Gerir Autenticações
          </Button>
        </Paper>
      </Stack>
    </Box>
  )
}
