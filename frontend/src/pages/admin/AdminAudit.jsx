import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const AdminAudit = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ action: '', resource: '' });
    const [selectedLog, setSelectedLog] = useState(null);
    const { showToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchLogs();
    }, [filters]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

            const queryParams = new URLSearchParams(filters).toString();
            const res = await fetch(`${baseUrl}/audit-logs?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                if (res.status === 403) {
                    showToast('No tienes permisos para ver auditoría', 'error');
                    navigate('/admin');
                    return;
                }
                throw new Error('Error al cargar logs');
            }

            const data = await res.json();
            // Backend returns { count, rows } if utilizing findAndCountAll, or just array if findAll. 
            // Controller uses findAndCountAll but sends res.json(logs) which is { count: X, rows: [...] }
            setLogs(data.rows || []);
        } catch (error) {
            console.error(error);
            showToast('Error de conexión', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <AdminLayout title="Auditoría de Seguridad">
            <div className="p-8">
                {/* Filtros */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-beige-dark/10 mb-6 flex gap-4">
                    <select
                        name="action"
                        value={filters.action}
                        onChange={handleFilterChange}
                        className="bg-paper border border-beige-dark/20 rounded-lg p-2 text-sm"
                    >
                        <option value="">Todas las Acciones</option>
                        <option value="LOGIN">Login</option>
                        <option value="REGISTER">Registro</option>
                        <option value="CREATE">Crear</option>
                        <option value="UPDATE">Actualizar</option>
                        <option value="DELETE">Eliminar</option>
                    </select>

                    <select
                        name="resource"
                        value={filters.resource}
                        onChange={handleFilterChange}
                        className="bg-paper border border-beige-dark/20 rounded-lg p-2 text-sm"
                    >
                        <option value="">Todos los Recursos</option>
                        <option value="User">Usuarios</option>
                        <option value="Patient">Pacientes</option>
                        <option value="ClinicalRecord">Historia Clínica</option>
                        <option value="Inventory">Inventario</option>
                    </select>
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-xl shadow-sm border border-beige-dark/10 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-beige-dark/10">
                            <tr>
                                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Fecha</th>
                                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Usuario</th>
                                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Acción</th>
                                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Recurso</th>
                                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Detalles</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-beige-dark/10">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500">Cargando registros...</td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500">No hay registros de auditoría.</td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-3 px-4 text-sm text-slate-600">
                                            {new Date(log.created_at || log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4 text-sm font-medium text-earth">
                                            {log.user ? `${log.user.name} (${log.user.email})` : 'Sistema / Desconocido'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider
                                                ${log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                                                    log.action === 'UPDATE' ? 'bg-orange-100 text-orange-700' :
                                                        log.action === 'LOGIN' ? 'bg-green-100 text-green-700' :
                                                            'bg-slate-100 text-slate-700'}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-600">
                                            {log.resource} <span className="text-slate-400">#{log.resource_id}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="text-xs text-earth hover:underline font-bold"
                                            >
                                                Ver JSON
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Detalle JSON */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedLog(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-lg">Detalle del Evento #{selectedLog.id}</h3>
                            <button onClick={() => setSelectedLog(null)} className="text-2xl leading-none">&times;</button>
                        </div>
                        <div className="p-4 overflow-auto bg-slate-900 text-green-400 font-mono text-xs rounded-b-2xl">
                            <pre>{JSON.stringify(selectedLog.details, null, 2)}</pre>
                            <div className="mt-4 pt-4 border-t border-slate-700 text-slate-500">
                                <p>IP: {selectedLog.ip_address}</p>
                                <p>UA: {selectedLog.user_agent}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminAudit;
