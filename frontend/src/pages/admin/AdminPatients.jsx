import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../context/ToastContext';

const AdminPatients = () => {
    const { showToast } = useToast();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', dni: '', birth_date: '', emergency_contact: '', observations: ''
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

            const response = await fetch(`${baseUrl}/patients`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                if (response.status === 403) throw new Error('Módulo Consultorio NO activo');
                throw new Error('Error al cargar pacientes');
            }

            const data = await response.json();
            setPatients(data);
        } catch (error) {
            console.error(error);
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

            const response = await fetch(`${baseUrl}/patients/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Paciente registrado con éxito', 'success');
                setIsModalOpen(false);
                setFormData({ name: '', email: '', phone: '', dni: '', birth_date: '', emergency_contact: '', observations: '' });
                fetchPatients();
            } else {
                showToast(data.error || 'Error al crear paciente', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Error de conexión', 'error');
        }
    };

    return (
        <AdminLayout title="Fichas de Pacientes">
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-serif text-earth font-bold">Pacientes</h2>
                        <p className="text-slate-500 text-sm">Gestión de historiales clínicos y datos personales.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-earth text-white px-4 py-2 rounded-xl hover:bg-earth-dark transition-colors flex items-center gap-2"
                    >
                        <span>+</span> Nuevo Paciente
                    </button>
                </div>

                {/* Modal Crear Paciente */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-beige-dark/10 flex justify-between items-center bg-paper">
                                <h3 className="text-lg font-serif font-bold text-earth">Nuevo Paciente</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-earth text-2xl">&times;</button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Datos Personales (User) */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b pb-2">Datos de Usuario</h4>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Nombre Completo</label>
                                            <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-paper border border-beige-dark/20 rounded-lg p-2 focus:border-earth focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
                                            <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-paper border border-beige-dark/20 rounded-lg p-2 focus:border-earth focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Teléfono</label>
                                            <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-paper border border-beige-dark/20 rounded-lg p-2 focus:border-earth focus:outline-none" />
                                        </div>
                                    </div>

                                    {/* Datos Clínicos (Patient) */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b pb-2">Ficha Médica</h4>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">DNI / Identificación</label>
                                            <input name="dni" value={formData.dni} onChange={handleInputChange} className="w-full bg-paper border border-beige-dark/20 rounded-lg p-2 focus:border-earth focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Fecha de Nacimiento</label>
                                            <input type="date" name="birth_date" value={formData.birth_date} onChange={handleInputChange} className="w-full bg-paper border border-beige-dark/20 rounded-lg p-2 focus:border-earth focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Contacto Emergencia</label>
                                            <input name="emergency_contact" value={formData.emergency_contact} onChange={handleInputChange} className="w-full bg-paper border border-beige-dark/20 rounded-lg p-2 focus:border-earth focus:outline-none" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Observaciones / Notas Iniciales</label>
                                    <textarea name="observations" rows="3" value={formData.observations} onChange={handleInputChange} className="w-full bg-paper border border-beige-dark/20 rounded-lg p-2 focus:border-earth focus:outline-none"></textarea>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-beige-dark/10">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100">Cancelar</button>
                                    <button type="submit" className="px-6 py-2 rounded-xl bg-earth text-white font-bold shadow-lg shadow-earth/20 hover:bg-earth-dark hover:shadow-xl hover:-translate-y-0.5 transition-all">
                                        Guardar Paciente
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-earth"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-beige-dark/10 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-paper border-b border-beige-dark/10">
                                <tr>
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">ID</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Paciente</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">DNI</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Contacto</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-beige-dark/10">
                                {patients.length > 0 ? patients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 text-slate-600 font-mono text-sm">#{patient.id}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-earth">{patient.user?.name || 'Sin Nombre'}</div>
                                            <div className="text-xs text-slate-400">{patient.birth_date || 'Fecha nac. pendiente'}</div>
                                        </td>
                                        <td className="p-4 text-slate-600 font-mono text-sm">{patient.dni || '-'}</td>
                                        <td className="p-4">
                                            <div className="text-sm text-slate-600">{patient.user?.phone}</div>
                                            <div className="text-xs text-slate-400">{patient.user?.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => window.location.href = `/admin/pacientes/${patient.id}`}
                                                className="text-earth hover:text-earth-dark font-medium text-sm"
                                            >
                                                Ver Ficha
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center text-slate-400">
                                            No hay pacientes registrados aún.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminPatients;
