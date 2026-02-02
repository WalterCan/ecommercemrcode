import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const PaymentStatus = () => {
    const [searchParams] = useSearchParams();
    const status = searchParams.get('status'); // approved, failure, pending
    const paymentId = searchParams.get('payment_id');
    const externalReference = searchParams.get('external_reference'); // appointment_id

    const [viewData, setViewData] = useState({
        title: 'Verificando pago...',
        message: 'Por favor espere un momento.',
        icon: '⏳',
        color: 'text-slate-600',
        borderColor: 'border-slate-200',
        bg: 'bg-slate-50'
    });

    useEffect(() => {
        // Podríamos llamar al backend para verificar estado real si quisiéramos ser muy seguros
        // Por ahora confiamos en los parámetros de URL para feedback visual inmediato

        switch (status) {
            case 'approved':
                setViewData({
                    title: '¡Pago Exitoso!',
                    message: `Tu seña ha sido acreditada correctamente. Tu turno #${externalReference || ''} está confirmado.`,
                    icon: '✅',
                    color: 'text-green-600',
                    borderColor: 'border-green-200',
                    bg: 'bg-green-50'
                });
                break;
            case 'failure':
                setViewData({
                    title: 'Hubo un problema con el pago',
                    message: 'No pudimos procesar tu pago. Por favor intenta nuevamente o contáctanos.',
                    icon: '❌',
                    color: 'text-red-600',
                    borderColor: 'border-red-200',
                    bg: 'bg-red-50'
                });
                break;
            case 'pending':
                setViewData({
                    title: 'Pago Pendiente',
                    message: 'Tu pago se está procesando. Te avisaremos cuando se acredite.',
                    icon: '🕒',
                    color: 'text-orange-600',
                    borderColor: 'border-orange-200',
                    bg: 'bg-orange-50'
                });
                break;
            default:
                if (window.location.pathname.includes('exito')) {
                    setViewData({
                        title: '¡Pago Exitoso!',
                        message: 'Tu seña ha sido acreditada correctamente. Te esperamos.',
                        icon: '✅',
                        color: 'text-green-600',
                        borderColor: 'border-green-200',
                        bg: 'bg-green-50'
                    });
                } else if (window.location.pathname.includes('fallo')) {
                    setViewData({
                        title: 'Hubo un problema',
                        message: 'No se pudo completar el pago.',
                        icon: '❌',
                        color: 'text-red-600',
                        borderColor: 'border-red-200',
                        bg: 'bg-red-50'
                    });
                }
                break;
        }
    }, [status, externalReference]);

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-beige-light via-paper to-beige-light/50 py-20 flex items-center justify-center">
                <div className="container mx-auto px-4 max-w-lg">
                    <div className={`bg-white rounded-3xl shadow-xl border-2 ${viewData.borderColor} p-10 text-center animate-fade-in`}>
                        <div className={`w-20 h-20 mx-auto rounded-full ${viewData.bg} flex items-center justify-center text-4xl mb-6 shadow-sm`}>
                            {viewData.icon}
                        </div>

                        <h1 className={`text-3xl font-bold mb-4 ${viewData.color}`}>
                            {viewData.title}
                        </h1>

                        <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                            {viewData.message}
                        </p>

                        <div className="space-y-4">
                            <Link
                                to="/mis-turnos"
                                className="block w-full bg-earth text-white py-4 rounded-xl font-bold hover:bg-earth-dark transition-all transform hover:scale-[1.02]"
                            >
                                Ver Mis Turnos
                            </Link>

                            <Link
                                to="/"
                                className="block w-full text-slate-500 hover:text-earth font-medium transition-colors"
                            >
                                Volver al Inicio
                            </Link>
                        </div>

                        {paymentId && (
                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <p className="text-xs text-slate-400">ID de Transacción: {paymentId}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default PaymentStatus;
