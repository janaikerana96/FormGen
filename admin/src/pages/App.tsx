import { Page } from '@strapi/strapi/admin';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { CssBaseline, Box, Typography } from "@mui/material"

import { HomePage } from './HomePage';
import { FormBuilderPage } from './FormBuilderPage';
import { AuthenticationsPage } from './AuthenticationsPage';
import { FormConsumerPage } from './FormConsumerPage';


const theme = createTheme({
  palette: {
    primary: { main: "#4945ff" },
    secondary: { main: "#dc004e" },
  },
  typography: {
    fontSize: 20, // 👈 Aumenta o tamanho base das fontes!
    fontFamily: [
      "Inter",
      "system-ui",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "sans-serif"
    ].join(",")
  },

})

// Componente para página não encontrada
const NotFound = () => (
  <Box sx={{ p: 4, textAlign: "center" }}>
    <Typography variant="h4" component="h1" gutterBottom>
      404 - Página não encontrada
    </Typography>
    <Typography variant="body1">A página que você está procurando não existe.</Typography>
  </Box>
)

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="form-builder" element={<FormBuilderPage />} />
      <Route path="authentications" element={<AuthenticationsPage />} />
      <Route path="form-consumer" element={<FormConsumerPage />} />
      <Route path="*" element={<Page.Error />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </ThemeProvider>
  );
};

export { App };
