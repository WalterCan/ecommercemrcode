import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import { format, startOfWeek, addDays, startOfDay, addMinutes, isSameDay, parseISO, setHours, setMinutes } from 'date-fns';
import { es } from 'date-fns/locale';

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
    const [formData, setFormData] = useState({
        patient_id: '',
        product_id: '',
        notes: ''
    });

    // Config dinámica desde Settings
    const startHourStr = settings.agenda_start_time || '09:00';
    const endHourStr = settings.agenda_end_time || '22:00'; // Extendido a 22:00
    const START_HOUR = parseInt(startHourStr.split(':')[0]);
    const END_HOUR = parseInt(endHourStr.split(':')[0]);

    useEffect(() => {
        fetchData();
    }, [currentDate]);

    useEffect(() => {
        fetchResources(); // Patients & Services
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

            // Cargar Pacientes
            const patRes = await fetch(`${baseUrl}/patients`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (patRes.ok) setPatients(await patRes.json());

            // Cargar Servicios (Productos tipo 'service')
            // Nota: Podría necesitar un endpoint específico o filtrar en cliente
            const prodRes = await fetch(`${baseUrl}/products`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (prodRes.ok) {
                const allProds = await prodRes.json();
                setServices(allProds.filter(p => p.type === 'service'));
            }
        } catch (error) {
            console.error('Error loading resources', error);
        }
    };

    const handleSlotClick = (dayDate, hour) => {
        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
        const dateStr = format(dayDate, 'yyyy-MM-dd');
        setSelectedSlot({ date: dateStr, time: timeStr });
        setFormData({ patient_id: '', product_id: '', notes: '' });
        setAppointmentType('regular'); // Reset type
        setIsModalOpen(true);
    };

    const handleCreate = async (e) => {
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

            const response = await fetch(`${baseUrl}/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

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

    // Calendar Grid Gen
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(weekStart, i)); // Lun-Vie
    // Generar horas basadas en configuración START_HOUR a END_HOUR
    const hours = [];
    if (END_HOUR >= START_HOUR) {
        for (let i = START_HOUR; i <= END_HOUR; i++) { // Cambiado < a <= para incluir hora final
            hours.push(i);
        }
    } else {
        // Fallback si config está mal
        for (let i = 9; i <= 22; i++) hours.push(i); // Extendido hasta 22:00
    }

    const getEventForSlot = (dayDate, hour) => {
        const dateStr = format(dayDate, 'yyyy-MM-dd');
        const timeStr = `${hour.toString().padStart(2, '0')}:00:00`; // Backend might return H:m:s
        // Simplificación: Match exacto de hora. Idealmente chequear rangos.
        return appointments.find(a =>
            a.date === dateStr && a.time.startsWith(hour.toString().padStart(2, '0')) && a.status !== 'cancelled'
        );
    };

    return (
        <AdminLayout title="Agenda Semanal">
            <div className="p-8 h-full flex flex-col">
                {/* Header Control */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-serif text-earth font-bold">Agenda</h2>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm">
                        <button onClick={() => setCurrentDate(d => addDays(d, -7))} className="p-2 hover:bg-slate-100 rounded-lg">&lt;</button>
                        <span className="font-bold text-slate-700 w-48 text-center capitalize">
                            {format(currentDate, 'MMMM yyyy', { locale: es })}
                        </span>
                        <button onClick={() => setCurrentDate(d => addDays(d, 7))} className="p-2 hover:bg-slate-100 rounded-lg">&gt;</button>
                    </div>
                    <div className="w-24"></div> {/* Spacer */}
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 bg-white rounded-3xl shadow-sm border border-beige-dark/10 overflow-hidden flex flex-col">
                    {/* Header Row */}
                    <div className="grid grid-cols-6 border-b border-beige-dark/10 bg-paper">
                        <div className="p-4 border-r border-beige-dark/10 font-bold text-slate-400 text-xs uppercase text-center py-6">
                            Hora
                        </div>
                        {weekDays.map(day => (
                            <div key={day.toString()} className={`p-4 border-r border-beige-dark/10 text-center ${isSameDay(day, new Date()) ? 'bg-earth/10' : ''}`}>
                                <div className="text-xs font-bold uppercase text-slate-500 mb-1">{format(day, 'EEEE', { locale: es })}</div>
                                <div className={`text-xl font-serif font-bold ${isSameDay(day, new Date()) ? 'text-earth' : 'text-slate-800'}`}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Body Rows */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-6">
                            {/* Time Column */}
                            <div className="border-r border-beige-dark/10 bg-slate-50">
                                {hours.map(hour => (
                                    <div key={hour} className="h-24 border-b border-beige-dark/10 px-4 py-2 text-xs font-bold text-slate-400 text-right">
                                        {`${hour.toString().padStart(2, '0')}:00`}
                                    </div>
                                ))}
                            </div>

                            {/* Days Columns */}
                            {weekDays.map(day => (
                                <div key={day.toString()} className="border-r border-beige-dark/10 relative">
                                    {hours.map(hour => {
                                        const event = getEventForSlot(day, hour);
                                        const isBlocked = event?.status === 'blocked';

                                        return (
                                            <div
                                                key={hour}
                                                className={`h-24 border-b border-beige-dark/10 p-1 relative group cursor-pointer transition-colors ${!event ? 'hover:bg-slate-50' : ''}`}
                                                onClick={() => !event && handleSlotClick(day, hour)}
                                            >
                                                {event ? (
                                                    <div className={`h-full w-full rounded-md p-2 text-xs overflow-hidden shadow-sm hover:translate-y-[-1px] transition-all flex flex-col justify-center ${isBlocked
                                                        ? 'bg-slate-100 border-l-4 border-slate-400 text-slate-500 italic'
                                                        : 'bg-earth/10 border-l-4 border-earth text-earth-dark'
                                                        }`}>
                                                        {isBlocked ? (
                                                            <div className="text-center font-bold">⚠️ NO DISPONIBLE</div>
                                                        ) : (
                                                            <>
                                                                <div className="font-bold truncate">{event.Patient?.User?.name || 'Paciente'}</div>
                                                                <div className="truncate opacity-80">{event.Product?.name || 'Servicio'}</div>
                                                                <div className="mt-1 opacity-60 text-[10px]">{event.time.substring(0, 5)}</div>
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="hidden group-hover:flex items-center justify-center h-full w-full opacity-0 group-hover:opacity-50 text-slate-300 text-2xl font-light">
                                                        +
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Modal Nueva Reserva */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-beige-dark/10 flex justify-between items-center bg-paper">
                                <div>
                                    <h3 className="text-lg font-serif font-bold text-earth">Gestión de Horario</h3>
                                    <p className="text-xs text-slate-500 capitalize">
                                        {selectedSlot && format(parseISO(selectedSlot.date), 'EEEE d MMMM', { locale: es })} - {selectedSlot?.time}
                                    </p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-earth text-2xl">&times;</button>
                            </div>
                            <form onSubmit={handleCreate} className="p-6 space-y-4">
                                {/* Selector de Tipo */}
                                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setAppointmentType('regular')}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${appointmentType === 'regular' ? 'bg-white text-earth shadow-sm' : 'text-slate-400'}`}
                                    >
                                        Crear Turno
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAppointmentType('blocked')}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${appointmentType === 'blocked' ? 'bg-white text-slate-600 shadow-sm' : 'text-slate-400'}`}
                                    >
                                        Bloquear Horario
                                    </button>
                                </div>

                                {appointmentType === 'regular' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Paciente</label>
                                            <select
                                                required
                                                className="w-full bg-paper border border-beige-dark/20 rounded-lg p-3 focus:border-earth focus:outline-none"
                                                value={formData.patient_id}
                                                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                                            >
                                                <option value="">Seleccionar Paciente</option>
                                                {patients.map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.user?.name} (DNI: {p.dni})
                                                    </option>
                                                ))}
                                            </select>
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
                                                    <option key={s.id} value={s.id}>
                                                        {s.name} ({s.duration} min) - ${s.price}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">
                                        {appointmentType === 'regular' ? 'Notas (Opcional)' : 'Motivo del Bloqueo'}
                                    </label>
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
                                    <button type="submit" className={`px-6 py-2 rounded-xl font-bold shadow-lg transition-all ${appointmentType === 'blocked'
                                        ? 'bg-slate-600 text-white hover:bg-slate-700 shadow-slate-300'
                                        : 'bg-earth text-white hover:bg-earth-dark shadow-earth/20'
                                        }`}>
                                        {appointmentType === 'regular' ? 'Confirmar Reserva' : 'Bloquear Horario'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminCalendar;
