import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminPatientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('history'); // 'profile' | 'history'
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);

    // Estado para nueva nota
    const [noteForm, setNoteForm] = useState({ date: new Date().toISOString().split('T')[0], notes: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (id) fetchPatientData();
    }, [id]);

    const fetchPatientData = async () => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const res = await fetch(`${baseUrl}/patients/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Error al cargar paciente');
            const data = await res.json();
            setPatient(data);
        } catch (error) {
            console.error('Error fetching patient:', error);
            showToast('No se pudo cargar la información del paciente', 'error');
            navigate('/admin/pacientes');
        } finally {
            setLoading(false);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

            const res = await fetch(`${baseUrl}/patients/${id}/history`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(noteForm)
            });

            if (res.ok) {
                showToast('Nota de evolución agregada', 'success');
                setNoteForm({ date: new Date().toISOString().split('T')[0], notes: '' });
                fetchPatientData(); // Recargar datos
            } else {
                throw new Error('Error al guardar nota');
            }
        } catch (error) {
            console.error('Error saving note:', error);
            showToast('Error al guardar nota', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <AdminLayout title="Cargando...">
            <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-earth"></div>
            </div>
        </AdminLayout>
    );

    if (!patient) return null;

    return (
        <AdminLayout title={`Ficha: ${patient.user?.name || 'Paciente'}`}>
            <div className="p-8">
                {/* Header Paciente */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-beige-dark/10 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-6">
                        <div className="h-20 w-20 rounded-full bg-earth text-white flex items-center justify-center text-2xl font-serif font-bold">
                            {patient.user?.name?.charAt(0) || 'P'}
                        </div>
                        <div>
                            <h1 className="text-2xl font-serif font-bold text-slate-800">{patient.user?.name}</h1>
                            <div className="flex gap-4 text-sm text-slate-500 mt-1">
                                <span className="flex items-center gap-1">📧 {patient.user?.email}</span>
                                <span className="flex items-center gap-1">📱 {patient.user?.phone || 'Sin télefono'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">DNI</p>
                        <p className="text-lg font-mono text-slate-700">{patient.dni || '-'}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-8 border-b border-beige-dark/10 mb-8">
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'history'
                                ? 'text-earth border-b-2 border-earth'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Historia Clínica
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'profile'
                                ? 'text-earth border-b-2 border-earth'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Datos Personales
                    </button>
                </div>

                {/* Tab Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Panel Izquierdo (Contenido Principal) */}
                    <div className="lg:col-span-2 space-y-8">
                        {activeTab === 'history' && (
                            <div className="space-y-6">
                                {/* Nueva Nota */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-beige-dark/10">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Nueva Evolución</h3>
                                    <form onSubmit={handleAddNote}>
                                        <div className="flex gap-4 mb-4">
                                            <div className="w-1/3">
                                                <label className="block text-xs font-bold text-slate-400 mb-1">Fecha</label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={noteForm.date}
                                                    onChange={e => setNoteForm({ ...noteForm, date: e.target.value })}
                                                    className="w-full bg-paper border border-beige-dark/20 rounded-lg p-2 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <textarea
                                            placeholder="Escribe los detalles de la sesión..."
                                            rows="3"
                                            required
                                            value={noteForm.notes}
                                            onChange={e => setNoteForm({ ...noteForm, notes: e.target.value })}
                                            className="w-full bg-paper border border-beige-dark/20 rounded-lg p-3 text-sm focus:border-earth focus:outline-none mb-4"
                                        ></textarea>
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="bg-earth text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-earth-dark transition-colors disabled:opacity-50"
                                            >
                                                {isSubmitting ? 'Guardando...' : 'Guardar Nota'}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Timeline */}
                                <div className="relative border-l-2 border-beige-dark/20 ml-4 space-y-8 pl-8 py-4">
                                    {patient.clinical_records && patient.clinical_records.length > 0 ? (
                                        patient.clinical_records.map((record) => (
                                            <div key={record.id} className="relative">
                                                {/* Dot indicator */}
                                                <div className="absolute -left-[41px] top-4 h-5 w-5 rounded-full bg-earth border-4 border-paper shadow-sm"></div>

                                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-beige-dark/10 group hover:border-earth/30 transition-colors">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-xs font-bold text-earth uppercase tracking-wider bg-earth/10 px-2 py-1 rounded">
                                                            {new Date(record.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                        </span>
                                                        {/* Future: Add edit/delete buttons here */}
                                                    </div>
                                                    <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                                                        {record.notes}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-slate-400 italic text-sm">No hay registros clínicos aún.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-beige-dark/10 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Fecha de Nacimiento</label>
                                        <p className="text-slate-700 font-medium">{patient.birth_date || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Contacto Emergencia</label>
                                        <p className="text-slate-700 font-medium">{patient.emergency_contact || '-'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Observaciones Generales</label>
                                        <p className="text-slate-600 bg-paper p-4 rounded-xl text-sm italic border border-beige-dark/10">
                                            {patient.observations || 'Sin observaciones registradas.'}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Dirección (E-commerce)</label>
                                        <p className="text-slate-700 font-medium">{patient.user?.address || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Resumen (Derecha) */}
                    <div className="space-y-6">
                        <div className="bg-terracotta/5 rounded-2xl p-6 border border-terracotta/20">
                            <h4 className="text-terracotta font-bold text-sm uppercase tracking-widest mb-4">Resumen</h4>
                            <ul className="space-y-3 text-sm">
                                <li className="flex justify-between">
                                    <span className="text-slate-500">Sesiones Totales</span>
                                    <span className="font-bold text-slate-700">{patient.clinical_records?.length || 0}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-slate-500">Última Visita</span>
                                    <span className="font-bold text-slate-700">
                                        {patient.clinical_records?.[0]?.date
                                            ? new Date(patient.clinical_records[0].date).toLocaleDateString()
                                            : '-'}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminPatientDetail;
