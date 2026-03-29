import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';

const ReservarTurno = () => {
    const [therapies, setTherapies] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedTherapy, setSelectedTherapy] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('mercadopago'); // 'mercadopago' | 'transfer'
    const [loading, setLoading] = useState(false);
    const [modalTherapy, setModalTherapy] = useState(null);
    const { showToast } = useToast();
    const { user } = useAuth();
    const navigate = useNavigate();
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

    useEffect(() => {
        fetchTherapies();
        fetchAvailableSlots();
    }, []);

    const fetchTherapies = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl}/therapies`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setTherapies(data);
        } catch (error) {
            console.error('Error fetching therapies:', error);
        }
    };

    const fetchAvailableSlots = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl}/availability`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setAvailableSlots(data);
        } catch (error) {
            console.error('Error fetching slots:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSlot = (slot) => {
        setSelectedSlot(slot);
        setSelectedTherapy(null);
    };

    const handleBook = async () => {
        if (!selectedTherapy) {
            showToast('Debes seleccionar una terapia', 'error');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl}/appointments/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    appointment_id: selectedSlot.id,
                    therapy_type_id: selectedTherapy,
                    payment_method: paymentMethod
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Si eligió MercadoPago, crear preferencia
                if (paymentMethod === 'mercadopago') {
                    try {
                        const prefResponse = await fetch(`${baseUrl}/payments/preference`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                appointmentId: data.appointment.id
                            })
                        });

                        const prefData = await prefResponse.json();

                        if (prefResponse.ok && prefData.init_point) {
                            showToast('Redirigiendo a MercadoPago...', 'info');
                            window.location.href = prefData.init_point;
                            return;
                        } else {
                            console.error('Error MP Response:', prefResponse.status, prefData);
                            showToast(`Error al conectar con MercadoPago: ${prefData.message || 'Error desconocido'}. El turno quedó reservado.`, 'warning');
                            navigate('/mis-turnos');
                        }
                    } catch (mpError) {
                        console.error('Error MP:', mpError);
                        showToast('Error al conectar con MercadoPago. El turno quedó reservado.', 'warning');
                        navigate('/mis-turnos');
                    }
                } else {
                    // Transferencia / Efectivo
                    showToast('¡Turno reservado! Te contactaremos por WhatsApp.', 'success');
                    // Podríamos redirigir a un WhatsApp link aquí si se desea
                    const whatsappMsg = `Hola! Reservé el turno #${data.appointment.id} para ${data.appointment.therapy.name} el ${new Date(data.appointment.date).toLocaleDateString()} y quiero coordinar el pago.`;
                    const whatsappUrl = `https://wa.me/5491112345678?text=${encodeURIComponent(whatsappMsg)}`; // TODO: Usar nro config

                    navigate('/mis-turnos');
                    // Opcional: window.open(whatsappUrl, '_blank');
                }
            } else {
                // Si falta email o teléfono, mostrar mensaje específico
                if (data.missingFields) {
                    const fieldLabels = {
                        name: 'nombre',
                        email: 'email',
                        phone: 'teléfono',
                        dni: 'DNI',
                        birth_date: 'fecha de nacimiento'
                    };

                    const missing = Object.entries(data.missingFields)
                        .filter(([_, isMissing]) => isMissing)
                        .map(([field, _]) => fieldLabels[field] || field);

                    showToast(
                        `Debes completar: ${missing.join(', ')} en tu perfil para reservar turnos`,
                        'error'
                    );

                    // Redirigir al perfil después de 2.5 segundos
                    setTimeout(() => navigate('/perfil'), 2500);
                } else {
                    showToast(data.error || 'Error al reservar', 'error');
                }
            }
        } catch (error) {
            console.error('Error booking appointment:', error);
            showToast('Error de conexión', 'error');
        } finally {
            setLoading(false);
        }
    };

    const groupSlotsByDate = (slots) => {
        const grouped = {};
        slots.forEach(slot => {
            const date = slot.date;
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(slot);
        });
        return grouped;
    };

    const groupedSlots = groupSlotsByDate(availableSlots);

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-beige-light via-paper to-beige-light/50 py-20">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-slate-800 mb-4">Reservar Turno</h1>
                        <p className="text-slate-600">Selecciona el horario y el tipo de terapia que prefieras</p>
                    </div>

                    {/* Horarios Disponibles */}
                    <div className="bg-white rounded-3xl shadow-lg border border-beige-dark/10 p-8 mb-8">
                        <h2 className="text-2xl font-bold mb-6">1️⃣ Selecciona Fecha y Hora</h2>
                        {loading ? (
                            <div className="py-20 text-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-earth mx-auto"></div>
                            </div>
                        ) : Object.keys(groupedSlots).length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-slate-400 text-lg">No hay horarios disponibles</p>
                                <p className="text-slate-400 text-sm mt-2">Vuelve más tarde</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.entries(groupedSlots).map(([date, slots]) => (
                                    <div key={date}>
                                        <h3 className="font-bold text-lg mb-3 text-slate-700">
                                            📅 {format(parse(date, 'yyyy-MM-dd', new Date()), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                            {slots.map(slot => (
                                                <button
                                                    key={slot.id}
                                                    onClick={() => handleSelectSlot(slot)}
                                                    className={`p-4 border-2 rounded-xl font-bold transition-all ${selectedSlot?.id === slot.id
                                                        ? 'border-earth bg-earth text-white'
                                                        : 'border-beige-dark/20 bg-beige-light/50 hover:border-earth/50'
                                                        }`}
                                                >
                                                    🕐 {slot.time?.substring(0, 5)} - {slot.end_time?.substring(0, 5)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Selector de Terapia */}
                    {selectedSlot && (
                        <div className="bg-white rounded-3xl shadow-lg border border-beige-dark/10 p-8 mb-8">
                            <h2 className="text-2xl font-bold mb-6">2️⃣ Selecciona el Tipo de Terapia</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {therapies.map(therapy => (
                                    <div key={therapy.id} className="relative">
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setSelectedTherapy(therapy.id)}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedTherapy(therapy.id); }}
                                            className={`w-full p-6 rounded-xl border-2 transition-all text-left cursor-pointer ${selectedTherapy === therapy.id
                                                ? 'border-earth bg-earth/10'
                                                : 'border-beige-dark/20 hover:border-earth/50'
                                                }`}
                                        >
                                            <h3 className="font-bold text-lg mb-2">{therapy.name}</h3>
                                            <p className="text-sm text-slate-600 mb-2 line-clamp-3">
                                                {therapy.description}
                                            </p>
                                            {therapy.description && therapy.description.length > 100 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setModalTherapy(therapy);
                                                    }}
                                                    className="text-xs text-earth hover:text-earth-dark font-bold mb-3 underline"
                                                >
                                                    Ver más
                                                </button>
                                            )}
                                            <div className="flex items-center justify-between text-sm mt-3">
                                                <span className="text-slate-500">⏱️ {therapy.duration} min</span>
                                                <span className="font-bold text-earth">${parseFloat(therapy.price).toLocaleString('es-AR')}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Botón de Confirmación */}
                    {selectedSlot && selectedTherapy && (
                        <div className="bg-white rounded-3xl shadow-lg border border-beige-dark/10 p-8">
                            <h2 className="text-2xl font-bold mb-6">3️⃣ Confirmar y Pagar</h2>
                            <div className="bg-beige-light/30 rounded-xl p-6 mb-6">
                                <p className="text-sm text-slate-600 mb-2">Fecha y Hora:</p>
                                <p className="font-bold text-lg mb-4">
                                    📅 {format(parse(selectedSlot.date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy', { locale: es })} -
                                    🕐 {selectedSlot.time?.substring(0, 5)} a {selectedSlot.end_time?.substring(0, 5)}
                                </p>
                                <p className="text-sm text-slate-600 mb-2">Terapia:</p>
                                <p className="font-bold text-lg text-earth mb-4">
                                    {therapies.find(t => t.id === selectedTherapy)?.name}
                                </p>

                                <div className="border-t border-dashed border-slate-300 my-4 pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-slate-600">Valor Total:</span>
                                        <span className="text-lg font-bold">
                                            ${parseFloat(therapies.find(t => t.id === selectedTherapy)?.price || 0).toLocaleString('es-AR')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2 text-earth font-bold">
                                        <span>Seña (50%):</span>
                                        <span>
                                            ${(parseFloat(therapies.find(t => t.id === selectedTherapy)?.price || 0) * 0.5).toLocaleString('es-AR')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-slate-500">
                                        <span>Saldo a abonar en consultorio:</span>
                                        <span>
                                            ${(parseFloat(therapies.find(t => t.id === selectedTherapy)?.price || 0) * 0.5).toLocaleString('es-AR')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="font-bold text-lg mb-3">Método de Pago de Seña</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setPaymentMethod('mercadopago')}
                                        className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'mercadopago'
                                            ? 'border-[#009EE3] bg-[#009EE3]/5 text-[#009EE3]'
                                            : 'border-slate-200 hover:border-[#009EE3]/50 text-slate-500'
                                            }`}
                                    >
                                        <span className="font-bold">Mercado Pago</span>
                                        <span className="text-xs">Tarjetas, Débito, Dinero en cuenta</span>
                                    </button>

                                    <button
                                        onClick={() => setPaymentMethod('transfer')}
                                        className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'transfer'
                                            ? 'border-green-600 bg-green-50 text-green-700'
                                            : 'border-slate-200 hover:border-green-600/50 text-slate-500'
                                            }`}
                                    >
                                        <span className="font-bold">Transferencia / Efectivo</span>
                                        <span className="text-xs">Coordinar por WhatsApp</span>
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleBook}
                                disabled={loading}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${paymentMethod === 'mercadopago'
                                    ? 'bg-[#009EE3] hover:bg-[#008ED0] text-white'
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                    } ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Procesando...' : (
                                    paymentMethod === 'mercadopago' ? 'Pagar Seña con Mercado Pago' : 'Confirmar Reserva'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Descripción */}
            {modalTherapy && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setModalTherapy(null)}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 animate-fade-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-3xl font-bold text-slate-800">{modalTherapy.name}</h2>
                            <button
                                onClick={() => setModalTherapy(null)}
                                className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-700 mb-2">Descripción</h3>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {modalTherapy.description}
                                </p>
                            </div>

                            <div className="flex items-center gap-6 pt-4 border-t border-beige-dark/10">
                                <div>
                                    <span className="text-sm text-slate-500">Duración</span>
                                    <p className="font-bold text-lg">⏱️ {modalTherapy.duration} min</p>
                                </div>
                                <div>
                                    <span className="text-sm text-slate-500">Precio</span>
                                    <p className="font-bold text-lg text-earth">${parseFloat(modalTherapy.price).toLocaleString('es-AR')}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setSelectedTherapy(modalTherapy.id);
                                    setModalTherapy(null);
                                }}
                                className="w-full mt-6 bg-earth text-white py-3 rounded-xl font-bold hover:bg-earth-dark transition-colors"
                            >
                                Seleccionar esta terapia
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default ReservarTurno;
