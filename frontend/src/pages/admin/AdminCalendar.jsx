import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import { format, startOfWeek, addDays, isSameDay, parse, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Autocomplete, TextField } from '@mui/material';

const AdminCalendar = () => {
    const { showToast } = useToast();
    const { settings } = useSettings();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null); // { date, time }
    const [appointmentType, setAppointmentType] = useState('regular'); // 'regular' | 'blocked'
    const [selectedEventId, setSelectedEventId] = useState(null); // ID to update if overwriting 'available'
    const [formData, setFormData] = useState({
        patient_id: '',
        product_id: '',
        notes: ''
    });

    const [paymentAmount, setPaymentAmount] = useState('');

    useEffect(() => {
        if (!isModalOpen) {
            setPaymentAmount('');
            setFormData({ patient_id: '', product_id: '', notes: '' });
        }
    }, [isModalOpen]);
    const startHourStr = settings.agenda_start_time || '09:00';
    const endHourStr = settings.agenda_end_time || '22:00';
    const START_HOUR = parseInt(startHourStr.split(':')[0]);
    const END_HOUR = parseInt(endHourStr.split(':')[0]);

    useEffect(() => {
        fetchData();
    }, [currentDate]);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

            const startStr = format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
            const endStr = format(addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 6), 'yyyy-MM-dd');

            const response = await fetch(`${baseUrl}/appointments?start=${startStr}&end=${endStr}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setAppointments(data);
        } catch (error) {
            console.error(error);
            showToast('Error al cargar agenda', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchResources = async () => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            const patRes = await fetch(`${baseUrl}/patients`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (patRes.ok) setPatients(await patRes.json());

            // Fetch Therapies (Servicios) directly from the dedicated endpoint
            const therapyRes = await fetch(`${baseUrl}/therapies`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (therapyRes.ok) {
                setServices(await therapyRes.json());
            }
        } catch (error) {
            console.error('Error loading resources', error);
        }
    };

    const getEventForSlot = (dayDate, hour) => {
        const dateStr = format(dayDate, 'yyyy-MM-dd');
        return appointments.find(a =>
            a.date === dateStr && a.time.startsWith(hour.toString().padStart(2, '0')) && a.status !== 'cancelled'
        );
    };

    const handleSlotClick = (dayDate, hour) => {
        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
        const dateStr = format(dayDate, 'yyyy-MM-dd');

        // Check if there is an existing event
        const existingEvent = getEventForSlot(dayDate, hour);

        setSelectedSlot({ date: dateStr, time: timeStr });
        setFormData({ patient_id: '', product_id: '', notes: '' });
        setAppointmentType('regular');

        // CRITICAL LOGIC CHANGE:
        // If event exists AND is 'available', we treat it as an empty slot ready to be filled (Updated).
        // If event exists AND is NOT 'available' (scheduled/blocked/confirmed), we treat it as View Details.
        if (existingEvent && existingEvent.status === 'available') {
            setSelectedEventId(existingEvent.id); // Valid ID to update
            // Don't set isViewingDetails, just open modal for assignment
        } else {
            setSelectedEventId(null); // New creation or View Details handled in render
        }

        setIsModalOpen(true);
    };

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

            const payload = {
                date: selectedSlot.date,
                time: selectedSlot.time,
                notes: formData.notes
            };

            if (appointmentType === 'regular') {
                payload.patient_id = formData.patient_id;
                payload.product_id = formData.product_id;
                payload.status = 'scheduled';
            } else {
                payload.patient_id = null;
                payload.product_id = null;
                payload.status = 'blocked';
                payload.notes = formData.notes || 'Bloqueado Administrativo';
            }

            let response;
            if (selectedEventId) {
                // UPDATE existing (e.g., assigning a patient to an 'available' slot)
                response = await fetch(`${baseUrl}/appointments/${selectedEventId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
            } else {
                // CREATE new
                response = await fetch(`${baseUrl}/appointments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
            }

            if (response.ok) {
                showToast(appointmentType === 'blocked' ? 'Horario bloqueado' : 'Turno agendado', 'success');
                setIsModalOpen(false);
                fetchData();
            } else {
                const err = await response.json();
                showToast(err.error || 'Error al procesar', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Error de conexión', 'error');
        }
    };

    // Helper to determine if we should show Details or Form
    const shouldShowDetails = () => {
        if (!selectedSlot) return false;
        const dateObj = parse(selectedSlot.date, 'yyyy-MM-dd', new Date());
        const hour = parseInt(selectedSlot.time.split(':')[0]);
        const event = getEventForSlot(dateObj, hour);

        // If no event, definitely Form
        if (!event) return false;

        // If event exists but is 'available', we want Form (to assign)
        if (event.status === 'available') return false;

        // Otherwise (scheduled, blocked, confirmed), show Details
        return true;
    };

    // Calendar Grid Gen
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(weekStart, i)); // Lun-Vie
    const hours = [];
    if (END_HOUR >= START_HOUR) {
        for (let i = START_HOUR; i <= END_HOUR; i++) hours.push(i);
    } else {
        for (let i = 9; i <= 22; i++) hours.push(i);
    }

    return (
        <AdminLayout title="Agenda Semanal">
            <div className="p-8 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-serif text-earth font-bold">Agenda</h2>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm">
                        <button onClick={() => setCurrentDate(d => addDays(d, -7))} className="p-2 hover:bg-slate-100 rounded-lg">&lt;</button>
                        <span className="font-bold text-slate-700 w-48 text-center capitalize">
                            {format(currentDate, 'MMMM yyyy', { locale: es })}
                        </span>
                        <button onClick={() => setCurrentDate(d => addDays(d, 7))} className="p-2 hover:bg-slate-100 rounded-lg">&gt;</button>
                    </div>
                    <div className="w-24"></div>
                </div>

                <div className="flex-1 bg-white rounded-3xl shadow-sm border border-beige-dark/10 overflow-hidden flex flex-col">
                    <div className="grid grid-cols-6 border-b border-beige-dark/10 bg-paper">
                        <div className="p-4 border-r border-beige-dark/10 font-bold text-slate-400 text-xs uppercase text-center py-6">Hora</div>
                        {weekDays.map(day => (
                            <div key={day.toString()} className={`p-4 border-r border-beige-dark/10 text-center ${isSameDay(day, new Date()) ? 'bg-earth/10' : ''}`}>
                                <div className="text-xs font-bold uppercase text-slate-500 mb-1">{format(day, 'EEEE', { locale: es })}</div>
                                <div className={`text-xl font-serif font-bold ${isSameDay(day, new Date()) ? 'text-earth' : 'text-slate-800'}`}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-6">
                            <div className="border-r border-beige-dark/10 bg-slate-50">
                                {hours.map(hour => (
                                    <div key={hour} className="h-24 border-b border-beige-dark/10 px-4 py-2 text-xs font-bold text-slate-400 text-right">
                                        {`${hour.toString().padStart(2, '0')}:00`}
                                    </div>
                                ))}
                            </div>

                            {weekDays.map(day => (
                                <div key={day.toString()} className="border-r border-beige-dark/10 relative">
                                    {hours.map(hour => {
                                        const event = getEventForSlot(day, hour);
                                        const isBlocked = event?.status === 'blocked';
                                        const isAvailable = event?.status === 'available';

                                        return (
                                            <div
                                                key={hour}
                                                className={`h-24 border-b border-beige-dark/10 p-1 relative group cursor-pointer transition-colors hover:bg-slate-50`}
                                                onClick={() => handleSlotClick(day, hour)}
                                            >
                                                {event ? (
                                                    <div className={`h-full w-full rounded-md p-2 text-xs overflow-hidden shadow-sm hover:translate-y-[-1px] transition-all flex flex-col justify-center ${isBlocked ? 'bg-slate-100 border-l-4 border-slate-400 text-slate-500 italic' :
                                                        isAvailable ? 'bg-green-50 border-l-4 border-green-400 text-green-700 dashed border-2 border-green-200' :
                                                            'bg-earth/10 border-l-4 border-earth text-earth-dark'
                                                        }`}>
                                                        {isBlocked ? (
                                                            <div className="text-center font-bold">⚠️ NO DISPONIBLE</div>
                                                        ) : isAvailable ? (
                                                            <div className="text-center font-bold">✅ DISPONIBLE</div>
                                                        ) : (
                                                            <>
                                                                <div className="font-bold truncate">{event.patient?.user?.name || 'Paciente'}</div>
                                                                <div className="truncate opacity-80">{event.therapy?.name || 'Servicio'}</div>
                                                                <div className="mt-1 opacity-60 text-[10px]">{event.time.substring(0, 5)}</div>
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="hidden group-hover:flex items-center justify-center h-full w-full opacity-0 group-hover:opacity-50 text-slate-300 text-2xl font-light">+</div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-beige-dark/10 flex justify-between items-center bg-paper">
                                <div>
                                    <h3 className="text-lg font-serif font-bold text-earth">Gestión de Turno</h3>
                                    <p className="text-xs text-slate-500 capitalize">
                                        {selectedSlot && format(parse(selectedSlot.date, 'yyyy-MM-dd', new Date()), 'EEEE d MMMM', { locale: es })} - {selectedSlot?.time}
                                    </p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-earth text-2xl">&times;</button>
                            </div>

                            {/* Logic to Show Details vs Form */}
                            {shouldShowDetails() ? (
                                (() => {
                                    const event = getEventForSlot(parse(selectedSlot.date, 'yyyy-MM-dd', new Date()), parseInt(selectedSlot.time.split(':')[0]));
                                    const price = parseFloat(event.price_amount || 0);
                                    const paid = parseFloat(event.paid_amount || 0);
                                    const balance = price - paid;

                                    return (
                                        <div className="p-6 space-y-6">
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-400 uppercase">Paciente</p>
                                                        <h4 className="font-bold text-lg text-slate-800">{event.patient?.user?.name || 'Paciente'}</h4>
                                                        <p className="text-sm text-slate-500">{event.patient?.dni}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-bold text-slate-400 uppercase">Servicio</p>
                                                        <h4 className="font-bold text-slate-700">{event.therapy?.name || 'Tratamiento'}</h4>
                                                        <p className="text-sm text-slate-500">{event.time?.substring(0, 5)} hs</p>
                                                    </div>
                                                </div>
                                                {event.notes && <div className="bg-white p-3 rounded-lg border border-slate-100 italic text-slate-600 text-sm">"{event.notes}"</div>}
                                            </div>

                                            {event.status !== 'blocked' && (
                                                <div className="border-t border-slate-100 pt-4">
                                                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><span>💰</span> Estado del Pago</h4>
                                                    <div className="grid grid-cols-3 gap-2 text-center mb-4">
                                                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                                                            <p className="text-[10px] text-slate-400 uppercase font-bold">Total</p>
                                                            <p className="font-bold text-slate-700">${price.toLocaleString('es-AR')}</p>
                                                        </div>
                                                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                                                            <p className="text-[10px] text-slate-400 uppercase font-bold">Pagado</p>
                                                            <p className="font-bold text-green-600">${paid.toLocaleString('es-AR')}</p>
                                                        </div>
                                                        <div className={`bg-white p-2 rounded-lg border ${balance > 0 ? 'border-red-200 bg-red-50' : 'border-slate-200'}`}>
                                                            <p className="text-[10px] text-slate-400 uppercase font-bold">Saldo</p>
                                                            <p className={`font-bold ${balance > 0 ? 'text-red-500' : 'text-slate-400'}`}>${balance.toLocaleString('es-AR')}</p>
                                                        </div>
                                                    </div>
                                                    {balance > 0 && (
                                                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 mt-2">
                                                            <label className="block text-xs font-bold text-green-700 mb-2 uppercase">Registrar Nuevo Pago</label>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    placeholder="Monto a abonar"
                                                                    className="flex-1 bg-white border border-green-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 text-slate-700 font-bold"
                                                                    value={paymentAmount}
                                                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={async () => {
                                                                        const amount = parseFloat(paymentAmount);
                                                                        if (!amount || amount <= 0) {
                                                                            showToast('Ingrese un monto válido', 'error');
                                                                            return;
                                                                        }
                                                                        if (!window.confirm(`¿Confirmar pago de $${amount}?`)) return;

                                                                        try {
                                                                            const token = localStorage.getItem('token');
                                                                            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

                                                                            const res = await fetch(`${baseUrl}/appointments/${event.id}/pay-balance`, {
                                                                                method: 'PUT',
                                                                                headers: {
                                                                                    'Content-Type': 'application/json',
                                                                                    'Authorization': `Bearer ${token}`
                                                                                },
                                                                                body: JSON.stringify({ amount })
                                                                            });

                                                                            if (res.ok) {
                                                                                showToast('Pago registrado correctamente', 'success');
                                                                                const data = await res.json();
                                                                                // If paid in full, might want to close, but maybe just refresh data
                                                                                fetchData();
                                                                                // If fully paid, maybe close modal? Or keep open to see updated balance?
                                                                                // Let's close modal if balance is now 0, or just refresh.
                                                                                // Actually refresh is enough, user can see the new balance.
                                                                                // But let's check one thing: if paid >= balance, close.
                                                                                if (data.appointment && data.appointment.payment_status === 'paid') {
                                                                                    setIsModalOpen(false);
                                                                                } else {
                                                                                    // Clear input but keep modal open to see 'Saldo' updated (re-render will happen due to fetchData -> appointments update)
                                                                                    // However, 'event' is derived from 'appointments' state in render. 
                                                                                    // 'fetchData' updates 'appointments', triggering re-render.
                                                                                    setPaymentAmount('');
                                                                                }
                                                                            } else {
                                                                                const err = await res.json();
                                                                                showToast(err.error || 'Error al registrar pago', 'error');
                                                                            }
                                                                        } catch (e) { showToast('Error de red', 'error'); }
                                                                    }}
                                                                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 rounded-lg transition-colors shadow-sm shadow-green-200"
                                                                >
                                                                    Registrar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <div className="pt-2">
                                                <button onClick={() => setIsModalOpen(false)} className="w-full py-3 border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-colors">Cerrar Detalles</button>
                                            </div>
                                        </div>
                                    );
                                })()
                            ) : (
                                <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-4">
                                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4">
                                        <button type="button" onClick={() => setAppointmentType('regular')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${appointmentType === 'regular' ? 'bg-white text-earth shadow-sm' : 'text-slate-400'}`}>Crear Turno</button>
                                        <button type="button" onClick={() => setAppointmentType('blocked')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${appointmentType === 'blocked' ? 'bg-white text-slate-600 shadow-sm' : 'text-slate-400'}`}>Bloquear Horario</button>
                                    </div>

                                    {appointmentType === 'regular' && (
                                        <>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1">Paciente</label>
                                                <Autocomplete
                                                    options={patients}
                                                    getOptionLabel={(option) => `${option.user?.name || 'Sin Nombre'} (DNI: ${option.dni || 'N/A'})`}
                                                    value={patients.find(p => p.id === parseInt(formData.patient_id)) || null}
                                                    onChange={(_, newValue) => setFormData({ ...formData, patient_id: newValue ? newValue.id : '' })}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            placeholder="Buscar por nombre o DNI..."
                                                            variant="outlined"
                                                            size="small"
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: '0.5rem',
                                                                    backgroundColor: '#f8fafc', // bg-paper
                                                                    '& fieldset': { borderColor: '#e2e8f0' }, // border-slate-200
                                                                    '&:hover fieldset': { borderColor: '#cbd5e1' },
                                                                    '&.Mui-focused fieldset': { borderColor: '#d97706' }, // text-earth
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                    noOptionsText="No se encontraron pacientes"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1">Servicio / Tratamiento</label>
                                                <select
                                                    required
                                                    className="w-full bg-paper border border-beige-dark/20 rounded-lg p-3 focus:border-earth focus:outline-none"
                                                    value={formData.product_id}
                                                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                                                >
                                                    <option value="">Seleccionar Servicio</option>
                                                    {services.map(s => (
                                                        <option key={s.id} value={s.id}>{s.name} ({s.duration} min) - ${s.price}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">{appointmentType === 'regular' ? 'Notas (Opcional)' : 'Motivo del Bloqueo'}</label>
                                        <textarea
                                            rows="2"
                                            className="w-full bg-paper border border-beige-dark/20 rounded-lg p-3 focus:border-earth focus:outline-none"
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            placeholder={appointmentType === 'regular' ? "Detalles para el profesional..." : "Ej: Almuerzo, Trámite personal..."}
                                        ></textarea>
                                    </div>

                                    <div className="pt-4 flex justify-end gap-3">
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100">Cancelar</button>
                                        <button type="submit" className={`px-6 py-2 rounded-xl font-bold shadow-lg transition-all ${appointmentType === 'blocked' ? 'bg-slate-600 text-white hover:bg-slate-700 shadow-slate-300' : 'bg-earth text-white hover:bg-earth-dark shadow-earth/20'}`}>
                                            {appointmentType === 'regular' ? (selectedEventId ? 'Agendar (Actualizar)' : 'Confirmar Reserva') : 'Bloquear Horario'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminCalendar;
