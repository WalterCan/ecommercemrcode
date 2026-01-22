import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const ReservarTurno = () => {
    const [therapies, setTherapies] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedTherapy, setSelectedTherapy] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modalTherapy, setModalTherapy] = useState(null);
    const { showToast } = useToast();
    const { user } = useAuth();
    const navigate = useNavigate();
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
                    therapy_type_id: selectedTherapy
                })
            });

            if (response.ok) {
                showToast('¡Turno reservado exitosamente!', 'success');
                navigate('/mis-turnos');
            } else {
                const error = await response.json();

                // Si falta email o teléfono, mostrar mensaje específico
                if (error.missingFields) {
                    const missing = [];
                    if (error.missingFields.email) missing.push('email');
                    if (error.missingFields.phone) missing.push('teléfono');

                    showToast(
                        `Debes completar tu ${missing.join(' y ')} en tu perfil para reservar turnos`,
                        'error'
                    );

                    // Redirigir al perfil después de 2 segundos
                    setTimeout(() => navigate('/perfil'), 2000);
                } else {
                    showToast(error.error || 'Error al reservar', 'error');
                }
            }
        } catch (error) {
            console.error('Error booking appointment:', error);
            showToast('Error de conexión', 'error');
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
        <>
            <Header />
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
                                            📅 {new Date(date).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
                                        <button
                                            onClick={() => setSelectedTherapy(therapy.id)}
                                            className={`w-full p-6 rounded-xl border-2 transition-all text-left ${selectedTherapy === therapy.id
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
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Botón de Confirmación */}
                    {selectedSlot && selectedTherapy && (
                        <div className="bg-white rounded-3xl shadow-lg border border-beige-dark/10 p-8">
                            <h2 className="text-2xl font-bold mb-6">3️⃣ Confirmar Reserva</h2>
                            <div className="bg-beige-light/30 rounded-xl p-6 mb-6">
                                <p className="text-sm text-slate-600 mb-2">Fecha y Hora:</p>
                                <p className="font-bold text-lg mb-4">
                                    📅 {new Date(selectedSlot.date).toLocaleDateString('es-AR')} -
                                    🕐 {selectedSlot.time?.substring(0, 5)} a {selectedSlot.end_time?.substring(0, 5)}
                                </p>
                                <p className="text-sm text-slate-600 mb-2">Terapia:</p>
                                <p className="font-bold text-lg text-earth">
                                    {therapies.find(t => t.id === selectedTherapy)?.name}
                                </p>
                            </div>
                            <button
                                onClick={handleBook}
                                className="w-full bg-earth text-white py-4 rounded-xl font-bold text-lg hover:bg-earth-dark transition-all"
                            >
                                Confirmar Reserva
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

            <Footer />
        </>
    );
};

export default ReservarTurno;
