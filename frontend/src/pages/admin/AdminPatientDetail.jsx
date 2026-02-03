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

    // Estado para notas
    const [noteForm, setNoteForm] = useState({ date: new Date().toISOString().split('T')[0], notes: '' });
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estado para perfil (editable)
    const [profileForm, setProfileForm] = useState({
        birth_date: '',
        emergency_contact: '',
        observations: '',
        dni: ''
    });
    const [isSavingProfile, setIsSavingProfile] = useState(false);

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

            // Inicializar formulario de perfil
            setProfileForm({
                birth_date: data.birth_date || '',
                emergency_contact: data.emergency_contact || '',
                observations: data.observations || '',
                dni: data.dni || ''
            });

        } catch (error) {
            console.error('Error fetching patient:', error);
            showToast('No se pudo cargar la información del paciente', 'error');
            navigate('/admin/pacientes');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNote = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

            let url = `${baseUrl}/patients/${id}/history`;
            let method = 'POST';

            if (editingNoteId) {
                url = `${baseUrl}/patients/${id}/history/${editingNoteId}`; // El backend espera /history/:recordId (NO /patients/:id/history/:recordId, revisar routes)
                // Revisando routes: router.put('/history/:recordId', ...) está MONITADO en /patients? No.
                // En patientRoutes: router.put('/:id/history/:recordId') -> NO.
                // La ruta es router.put('/history/:recordId', ...).
                // PERO el router está montado en /api/patients ? 
                // Ah, patientRoutes tiene: router.post('/:id/history', ...) y router.put('/history/:recordId', ...).
                // Entonces si el app usa app.use('/api/patients', patientRoutes), la url es /api/patients/history/:recordId
                url = `${baseUrl}/patients/history/${editingNoteId}`;
                method = 'PUT';
            }

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(noteForm)
            });

            if (res.ok) {
                showToast(editingNoteId ? 'Nota actualizada' : 'Nota agregada', 'success');
                setNoteForm({ date: new Date().toISOString().split('T')[0], notes: '' });
                setEditingNoteId(null);
                fetchPatientData();
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

    const handleEditNoteClick = (record) => {
        setNoteForm({
            date: record.date,
            notes: record.notes
        });
        setEditingNoteId(record.id);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll al formulario
    };

    const handleCancelEdit = () => {
        setNoteForm({ date: new Date().toISOString().split('T')[0], notes: '' });
        setEditingNoteId(null);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSavingProfile(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

            const res = await fetch(`${baseUrl}/patients/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileForm)
            });

            if (res.ok) {
                showToast('Datos personales actualizados', 'success');
                fetchPatientData();
            } else {
                throw new Error('Error al actualizar perfil');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast('Error al actualizar perfil', 'error');
        } finally {
            setIsSavingProfile(false);
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
                                {/* Nueva/Editar Nota */}
                                <div className={`rounded-2xl p-6 shadow-sm border transition-colors ${editingNoteId ? 'bg-orange-50 border-orange-200' : 'bg-white border-beige-dark/10'}`}>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className={`text-sm font-bold uppercase tracking-widest ${editingNoteId ? 'text-orange-700' : 'text-slate-500'}`}>
                                            {editingNoteId ? 'Editar Evolución' : 'Nueva Evolución'}
                                        </h3>
                                        {editingNoteId && (
                                            <button
                                                onClick={handleCancelEdit}
                                                className="text-xs text-slate-400 hover:text-slate-600 underline"
                                            >
                                                Cancelar Edición
                                            </button>
                                        )}
                                    </div>
                                    <form onSubmit={handleSaveNote}>
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
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className={`px-6 py-2 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50 ${editingNoteId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-earth hover:bg-earth-dark'}`}
                                            >
                                                {isSubmitting ? 'Guardando...' : (editingNoteId ? 'Actualizar Nota' : 'Guardar Nota')}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Timeline */}
                                <div className="relative border-l-2 border-beige-dark/20 ml-4 space-y-8 pl-8 py-4">
                                    {patient.clinical_records && patient.clinical_records.length > 0 ? (
                                        patient.clinical_records.map((record) => (
                                            <div key={record.id} className={`relative transition-opacity ${editingNoteId === record.id ? 'opacity-50' : 'opacity-100'}`}>
                                                {/* Dot indicator */}
                                                <div className="absolute -left-[41px] top-4 h-5 w-5 rounded-full bg-earth border-4 border-paper shadow-sm"></div>

                                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-beige-dark/10 group hover:border-earth/30 transition-colors">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-xs font-bold text-earth uppercase tracking-wider bg-earth/10 px-2 py-1 rounded">
                                                            {new Date(record.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                        </span>
                                                        <button
                                                            onClick={() => handleEditNoteClick(record)}
                                                            className="text-slate-400 hover:text-earth transition-colors p-1"
                                                            title="Editar nota"
                                                        >
                                                            ✏️
                                                        </button>
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
                            <form onSubmit={handleUpdateProfile} className="bg-white rounded-2xl p-8 shadow-sm border border-beige-dark/10 space-y-6">
                                <div className="flex justify-between items-center border-b border-beige-dark/10 pb-4 mb-2">
                                    <h3 className="text-lg font-serif font-bold text-slate-700">Editar Información</h3>
                                    <button
                                        type="submit"
                                        disabled={isSavingProfile}
                                        className="bg-earth text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-earth-dark transition-colors disabled:opacity-50"
                                    >
                                        {isSavingProfile ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Fecha de Nacimiento</label>
                                        <input
                                            type="date"
                                            value={profileForm.birth_date}
                                            onChange={e => setProfileForm({ ...profileForm, birth_date: e.target.value })}
                                            className="w-full bg-paper border border-beige-dark/20 rounded-lg p-2 text-sm focus:border-earth focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Contacto Emergencia</label>
                                        <input
                                            type="text"
                                            value={profileForm.emergency_contact}
                                            onChange={e => setProfileForm({ ...profileForm, emergency_contact: e.target.value })}
                                            placeholder="Nombre: 11-1234-5678"
                                            className="w-full bg-paper border border-beige-dark/20 rounded-lg p-2 text-sm focus:border-earth focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">DNI</label>
                                        <input
                                            type="text"
                                            value={profileForm.dni}
                                            onChange={e => setProfileForm({ ...profileForm, dni: e.target.value })}
                                            placeholder="Documento"
                                            className="w-full bg-paper border border-beige-dark/20 rounded-lg p-2 text-sm focus:border-earth focus:outline-none"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Observaciones Generales</label>
                                        <textarea
                                            rows="4"
                                            value={profileForm.observations}
                                            onChange={e => setProfileForm({ ...profileForm, observations: e.target.value })}
                                            placeholder="Alergias, condiciones médicas, notas importantes..."
                                            className="w-full bg-paper border border-beige-dark/20 rounded-lg p-3 text-sm focus:border-earth focus:outline-none"
                                        ></textarea>
                                    </div>

                                    {/* Read only info from User model */}
                                    <div className="col-span-2 border-t border-beige-dark/10 pt-4 mt-2">
                                        <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Dirección (Cuenta E-commerce)</label>
                                        <p className="text-slate-500 font-medium text-sm">{patient.user?.address || 'No definida'}</p>
                                        <p className="text-xs text-slate-400 mt-1">Este dato se gestiona desde el perfil de usuario general.</p>
                                    </div>
                                </div>
                            </form>
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
