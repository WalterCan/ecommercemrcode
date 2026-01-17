import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const AdminReports = () => {
    const { logout } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    const downloadReport = async (type) => {
        setLoading(true);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            const token = localStorage.getItem('token');

            const response = await fetch(`${baseUrl}/reports/${type}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al descargar reporte');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reporte_${type}_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showToast('Reporte descargado correctamente', 'success');
        } catch (error) {
            console.error('Error downloading report:', error);
            showToast('Error al descargar el reporte', 'error');
        } finally {
            setLoading(false);
        }
    };

    const reportCards = [
        {
            id: 'sales',
            title: 'Reporte de Ventas',
            description: 'Descarga un archivo Excel con el historial detallado de todas las ventas, incluyendo clientes, montos y estados.',
            icon: (
                <svg className="w-12 h-12 text-earth" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            color: 'bg-earth/10'
        },
        {
            id: 'stock',
            title: 'Reporte de Stock',
            description: 'Obtén un estado actual del inventario, con niveles de stock, precios y alertas de stock crítico.',
            icon: (
                <svg className="w-12 h-12 text-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
            color: 'bg-moss/10'
        },
        {
            id: 'customers',
            title: 'Reporte de Clientes',
            description: 'Lista completa de clientes registrados, con sus datos de contacto y fecha de registro.',
            icon: (
                <svg className="w-12 h-12 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            color: 'bg-terracotta/10'
        }
    ];

    return (
        <AdminLayout title="Reportes y Estadísticas">
            <div className="p-10 container mx-auto max-w-6xl">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reportCards.map((card) => (
                        <div key={card.id} className="bg-white rounded-3xl p-8 border border-beige-dark/10 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group">
                            <div className={`${card.color} w-24 h-24 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                {card.icon}
                            </div>
                            <h3 className="text-xl font-serif font-bold text-slate-800 mb-3">{card.title}</h3>
                            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                                {card.description}
                            </p>
                            <button
                                onClick={() => downloadReport(card.id)}
                                disabled={loading}
                                className="mt-auto w-full py-3 px-6 rounded-xl bg-earth text-white font-bold text-sm tracking-wide hover:bg-earth-dark active:bg-earth-darker transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Generando...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        <span>Descargar Excel</span>
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-12 bg-beige-light/30 rounded-3xl p-8 border border-beige-dark/5 text-center">
                    <p className="text-slate-500 italic text-sm">
                        Los reportes se generan en tiempo real con los datos actuales del sistema.
                        Para análisis más detallados, por favor contacte al soporte técnico.
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminReports;
