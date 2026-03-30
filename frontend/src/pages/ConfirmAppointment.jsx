import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const ConfirmAppointment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [appointment, setAppointment] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const confirm = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5176/api';
                const res = await fetch(`${baseUrl}/appointments/${id}/confirm`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' }
                });

                const data = await res.json();

                if (res.ok) {
                    setStatus('success');
                    setAppointment(data.appointment);
                } else {
                    setStatus('error');
                    setErrorMsg(data.error || 'No se pudo confirmar el turno.');
                }
            } catch (error) {
                console.error('Error confirming:', error);
                setStatus('error');
                setErrorMsg('Error de conexión. Intente nuevamente.');
            }
        };

        if (id) {
            confirm();
        }
    }, [id]);

    return (
        <Layout>
            <div className="min-h-[60vh] flex items-center justify-center bg-paper py-20 px-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 text-center border border-beige-dark/10">

                    {status === 'loading' && (
                        <div className="py-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earth mx-auto mb-4"></div>
                            <h2 className="text-xl font-serif text-slate-800">Confirmando tu asistencia...</h2>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="py-6 animate-fade-in">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-4xl">✅</span>
                            </div>
                            <h2 className="text-2xl font-serif text-slate-800 mb-4 font-bold">¡Asistencia Confirmada!</h2>
                            <p className="text-slate-600 mb-8">
                                Gracias por confirmar tu turno. Te esperamos para tu sesión.
                            </p>

                            {appointment && (
                                <div className="bg-paper/50 rounded-xl p-4 mb-8 text-left border border-beige-dark/5">
                                    <p className="text-sm text-slate-500 mb-1">Tu turno:</p>
                                    <p className="text-lg font-bold text-earth mb-2">
                                        📅 {appointment.date.split('-').reverse().join('/')}
                                    </p>
                                    <p className="text-lg font-bold text-earth">
                                        🕐 {appointment.time.slice(0, 5)} hs
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={() => navigate('/')}
                                className="w-full bg-earth text-white py-3 rounded-xl font-bold hover:bg-earth-dark transition-colors"
                            >
                                Volver al Inicio
                            </button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="py-6 animate-fade-in">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-4xl">❌</span>
                            </div>
                            <h2 className="text-2xl font-serif text-slate-800 mb-4 font-bold">Hubo un problema</h2>
                            <p className="text-red-500 mb-8 font-medium">
                                {errorMsg}
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full bg-paper text-slate-600 py-3 rounded-xl font-bold hover:bg-paper-dark transition-colors border border-beige-dark/20"
                            >
                                Ir al Inicio
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </Layout>
    );
};

export default ConfirmAppointment;
