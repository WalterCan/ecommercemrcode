import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';

const AdminReminders = () => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const { showToast } = useToast();
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

    const sendAllReminders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl}/reminders/send`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data.results);
                showToast(
                    `Recordatorios enviados: ${data.results.total_sent} exitosos, ${data.results.total_errors} errores`,
                    data.results.total_errors > 0 ? 'warning' : 'success'
                );
            } else {
                showToast('Error al enviar recordatorios', 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        } finally {
            setLoading(false);
        }
    };

    const send24hReminders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl}/reminders/send-24h`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                showToast(
                    `Recordatorios 24h: ${data.results.sent} enviados`,
                    'success'
                );
            } else {
                showToast('Error al enviar recordatorios de 24h', 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        } finally {
            setLoading(false);
        }
    };

    const send1hReminders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl}/reminders/send-1h`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                showToast(
                    `Recordatorios 1h: ${data.results.sent} enviados`,
                    'success'
                );
            } else {
                showToast('Error al enviar recordatorios de 1h', 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">
                        🔔 Gestión de Recordatorios
                    </h1>
                    <p className="text-slate-600">
                        Controla el envío de recordatorios automáticos por email y WhatsApp
                    </p>
                </div>

                {/* Controles Principales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {/* Enviar Todos */}
                    <button
                        onClick={sendAllReminders}
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📧</div>
                        <h3 className="font-bold text-lg mb-1">Enviar Todos</h3>
                        <p className="text-sm text-blue-100">24h + 1h antes</p>
                    </button>

                    {/* Enviar 24h */}
                    <button
                        onClick={send24hReminders}
                        disabled={loading}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📅</div>
                        <h3 className="font-bold text-lg mb-1">Solo 24 Horas</h3>
                        <p className="text-sm text-purple-100">Recordatorio mañana</p>
                    </button>

                    {/* Enviar 1h */}
                    <button
                        onClick={send1hReminders}
                        disabled={loading}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">⏰</div>
                        <h3 className="font-bold text-lg mb-1">Solo 1 Hora</h3>
                        <p className="text-sm text-orange-100">Recordatorio urgente</p>
                    </button>
                </div>

                {/* Estadísticas */}
                {stats && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">📊 Último Envío</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-xl">
                                <div className="text-3xl font-bold text-blue-600">
                                    {stats.reminders_24h.sent}
                                </div>
                                <div className="text-sm text-slate-600 mt-1">24h Enviados</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-xl">
                                <div className="text-3xl font-bold text-purple-600">
                                    {stats.reminders_1h.sent}
                                </div>
                                <div className="text-sm text-slate-600 mt-1">1h Enviados</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-xl">
                                <div className="text-3xl font-bold text-green-600">
                                    {stats.total_sent}
                                </div>
                                <div className="text-sm text-slate-600 mt-1">Total Exitosos</div>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-xl">
                                <div className="text-3xl font-bold text-red-600">
                                    {stats.total_errors}
                                </div>
                                <div className="text-sm text-slate-600 mt-1">Errores</div>
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-slate-500 text-center">
                            Última ejecución: {new Date(stats.timestamp).toLocaleString('es-AR')}
                        </div>
                    </div>
                )}

                {/* Información */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">ℹ️ Información</h2>
                    <div className="space-y-3 text-sm text-slate-600">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">🤖</span>
                            <div>
                                <strong className="text-slate-800">Automático:</strong> El sistema envía recordatorios cada 15 minutos automáticamente.
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">📅</span>
                            <div>
                                <strong className="text-slate-800">24 Horas:</strong> Se envía cuando faltan entre 23-25 horas para el turno.
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">⏰</span>
                            <div>
                                <strong className="text-slate-800">1 Hora:</strong> Se envía cuando faltan entre 30-90 minutos para el turno.
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">✉️</span>
                            <div>
                                <strong className="text-slate-800">Canales:</strong> Email y WhatsApp (si el cliente tiene ambos configurados).
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">🔒</span>
                            <div>
                                <strong className="text-slate-800">Duplicados:</strong> Cada recordatorio se envía solo una vez por turno.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading Overlay */}
                {loading && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-slate-700 font-medium">Enviando recordatorios...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReminders;
