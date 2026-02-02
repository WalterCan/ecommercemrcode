import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';

const AdminAvailability = () => {
    const [therapies, setTherapies] = useState([]);
    const [patients, setPatients] = useState([]);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('future'); // 'future' | 'all'

    // Form State
    const [assignToPatient, setAssignToPatient] = useState(false);
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        end_time: '',
        therapy_type_id: '',
        patient_id: '',
        notes: '',
        assign_to_patient: false
    });

    const { showToast } = useToast();
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    useEffect(() => {
        fetchTherapies();
        fetchPatients();
        fetchMySlots();
    }, [viewMode]);

    const fetchTherapies = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl}/therapies/my-therapies`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setTherapies(data.filter(t => t.active));
        } catch (error) {
            console.error('Error fetching therapies:', error);
        }
    };

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl}/patients`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setPatients(data);
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };

    const fetchMySlots = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Si viewMode es 'all', incluimos pasados. Si es 'future', no enviamos nada (backend por defecto filtra) o enviamos false.
            const query = viewMode === 'all' ? '?include_past=true' : '';
            const response = await fetch(`${baseUrl}/availability/my-slots${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setSlots(data);
        } catch (error) {
            console.error('Error fetching slots:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar que end_time > time
        if (formData.time >= formData.end_time) {
            showToast('La hora de fin debe ser posterior a la hora de inicio', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl}/availability`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    assign_to_patient: assignToPatient
                })
            });

            if (response.ok) {
                showToast(assignToPatient ? 'Turno asignado exitosamente' : 'Disponibilidad publicada', 'success');
                setFormData({
                    date: '',
                    time: '',
                    end_time: '',
                    therapy_type_id: '',
                    patient_id: '',
                    notes: '',
                    assign_to_patient: false
                });
                setAssignToPatient(false);
                fetchMySlots(); // Refresh current view
            } else {
                const error = await response.json();
                showToast(error.error || 'Error al crear', 'error');
            }
        } catch (error) {
            console.error('Error creating availability:', error);
            showToast('Error de conexión', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este horario?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl}/availability/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                showToast('Horario eliminado', 'success');
                fetchMySlots();
            } else {
                const error = await response.json();
                showToast(error.error || 'Error al eliminar', 'error');
            }
        } catch (error) {
            console.error('Error deleting slot:', error);
            showToast('Error de conexión', 'error');
        }
    };

    const getStatusBadge = (slot) => {
        if (slot.status === 'available') {
            return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Disponible</span>;
        }
        if (slot.status === 'scheduled' && slot.patient) {
            return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Reservado</span>;
        }
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{slot.status}</span>;
    };

    return (
        <AdminLayout title="Gestión de Disponibilidad">
            <div className="p-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Formulario */}
                    <div className="bg-white rounded-3xl shadow-sm border border-beige-dark/10 p-8">
                        <h3 className="text-xl font-bold mb-6">📅 Crear Horario</h3>

                        {/* Toggle: Disponible vs Asignar a Paciente */}
                        <div className="mb-6 flex gap-2">
                            <button
                                type="button"
                                onClick={() => setAssignToPatient(false)}
                                className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${!assignToPatient
                                    ? 'bg-earth text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                Disponible Públicamente
                            </button>
                            <button
                                type="button"
                                onClick={() => setAssignToPatient(true)}
                                className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${assignToPatient
                                    ? 'bg-earth text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                Asignar a Paciente
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Fecha</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Hora Inicio</label>
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        required
                                        className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Hora Fin</label>
                                    <input
                                        type="time"
                                        value={formData.end_time}
                                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                        required
                                        className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth"
                                    />
                                </div>
                            </div>

                            {assignToPatient && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Paciente</label>
                                        <select
                                            value={formData.patient_id}
                                            onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                                            required={assignToPatient}
                                            className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth"
                                        >
                                            <option value="">Seleccionar paciente</option>
                                            {patients.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.first_name} {p.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Tipo de Terapia</label>
                                        <select
                                            value={formData.therapy_type_id}
                                            onChange={(e) => setFormData({ ...formData, therapy_type_id: e.target.value })}
                                            required={assignToPatient}
                                            className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth"
                                        >
                                            <option value="">Seleccionar terapia</option>
                                            {therapies.map(t => (
                                                <option key={t.id} value={t.id}>{t.name} ({t.duration} min)</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Notas (Opcional)</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            rows="3"
                                            className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth"
                                            placeholder="Detalles adicionales..."
                                        />
                                    </div>
                                </>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-earth text-white px-6 py-3 rounded-xl font-bold hover:bg-earth-dark transition-all"
                            >
                                {assignToPatient ? 'Asignar Turno' : 'Publicar Disponibilidad'}
                            </button>
                        </form>
                    </div>

                    {/* Lista de horarios */}
                    <div className="bg-white rounded-3xl shadow-sm border border-beige-dark/10 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">🕐 Mis Horarios</h3>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode('future')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'future' ? 'bg-white text-earth shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Próximos
                                </button>
                                <button
                                    onClick={() => setViewMode('all')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'all' ? 'bg-white text-earth shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Historial
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="py-10 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-earth mx-auto"></div>
                            </div>
                        ) : slots.length === 0 ? (
                            <p className="text-slate-400 text-center py-10">
                                {viewMode === 'future' ? 'No hay horarios próximos' : 'No hay horarios registrados'}
                            </p>
                        ) : (
                            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                {slots.map(slot => (
                                    <div key={slot.id} className="p-4 bg-beige-light/30 rounded-xl border border-beige-dark/10">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-bold text-slate-800">
                                                        {format(parse(slot.date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy', { locale: es })}
                                                    </p>
                                                    {getStatusBadge(slot)}
                                                </div>
                                                <p className="text-sm text-slate-600">
                                                    🕐 {slot.time?.substring(0, 5)} - {slot.end_time?.substring(0, 5)}
                                                </p>
                                                {slot.therapy && (
                                                    <p className="text-sm text-earth font-bold mt-1">
                                                        {slot.therapy.name}
                                                    </p>
                                                )}
                                                {slot.patient && (
                                                    <p className="text-sm text-blue-600 mt-1">
                                                        👤 {slot.patient.user?.name || 'Paciente'}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDelete(slot.id)}
                                                className="p-2 hover:text-terracotta transition-colors text-slate-400"
                                                title="Eliminar"
                                            >
                                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminAvailability;
