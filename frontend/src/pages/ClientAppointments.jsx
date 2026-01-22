import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SEO from '../components/common/SEO';
import { useAuth } from '../context/AuthContext';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '../context/ToastContext';

/**
 * Vista de "Mis Turnos" para el cliente.
 */
const ClientAppointments = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // Estado para modal de reprogramación
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedNewSlot, setSelectedNewSlot] = useState(null);
    const [loadingSlots, setLoadingSlots] = useState(false);

    useEffect(() => {
        fetchAppointments();
    }, [user]);

    const fetchAppointments = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const token = user?.token || localStorage.getItem('token');

            const res = await fetch(`${baseUrl}/appointments/my-appointments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setAppointments(data);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableSlots = async () => {
        setLoadingSlots(true);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const token = user?.token || localStorage.getItem('token');

            const res = await fetch(`${baseUrl}/availability`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setAvailableSlots(data);
            }
        } catch (error) {
            console.error('Error fetching available slots:', error);
            showToast('Error al cargar horarios disponibles', 'error');
        } finally {
            setLoadingSlots(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            available: 'bg-green-100 text-green-800',
            scheduled: 'bg-blue-100 text-blue-800',
            completed: 'bg-emerald-100 text-emerald-800',
            cancelled: 'bg-red-100 text-red-800',
            no_show: 'bg-orange-100 text-orange-800',
            blocked: 'bg-gray-100 text-gray-800'
        };
        const labels = {
            available: 'Disponible',
            scheduled: 'Confirmado',
            completed: 'Completado',
            cancelled: 'Cancelado',
            no_show: 'No asistió',
            blocked: 'Bloqueado'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const handleCancel = async (id) => {
        if (!window.confirm('¿Seguro que deseas cancelar este turno?')) return;

        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const token = user?.token || localStorage.getItem('token');
            const res = await fetch(`${baseUrl}/appointments/my-appointments/${id}/cancel`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                showToast('Turno cancelado exitosamente', 'success');
                fetchAppointments(); // Recargar lista
            } else {
                const error = await res.json();
                showToast(error.error || 'Error al cancelar', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Error de conexión', 'error');
        }
    };

    const handleOpenReschedule = (appointment) => {
        setSelectedAppointment(appointment);
        setIsRescheduleModalOpen(true);
        setSelectedNewSlot(null);
        fetchAvailableSlots();
    };

    const handleReschedule = async () => {
        if (!selectedNewSlot) {
            showToast('Debes seleccionar un nuevo horario', 'error');
            return;
        }

        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const token = user?.token || localStorage.getItem('token');

            const res = await fetch(`${baseUrl}/appointments/my-appointments/${selectedAppointment.id}/reschedule`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ new_appointment_id: selectedNewSlot })
            });

            if (res.ok) {
                showToast('Turno reprogramado exitosamente', 'success');
                setIsRescheduleModalOpen(false);
                fetchAppointments();
            } else {
                const error = await res.json();
                showToast(error.error || 'Error al reprogramar', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Error de conexión', 'error');
        }
    };

    // Separar turnos próximos y pasados
    const now = new Date();
    const upcomingAppointments = appointments.filter(apt => {
        if (apt.status === 'cancelled' || apt.status === 'completed') return false;

        const aptDate = parseISO(apt.date);
        const [hours, minutes] = apt.time.split(':');
        aptDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        return aptDate >= now;
    });

    const pastAppointments = appointments.filter(apt => {
        if (apt.status === 'cancelled' || apt.status === 'completed') return true;

        const aptDate = parseISO(apt.date);
        const [hours, minutes] = apt.time.split(':');
        aptDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        return aptDate < now;
    });

    // Agrupar slots disponibles por fecha
    const groupedSlots = availableSlots.reduce((acc, slot) => {
        if (!acc[slot.date]) acc[slot.date] = [];
        acc[slot.date].push(slot);
        return acc;
    }, {});

    return (
        <>
            <SEO title="Mis Turnos" description="Gestiona tus próximas citas" />
            <Header />

            <div className="min-h-screen bg-gradient-to-br from-beige-light via-paper to-beige-light/50 py-20">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-slate-800 mb-4">Mis Turnos</h1>
                        <p className="text-slate-600">Gestiona tus citas y tratamientos</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-earth"></div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Próximos Turnos */}
                            <div className="bg-white rounded-3xl shadow-lg border border-beige-dark/10 p-8">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    <span>📅</span> Próximos Turnos
                                </h2>

                                {upcomingAppointments.length > 0 ? (
                                    <div className="space-y-4">
                                        {upcomingAppointments.map((apt) => (
                                            <div key={apt.id} className="border border-beige-dark/20 rounded-xl p-6 hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <h3 className="text-xl font-bold text-slate-800">
                                                                {format(parseISO(apt.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                                                            </h3>
                                                            {getStatusBadge(apt.status)}
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                            <div>
                                                                <p className="text-sm text-slate-500 mb-1">Horario</p>
                                                                <p className="font-bold text-lg text-earth">
                                                                    🕐 {apt.time?.substring(0, 5)} - {apt.end_time?.substring(0, 5)}
                                                                </p>
                                                            </div>

                                                            {apt.therapy && (
                                                                <div>
                                                                    <p className="text-sm text-slate-500 mb-1">Terapia</p>
                                                                    <p className="font-bold text-slate-800">{apt.therapy.name}</p>
                                                                    <p className="text-sm text-slate-600">⏱️ {apt.therapy.duration} min</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {apt.notes && (
                                                            <div className="bg-beige-light/30 rounded-lg p-3 mb-4">
                                                                <p className="text-sm text-slate-600">
                                                                    <span className="font-bold">Notas:</span> {apt.notes}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {apt.status === 'scheduled' && (
                                                        <div className="ml-4 flex flex-col gap-2">
                                                            <button
                                                                onClick={() => handleOpenReschedule(apt)}
                                                                className="px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            >
                                                                Reprogramar
                                                            </button>
                                                            <button
                                                                onClick={() => handleCancel(apt.id)}
                                                                className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-beige-light/20 rounded-xl border border-dashed border-beige-dark/20">
                                        <p className="text-slate-400 mb-4">No tienes turnos próximos</p>
                                        <a
                                            href="/reservar-turno"
                                            className="inline-block bg-earth text-white px-6 py-3 rounded-xl font-bold hover:bg-earth-dark transition-colors"
                                        >
                                            Reservar Turno
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Historial */}
                            {pastAppointments.length > 0 && (
                                <div className="bg-white rounded-3xl shadow-lg border border-beige-dark/10 p-8">
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <span>📋</span> Historial
                                    </h2>

                                    <div className="space-y-3">
                                        {pastAppointments.map((apt) => (
                                            <div key={apt.id} className="border border-beige-dark/10 rounded-xl p-4 bg-slate-50/50">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <p className="font-bold text-slate-700">
                                                                {format(parseISO(apt.date), "d 'de' MMMM, yyyy", { locale: es })}
                                                            </p>
                                                            <span className="text-slate-500">•</span>
                                                            <p className="text-slate-600">
                                                                {apt.time?.substring(0, 5)} - {apt.end_time?.substring(0, 5)}
                                                            </p>
                                                            {getStatusBadge(apt.status)}
                                                        </div>
                                                        {apt.therapy && (
                                                            <p className="text-sm text-slate-600">{apt.therapy.name}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Reprogramación */}
            {isRescheduleModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Reprogramar Turno</h2>
                            <button
                                onClick={() => setIsRescheduleModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {selectedAppointment && (
                            <div className="bg-blue-50 rounded-xl p-4 mb-6">
                                <p className="text-sm text-slate-600 mb-2">Turno actual:</p>
                                <p className="font-bold text-lg">
                                    {format(parseISO(selectedAppointment.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                                </p>
                                <p className="text-earth font-bold">
                                    {selectedAppointment.time?.substring(0, 5)} - {selectedAppointment.end_time?.substring(0, 5)}
                                </p>
                                {selectedAppointment.therapy && (
                                    <p className="text-sm text-slate-600 mt-2">{selectedAppointment.therapy.name}</p>
                                )}
                            </div>
                        )}

                        <h3 className="font-bold mb-4">Selecciona un nuevo horario:</h3>

                        {loadingSlots ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-earth"></div>
                            </div>
                        ) : Object.keys(groupedSlots).length > 0 ? (
                            <div className="space-y-6">
                                {Object.entries(groupedSlots).map(([date, slots]) => (
                                    <div key={date}>
                                        <h4 className="font-bold text-slate-700 mb-3">
                                            {format(parseISO(date), "EEEE d 'de' MMMM", { locale: es })}
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {slots.map((slot) => (
                                                <button
                                                    key={slot.id}
                                                    onClick={() => setSelectedNewSlot(slot.id)}
                                                    className={`p-3 rounded-lg border-2 transition-all ${selectedNewSlot === slot.id
                                                        ? 'border-earth bg-earth text-white'
                                                        : 'border-beige-dark/20 hover:border-earth hover:bg-earth/5'
                                                        }`}
                                                >
                                                    <p className="font-bold">
                                                        {slot.time?.substring(0, 5)} - {slot.end_time?.substring(0, 5)}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-slate-400 py-10">No hay horarios disponibles</p>
                        )}

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setIsRescheduleModalOpen(false)}
                                className="flex-1 px-6 py-3 border-2 border-slate-300 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleReschedule}
                                disabled={!selectedNewSlot}
                                className="flex-1 px-6 py-3 bg-earth text-white rounded-xl font-bold hover:bg-earth-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirmar Reprogramación
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default ClientAppointments;
