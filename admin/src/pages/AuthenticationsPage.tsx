"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useIntl } from "react-intl"
import { getTranslation } from "../utils/getTranslation"
import type { ApiAuth } from "../types"

// Material UI imports
import {
  Box,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Stack,
  Paper,
  Chip,
  Skeleton,
} from "@mui/material"
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PlayArrow as PlayArrowIcon,
} from "@mui/icons-material"

export const AuthenticationsPage = () => {
  const { formatMessage } = useIntl()
  const [apiAuths, setApiAuths] = useState<ApiAuth[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentAuth, setCurrentAuth] = useState<ApiAuth | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  const navigate = useNavigate()

  // Carregar autenticações ao montar o componente
  useEffect(() => {
    const loadAuths = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Aqui você faria uma chamada para sua API Strapi
        // const response = await fetch('/api/authentications');
        // const data = await response.json();
        // setApiAuths(data);

        // Por enquanto, vamos simular com dados de exemplo
        setTimeout(() => {
          setApiAuths([
            {
              id: "1",
              name: "API NIF",
              type: "api_key",
              key: "nif-api-key-123",
              endpoint: "https://api.exemplo.com/nif",
              description: "API para consulta de dados de NIF",
              status: "active",
            },
            {
              id: "2",
              name: "API CAE",
              type: "api_key",
              key: "cae-api-key-456",
              endpoint: "https://api.exemplo.com/cae",
              description: "API para consulta de códigos CAE",
              status: "active",
            },
          ])
          setIsLoading(false)
        }, 1000)
      } catch (err) {
        setError("Erro ao carregar autenticações")
        setIsLoading(false)
        console.error(err)
      }
    }

    loadAuths()
  }, [])

  // Função para criar uma nova autenticação
  const createNewAuth = () => {
    setCurrentAuth({
      id: Date.now().toString(),
      name: "",
      type: "api_key",
      key: "",
      secret: "",
      endpoint: "",
      description: "",
      status: "inactive",
    })
    setIsModalOpen(true)
  }

  // Função para editar uma autenticação existente
  const editAuth = (auth: ApiAuth) => {
    setCurrentAuth(auth)
    setIsModalOpen(true)
  }

  // Função para salvar uma autenticação
  const saveAuth = async () => {
    if (!currentAuth) return

    try {
      setIsLoading(true)
      setError(null)

      // Aqui você faria uma chamada para sua API Strapi
      // const method = currentAuth.id && apiAuths.some(auth => auth.id === currentAuth.id) ? 'PUT' : 'POST';
      // const url = method === 'PUT' ? `/api/authentications/${currentAuth.id}` : '/api/authentications';
      // const response = await fetch(url, {
      //   method,
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(currentAuth)
      // });

      // if (!response.ok) {
      //   throw new Error(`Erro ao salvar: ${response.statusText}`);
      // }

      // Simulando uma resposta bem-sucedida
      setTimeout(() => {
        if (currentAuth.id && apiAuths.some((auth) => auth.id === currentAuth.id)) {
          // Atualizar existente
          setApiAuths(apiAuths.map((auth) => (auth.id === currentAuth.id ? currentAuth : auth)))
        } else {
          // Adicionar novo
          setApiAuths([...apiAuths, currentAuth])
        }

        setIsModalOpen(false)
        setCurrentAuth(null)
        setIsLoading(false)
      }, 1000)
    } catch (err) {
      setError(`Erro ao salvar autenticação: ${err instanceof Error ? err.message : String(err)}`)
      setIsLoading(false)
    }
  }

  // Função para remover uma autenticação
  const removeAuth = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // Aqui você faria uma chamada para sua API Strapi
      // const response = await fetch(`/api/authentications/${id}`, {
      //   method: 'DELETE'
      // });

      // if (!response.ok) {
      //   throw new Error(`Erro ao remover: ${response.statusText}`);
      // }

      // Simulando uma resposta bem-sucedida
      setTimeout(() => {
        setApiAuths(apiAuths.filter((auth) => auth.id !== id))
        setIsLoading(false)
      }, 1000)
    } catch (err) {
      setError(`Erro ao remover autenticação: ${err instanceof Error ? err.message : String(err)}`)
      setIsLoading(false)
    }
  }

  // Função para alternar a visibilidade de chaves/segredos
  const toggleSecretVisibility = (id: string) => {
    setShowSecrets({
      ...showSecrets,
      [id]: !showSecrets[id],
    })
  }

  // Função para testar a conexão com a API
  const testApiConnection = async (auth: ApiAuth) => {
    try {
      setIsLoading(true)
      setError(null)

      // Aqui você implementaria a lógica para testar a conexão
      // const response = await fetch('/api/test-connection', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(auth)
      // });

      // if (!response.ok) {
      //   throw new Error(`Erro ao testar conexão: ${response.statusText}`);
      // }

      // Simulando uma resposta bem-sucedida
      setTimeout(() => {
        setError(`Conexão com ${auth.name} (${auth.endpoint}) testada com sucesso!`)
        setIsLoading(false)
      }, 1000)
    } catch (err) {
      setError(`Erro ao testar conexão: ${err instanceof Error ? err.message : String(err)}`)
      setIsLoading(false)
    }
  }

  if (isLoading && apiAuths.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
      {[...Array(2)].map((_, idx) => (
        <Box key={idx} sx={{ mb: 2 }}>
          <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: 2 }} />
        </Box>
      ))}
    </Box>
  )
  }

  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <Button onClick={() => navigate(-1)} variant="outlined" startIcon={<ArrowBackIcon />}>
          Voltar
        </Button>
        <Typography variant="h6" fontWeight="bold">
            Autenticações de APIs Externas
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Button variant="contained" startIcon={<AddIcon />} onClick={createNewAuth} sx={{ mb: 4 }}>
        Adicionar Nova Autenticação
      </Button>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Chave</TableCell>
              <TableCell>Endpoint</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {apiAuths.map((auth) => (
              <TableRow key={auth.id}>
                <TableCell>{auth.name}</TableCell>
                <TableCell>
                  {auth.type === "api_key" && "Chave de API"}
                  {auth.type === "oauth" && "OAuth"}
                  {auth.type === "basic" && "Autenticação Básica"}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography>{showSecrets[auth.id] ? auth.key : "••••••••••••••••"}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => toggleSecretVisibility(auth.id)}
                      aria-label={showSecrets[auth.id] ? "Esconder chave" : "Mostrar chave"}
                    >
                      {showSecrets[auth.id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </Stack>
                </TableCell>
                <TableCell>{auth.endpoint}</TableCell>
                <TableCell>
                  <Chip
                    label={auth.status === "active" ? "Ativo" : "Inativo"}
                    color={auth.status === "active" ? "success" : "default"}
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <IconButton color="primary" onClick={() => editAuth(auth)} aria-label="Editar">
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => removeAuth(auth.id)} aria-label="Remover">
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Modal para adicionar/editar autenticação */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{currentAuth?.id ? "Editar Autenticação" : "Nova Autenticação"}</DialogTitle>
        <DialogContent>
          {currentAuth && (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Nome da API"
                    fullWidth
                    value={currentAuth.name}
                    onChange={(e) => setCurrentAuth({ ...currentAuth, name: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Select
                    label="Tipo de Autenticação"
                    fullWidth
                    value={currentAuth.type}
                    onChange={(e) => setCurrentAuth({ ...currentAuth, type: e.target.value as ApiAuth["type"] })}
                  >
                    <MenuItem value="api_key">Chave de API</MenuItem>
                    <MenuItem value="oauth">OAuth</MenuItem>
                    <MenuItem value="basic">Autenticação Básica</MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Endpoint da API"
                    fullWidth
                    value={currentAuth.endpoint}
                    onChange={(e) => setCurrentAuth({ ...currentAuth, endpoint: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Chave"
                    fullWidth
                    value={currentAuth.key}
                    onChange={(e) => setCurrentAuth({ ...currentAuth, key: e.target.value })}
                    required
                  />
                </Grid>
                {(currentAuth.type === "oauth" || currentAuth.type === "basic") && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Segredo"
                      type="password"
                      fullWidth
                      value={currentAuth.secret || ""}
                      onChange={(e) => setCurrentAuth({ ...currentAuth, secret: e.target.value })}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField
                    label="Descrição"
                    fullWidth
                    multiline
                    rows={2}
                    value={currentAuth.description}
                    onChange={(e) => setCurrentAuth({ ...currentAuth, description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Select
                    label="Status"
                    fullWidth
                    value={currentAuth.status}
                    onChange={(e) => setCurrentAuth({ ...currentAuth, status: e.target.value as ApiAuth["status"] })}
                  >
                    <MenuItem value="active">Ativo</MenuItem>
                    <MenuItem value="inactive">Inativo</MenuItem>
                  </Select>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)}>Cancelar</Button>
          {currentAuth?.id && (
            <Button
              variant="outlined"
              startIcon={<PlayArrowIcon />}
              onClick={() => currentAuth && testApiConnection(currentAuth)}
              disabled={isLoading}
            >
              Testar Conexão
            </Button>
          )}
          <Button variant="contained" onClick={saveAuth} disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
