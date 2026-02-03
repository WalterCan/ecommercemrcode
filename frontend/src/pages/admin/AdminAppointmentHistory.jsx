import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../context/ToastContext';
import { format, subDays, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Autocomplete, TextField } from '@mui/material';

const AdminAppointmentHistory = () => {
    const { showToast } = useToast();
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [dateRange, setDateRange] = useState({
        start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        end: format(addDays(new Date(), 30), 'yyyy-MM-dd')
    });
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchResources();
        fetchHistory();
    }, [dateRange, selectedPatient, filterStatus]);

    const fetchResources = async () => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const patRes = await fetch(`${baseUrl}/patients`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (patRes.ok) setPatients(await patRes.json());
        } catch (error) {
            console.error('Error loading patients', error);
        }
    };

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

            let url = `${baseUrl}/appointments?start=${dateRange.start}&end=${dateRange.end}`;
            if (selectedPatient) url += `&patient_id=${selectedPatient.id}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok) {
                // Filtrar por estado si no es 'all'
                let filtered = data;
                if (filterStatus !== 'all') {
                    filtered = data.filter(a => a.status === filterStatus);
                }
                setAppointments(filtered);
            }
        } catch (error) {
            console.error(error);
            showToast('Error al cargar historial', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            scheduled: 'bg-blue-100 text-blue-800',
            confirmed: 'bg-indigo-100 text-indigo-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            no_show: 'bg-slate-100 text-slate-800',
            available: 'bg-green-50 text-green-600 border-dashed border'
        };
        const labels = {
            scheduled: 'Pendiente',
            confirmed: 'Confirmado',
            completed: 'Completado',
            cancelled: 'Cancelado',
            no_show: 'No asistió',
            available: 'Disponible'
        };
        return <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${styles[status]}`}>{labels[status] || status}</span>;
    };

    const getPaymentBadge = (status) => {
        const styles = {
            pending: 'bg-orange-100 text-orange-800',
            partial: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-green-100 text-green-800',
            refunded: 'bg-slate-100 text-slate-800'
        };
        const labels = {
            pending: 'Pendiente',
            partial: 'Parcial',
            paid: 'Pagado',
            refunded: 'Reembolsado'
        };
        return <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${styles[status]}`}>{labels[status] || status}</span>;
    };


    return (
        <AdminLayout title="Historial de Turnos y Pagos">
            <div className="p-8">
                {/* Filtros */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-beige-dark/10 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Desde</label>
                            <input
                                type="date"
                                className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 text-sm focus:outline-none focus:border-earth"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Hasta</label>
                            <input
                                type="date"
                                className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 text-sm focus:outline-none focus:border-earth"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Paciente</label>
                            <Autocomplete
                                options={patients}
                                getOptionLabel={(option) => `${option.user?.name || ''} (${option.dni})`}
                                value={selectedPatient}
                                onChange={(_, newValue) => setSelectedPatient(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Buscar paciente..."
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '0.75rem',
                                                backgroundColor: '#f8fafc',
                                                '& fieldset': { borderColor: '#e2e8f0' },
                                            }
                                        }}
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Estado</label>
                            <select
                                className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 text-sm focus:outline-none focus:border-earth"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">Todos los Estados</option>
                                <option value="scheduled">Pendientes</option>
                                <option value="confirmed">Confirmados</option>
                                <option value="completed">Completados</option>
                                <option value="cancelled">Cancelados</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tabla de Resultados */}
                <div className="bg-white rounded-3xl shadow-sm border border-beige-dark/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-paper border-b border-beige-dark/10">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Fecha y Hora</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Paciente</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Terapia</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Método Pago</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Estado</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Pago</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-beige-dark/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-20 text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-earth mx-auto"></div>
                                        </td>
                                    </tr>
                                ) : appointments.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-20 text-center text-slate-500 italic">
                                            No se encontraron turnos agendados en este rango.
                                        </td>
                                    </tr>
                                ) : (
                                    appointments.map((apt) => (
                                        <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-sm">
                                                <div className="font-bold text-slate-700">{format(new Date(apt.date), 'dd/MM/yyyy')}</div>
                                                <div className="text-xs text-slate-400">{apt.time.substring(0, 5)} hs</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-slate-700">{apt.patient?.user?.name || 'Cliente sin nombre'}</div>
                                                <div className="text-xs text-slate-400">DNI: {apt.patient?.dni || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-slate-600">{apt.therapy?.name || 'Servicio'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-medium text-slate-500 uppercase">
                                                    {apt.payment_method === 'mercadopago' ? '💳 MP' :
                                                        apt.payment_method === 'transfer' ? '🏦 Transf' :
                                                            apt.payment_method === 'cash' ? '💵 Efect' : '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(apt.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getPaymentBadge(apt.payment_status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-sm font-bold text-earth">${parseFloat(apt.price_amount || 0).toLocaleString('es-AR')}</div>
                                                {parseFloat(apt.paid_amount) < parseFloat(apt.price_amount) && (
                                                    <div className="text-[10px] text-red-400 font-bold">Falta: ${(parseFloat(apt.price_amount) - parseFloat(apt.paid_amount)).toLocaleString('es-AR')}</div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminAppointmentHistory;
