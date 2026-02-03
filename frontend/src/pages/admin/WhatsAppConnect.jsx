// D:\PROYECTOS\tiendavirtual\frontend\src\pages\admin\WhatsAppConnect.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    Grid,
    Chip,
    Snackbar,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    QrCodeScanner,
    WhatsApp,
    Refresh,
    CheckCircle,
    Error,
    Send,
    Info,
    Warning
} from '@mui/icons-material';
import MuiAlert from '@mui/material/Alert';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../context/ToastContext';

const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/whatsapp` : 'http://localhost:3002/api/whatsapp';

// Componente para notificaciones
const AlertComponent = React.forwardRef(function AlertComponent(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const WhatsAppConnect = () => {
    const [status, setStatus] = useState(null);
    const [qrCode, setQrCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const { showToast } = useToast();
    const [testDialogOpen, setTestDialogOpen] = useState(false);
    const [testPhone, setTestPhone] = useState('');
    const [sendingTest, setSendingTest] = useState(false);
    const [pollingInterval, setPollingInterval] = useState(null);

    // Obtener estado de WhatsApp
    const fetchStatus = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/status`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                console.error('Error en la respuesta del servidor:', data.error);
                setStatus({
                    status: 'error',
                    message: data.error || 'Error desconocido',
                    timestamp: new Date()
                });
                return;
            }

            setStatus(data);

            // Si hay QR pendiente, obtenerlo
            if (data.status === 'qr_pending' && data.qr) {
                setQrCode(data.qr);
            } else {
                setQrCode('');
            }

            // Detectar cambios de estado
            if (status && status.status !== data.status) {
                if (data.status === 'connected') {
                    showToast('✅ WhatsApp conectado exitosamente', 'success');
                } else if (data.status === 'disconnected') {
                    showToast('❌ WhatsApp desconectado', 'warning');
                } else if (data.status === 'qr_pending') {
                    showToast('📱 Escanea el código QR con WhatsApp', 'success');
                }
            }

        } catch (error) {
            console.error('Error obteniendo estado:', error);
            setStatus({
                status: 'error',
                message: 'No se pudo conectar con el servidor',
                error: error.message,
                timestamp: new Date()
            });
        } finally {
            setLoading(false);
        }
    }, [status, showToast]);

    // Regenerar QR
    const regenerateQR = async () => {
        setActionLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/regenerate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                showToast('🔄 QR regenerado exitosamente', 'success');
                // Esperar y actualizar
                setTimeout(fetchStatus, 2000);
            } else {
                showToast(`❌ Error: ${data.error}`, 'error');
            }
        } catch (error) {
            console.error('Error regenerando QR:', error);
            showToast('❌ Error regenerando QR', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // Desconectar
    const disconnect = async () => {
        if (!window.confirm('¿Estás seguro de que deseas desconectar WhatsApp?')) {
            return;
        }

        setActionLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/disconnect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                showToast('✅ WhatsApp desconectado', 'success');
                fetchStatus();
            } else {
                showToast(`❌ Error: ${data.error}`, 'error');
            }
        } catch (error) {
            console.error('Error desconectando:', error);
            showToast('❌ Error desconectando WhatsApp', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // Enviar mensaje de prueba
    const sendTestMessage = async () => {
        if (!testPhone || testPhone.length < 10) {
            showToast('❌ Ingresa un número de teléfono válido', 'error');
            return;
        }

        setSendingTest(true);
        try {
            const response = await fetch(`${API_BASE_URL}/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phoneNumber: testPhone })
            });

            const data = await response.json();

            if (data.success) {
                showToast('✅ Mensaje de prueba enviado', 'success');
                setTestDialogOpen(false);
                setTestPhone('');
            } else {
                showToast(`❌ Error: ${data.error}`, 'error');
            }
        } catch (error) {
            console.error('Error enviando prueba:', error);
            showToast('❌ Error enviando mensaje de prueba', 'error');
        } finally {
            setSendingTest(false);
        }
    };

    // Manejar polling inteligente
    useEffect(() => {
        fetchStatus();

        // Configurar polling basado en el estado
        const setupPolling = () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }

            let intervalTime = 10000; // Por defecto 10 segundos

            if (status) {
                switch (status.status) {
                    case 'qr_pending':
                        intervalTime = 3000; // Cada 3 segundos para QR
                        break;
                    case 'connected':
                        intervalTime = 30000; // Cada 30 segundos cuando está conectado
                        break;
                    case 'error':
                    case 'disconnected':
                        intervalTime = 10000; // Cada 10 segundos para errores
                        break;
                    default:
                        intervalTime = 10000;
                }
            }

            const interval = setInterval(fetchStatus, intervalTime);
            setPollingInterval(interval);

            return interval;
        };

        const interval = setupPolling();

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [fetchStatus, status?.status]);

    // Renderizar estado
    const renderStatus = () => {
        if (!status) return null;

        const statusConfig = {
            connected: {
                color: '#25D366',
                icon: <CheckCircle />,
                text: 'Conectado',
                message: 'WhatsApp está conectado y funcionando'
            },
            qr_pending: {
                color: '#FF9800',
                icon: <QrCodeScanner />,
                text: 'Esperando QR',
                message: 'Escanea el código QR con tu WhatsApp'
            },
            disconnected: {
                color: '#F44336',
                icon: <Error />,
                text: 'Desconectado',
                message: 'WhatsApp no está conectado'
            },
            error: {
                color: '#9C27B0',
                icon: <Error />,
                text: 'Error',
                message: status.message || 'Error de conexión'
            },
            auth_failure: {
                color: '#FF5722',
                icon: <Warning />,
                text: 'Error de autenticación',
                message: 'Problema con la autenticación de WhatsApp'
            }
        };

        const config = statusConfig[status.status] || statusConfig.error;

        return (
            <Card sx={{ mb: 3, borderLeft: `4px solid ${config.color}` }}>
                <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box sx={{
                            bgcolor: `${config.color}15`,
                            borderRadius: '50%',
                            p: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {React.cloneElement(config.icon, {
                                sx: {
                                    color: config.color,
                                    fontSize: 36
                                }
                            })}
                        </Box>
                        <Box flex={1}>
                            <Typography variant="h6" gutterBottom>
                                Estado: <span style={{
                                    color: config.color,
                                    fontWeight: 'bold'
                                }}>
                                    {config.text}
                                </span>
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                {config.message}
                            </Typography>

                            {status.phoneNumber && (
                                <Chip
                                    icon={<WhatsApp />}
                                    label={`Número: ${status.phoneNumber}`}
                                    size="small"
                                    sx={{
                                        mt: 1,
                                        bgcolor: '#25D36620',
                                        color: '#25D366'
                                    }}
                                />
                            )}

                            {status.timestamp && (
                                <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                                    Última actualización: {new Date(status.timestamp).toLocaleTimeString('es-AR')}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    // Renderizar QR
    const renderQRCode = () => {
        if (!qrCode || status?.status !== 'qr_pending') return null;

        return (
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom color="primary">
                    📱 Escanea este QR con WhatsApp
                </Typography>
                <Paper
                    elevation={4}
                    sx={{
                        p: 3,
                        display: 'inline-block',
                        borderRadius: 2,
                        bgcolor: 'background.paper'
                    }}
                >
                    <img
                        src={qrCode}
                        alt="QR Code de WhatsApp"
                        style={{
                            width: '250px',
                            height: '250px',
                            borderRadius: '8px'
                        }}
                        onError={() => setQrCode('')}
                    />
                </Paper>
                <Box sx={{ mt: 2, p: 2, bgcolor: '#FFF3E0', borderRadius: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                        <strong>Instrucciones:</strong><br />
                        1. Abre WhatsApp en tu teléfono<br />
                        2. Toca Menú → Dispositivos vinculados<br />
                        3. Selecciona "Vincular dispositivo"<br />
                        4. Escanea este código QR
                    </Typography>
                </Box>
            </Box>
        );
    };

    // Renderizar acciones
    const renderActions = () => {
        const isConnected = status?.status === 'connected';
        const isQrPending = status?.status === 'qr_pending';
        const isDisconnected = status?.status === 'disconnected' || !status;

        return (
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                    Acciones
                </Typography>
                <Grid container spacing={2}>
                    {isDisconnected && (
                        <Grid item>
                            <Button
                                variant="contained"
                                startIcon={<QrCodeScanner />}
                                onClick={regenerateQR}
                                disabled={actionLoading}
                                sx={{
                                    bgcolor: '#25D366',
                                    '&:hover': {
                                        bgcolor: '#1da851',
                                        transform: 'translateY(-2px)',
                                        boxShadow: 4
                                    },
                                    transition: 'all 0.2s'
                                }}
                                size="large"
                            >
                                {actionLoading ? <CircularProgress size={24} color="inherit" /> : 'Conectar WhatsApp'}
                            </Button>
                        </Grid>
                    )}

                    {isQrPending && (
                        <>
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<Refresh />}
                                    onClick={regenerateQR}
                                    disabled={actionLoading}
                                    size="large"
                                >
                                    {actionLoading ? 'Regenerando...' : 'Regenerar QR'}
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={disconnect}
                                    disabled={actionLoading}
                                    size="large"
                                >
                                    Cancelar
                                </Button>
                            </Grid>
                        </>
                    )}

                    {isConnected && (
                        <>
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    color="success"
                                    startIcon={<Send />}
                                    onClick={() => setTestDialogOpen(true)}
                                    size="large"
                                >
                                    Enviar Prueba
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<Error />}
                                    onClick={disconnect}
                                    disabled={actionLoading}
                                    size="large"
                                >
                                    {actionLoading ? 'Desconectando...' : 'Desconectar'}
                                </Button>
                            </Grid>
                        </>
                    )}

                    <Grid item>
                        <Button
                            variant="text"
                            startIcon={<Refresh />}
                            onClick={fetchStatus}
                            disabled={loading}
                            size="large"
                        >
                            Actualizar
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    // Diálogo para enviar mensaje de prueba
    const renderTestDialog = () => (
        <Dialog
            open={testDialogOpen}
            onClose={() => !sendingTest && setTestDialogOpen(false)}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <Send color="primary" />
                    Enviar Mensaje de Prueba
                </Box>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    Envía un mensaje de prueba para verificar que WhatsApp está funcionando correctamente.
                </Typography>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Número de Teléfono"
                    type="tel"
                    fullWidth
                    variant="outlined"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="Ej: 3411234567"
                    helperText="Ingresa el número sin +54 (ej: 3411234567)"
                    disabled={sendingTest}
                />
                <Alert severity="info" sx={{ mt: 2 }}>
                    El mensaje se enviará al número proporcionado desde tu WhatsApp conectado.
                </Alert>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => setTestDialogOpen(false)}
                    disabled={sendingTest}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={sendTestMessage}
                    variant="contained"
                    color="primary"
                    disabled={sendingTest || !testPhone}
                    startIcon={sendingTest ? <CircularProgress size={20} /> : <Send />}
                >
                    {sendingTest ? 'Enviando...' : 'Enviar Prueba'}
                </Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <AdminLayout title="Conexión WhatsApp">
            <div className="p-10">
                <Paper elevation={0} sx={{
                    p: 4,
                    borderRadius: '24px',
                    border: '1px solid',
                    borderColor: 'divider',
                    background: 'white'
                }}>
                    {/* Título y Descripción simplificados ya que tenemos el header del Layout */}
                    <Box display="flex" alignItems="center" gap={2} mb={4}>
                        <Box sx={{
                            p: 1.5,
                            borderRadius: '16px',
                            bgcolor: '#25D36615',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <WhatsApp sx={{ fontSize: 32, color: '#25D366' }} />
                        </Box>
                        <Box>
                            <Typography variant="body1" color="textSecondary">
                                Gestiona las notificaciones automáticas y mantén la fluidez de tu negocio.
                            </Typography>
                        </Box>
                    </Box>

                    {loading ? (
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={6}>
                            <CircularProgress size={60} thickness={4} />
                            <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
                                Conectando con WhatsApp...
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            {renderStatus()}
                            {renderQRCode()}
                            {renderActions()}

                            {/* Información */}
                            <Alert
                                severity="info"
                                icon={<Info />}
                                sx={{
                                    mt: 3,
                                    borderRadius: 2
                                }}
                            >
                                <Typography variant="body2">
                                    <strong>Notificaciones automáticas habilitadas:</strong><br />
                                    • Nuevos pedidos y actualizaciones • Recordatorios y confirmaciones
                                </Typography>
                            </Alert>

                            {/* Estado del sistema */}
                            {status && (
                                <Box sx={{
                                    mt: 3,
                                    p: 2,
                                    bgcolor: 'background.default',
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider'
                                }}>
                                    <Typography variant="caption" color="textSecondary">
                                        <strong>ID de sesión:</strong> {status.hasSession ? 'Activa' : 'No disponible'} •
                                        <strong> Última conexión:</strong> {status.lastConnection ?
                                            new Date(status.lastConnection).toLocaleString('es-AR') : 'Nunca'}
                                    </Typography>
                                </Box>
                            )}
                        </>
                    )}

                    {/* Diálogo de prueba */}
                    {renderTestDialog()}
                </Paper>
            </div>
        </AdminLayout>
    );
};

export default WhatsAppConnect;
