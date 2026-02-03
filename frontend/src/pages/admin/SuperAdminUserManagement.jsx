import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../context/ToastContext';

const SuperAdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userData, setUserData] = useState({ name: '', email: '', password: '', role: 'customer' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const token = localStorage.getItem('token');

            console.log('🔍 Fetching users from:', `${baseUrl}/module-management/users-with-modules`);
            console.log('🔑 Token:', token ? 'Present' : 'Missing');

            // Obtener usuarios con sus módulos
            const usersRes = await fetch(`${baseUrl}/module-management/users-with-modules`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Obtener todos los módulos disponibles
            const modulesRes = await fetch(`${baseUrl}/module-management/modules`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('📊 Users response status:', usersRes.status, usersRes.ok);
            console.log('📦 Modules response status:', modulesRes.status, modulesRes.ok);

            if (usersRes.ok && modulesRes.ok) {
                const usersData = await usersRes.json();
                const modulesData = await modulesRes.json();

                console.log('👥 Users data:', usersData);
                console.log('📦 Modules data:', modulesData);

                setUsers(usersData);
                setModules(modulesData);
            } else {
                console.error('❌ Error fetching data - Users OK:', usersRes.ok, 'Modules OK:', modulesRes.ok);
                const usersError = await usersRes.text();
                const modulesError = await modulesRes.text();
                console.error('Users error:', usersError);
                console.error('Modules error:', modulesError);
            }
        } catch (error) {
            console.error('❌ Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userToToggle) => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const token = localStorage.getItem('token');

            const res = await fetch(`${baseUrl}/module-management/users/${userToToggle.id}/toggle-status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                showToast(data.message, 'success');
                await fetchData();
            } else {
                const error = await res.json();
                showToast(error.message || 'Error al cambiar estado', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Error en la operación', 'error');
        }
    };

    const openModuleModal = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    const handleModuleToggle = async (moduleId, currentlyEnabled) => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const token = localStorage.getItem('token');

            const endpoint = currentlyEnabled ? 'disable' : 'enable';
            const res = await fetch(`${baseUrl}/module-management/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    moduleId: moduleId
                })
            });

            if (res.ok) {
                const data = await res.json();
                showToast(data.message || 'Módulo actualizado con éxito', 'success');
                // Refrescar datos
                await fetchData();
                // Actualizar usuario seleccionado
                const updatedUser = users.find(u => u.id === selectedUser.id);
                setSelectedUser(updatedUser);
            } else {
                const error = await res.json();
                showToast(error.message || 'Error al actualizar módulo', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Error al conectar con el servidor', 'error');
        }
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const token = localStorage.getItem('token');

            if (editingUser) {
                // Actualizar Rol
                const res = await fetch(`${baseUrl}/module-management/users/${editingUser.id}/role`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ role: userData.role })
                });

                if (res.ok) {
                    const data = await res.json();
                    showToast(data.message || 'Rol actualizado con éxito', 'success');
                    await fetchData();
                    setShowUserModal(false);
                    setEditingUser(null);
                } else {
                    const error = await res.json();
                    showToast(error.message || 'Error al actualizar rol', 'error');
                }
            } else {
                // Crear Usuario
                const res = await fetch(`${baseUrl}/module-management/users`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(userData)
                });

                if (res.ok) {
                    const data = await res.json();
                    showToast(data.message || 'Usuario creado con éxito', 'success');
                    await fetchData();
                    setShowUserModal(false);
                    setUserData({ name: '', email: '', password: '', role: 'customer' });
                } else {
                    const error = await res.json();
                    showToast(error.message || 'Error al crear usuario', 'error');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Error en la operación', 'error');
        }
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setUserData({ name: '', email: '', password: '', role: 'customer' });
        setShowUserModal(true);
    };

    const openEditUserModal = (user) => {
        setEditingUser(user);
        setUserData({ name: user.name, email: user.email, password: '', role: user.role });
        setShowUserModal(true);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <AdminLayout title="Gestión de Usuarios">
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-earth mx-auto mb-4"></div>
                        <p className="text-slate-600">Cargando usuarios...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Gestión de Usuarios y Permisos">
            <div className="p-10 custom-scrollbar">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-4xl">👑</span>
                            <h1 className="text-3xl font-bold text-slate-800">Gestión de Usuarios y Permisos</h1>
                        </div>
                        <p className="text-slate-600">Administra los módulos habilitados para cada usuario</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-earth text-white rounded-xl hover:bg-earth/90 transition-all font-bold shadow-lg shadow-earth/20 active:scale-95 whitespace-nowrap"
                    >
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Crear Nuevo Usuario
                    </button>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-2xl border border-beige-dark/10 p-8 mb-8 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Búsqueda */}
                        <div className="space-y-2">
                            <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1 ml-1">
                                🔍 Buscar Usuario
                            </label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Nombre o email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-paper/30 border border-beige-dark/20 rounded-xl focus:outline-none focus:border-earth focus:ring-4 focus:ring-earth/5 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                                />
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-earth transition-colors" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Filtro por Rol */}
                        <div className="space-y-2">
                            <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1 ml-1">
                                👤 Filtrar por Rol
                            </label>
                            <div className="relative group">
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-paper/30 border border-beige-dark/20 rounded-xl focus:outline-none focus:border-earth focus:ring-4 focus:ring-earth/5 transition-all font-medium text-slate-700 appearance-none cursor-pointer"
                                >
                                    <option value="all">Todos los roles</option>
                                    <option value="customer">Clientes</option>
                                    <option value="admin">Administradores</option>
                                    <option value="super_admin">Super Admins</option>
                                </select>
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-earth transition-colors" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla de Usuarios */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Usuario</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Rol</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">Módulos Habilitados</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                                            No se encontraron usuarios
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{user.name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 text-sm">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest ${user.role === 'super_admin'
                                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                    : user.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                                                    }`}>
                                                    {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Cliente'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-widest ${user.is_active !== false
                                                    ? 'bg-green-100 text-green-800 border-green-200'
                                                    : 'bg-red-100 text-red-800 border-red-200'
                                                    }`}>
                                                    {user.is_active !== false ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {user.role === 'super_admin' ? (
                                                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-bold border border-amber-100 uppercase tracking-tighter">
                                                            ✨ Acceso Total
                                                        </span>
                                                    ) : user.modules && user.modules.length > 0 ? (
                                                        user.modules.map(module => (
                                                            <span
                                                                key={module.id}
                                                                className="px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-bold border border-green-100"
                                                                title={module.name}
                                                            >
                                                                {module.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-slate-400 text-[10px] italic font-medium">Sin módulos habilitados</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button
                                                        onClick={() => openEditUserModal(user)}
                                                        className="p-2 text-slate-400 hover:text-earth hover:bg-earth/10 rounded-lg transition-all"
                                                        title="Editar Datos/Rol"
                                                    >
                                                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>

                                                    <button
                                                        onClick={() => handleToggleStatus(user)}
                                                        className={`p-2 rounded-lg transition-all ${user.is_active !== false
                                                            ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                                            : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
                                                            }`}
                                                        title={user.is_active !== false ? "Desactivar Usuario" : "Activar Usuario"}
                                                    >
                                                        {user.is_active !== false ? (
                                                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
                                                            </svg>
                                                        ) : (
                                                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        )}
                                                    </button>

                                                    {user.role !== 'super_admin' ? (
                                                        <button
                                                            onClick={() => openModuleModal(user)}
                                                            className="flex items-center gap-2 px-5 py-2.5 bg-earth text-white rounded-xl hover:bg-earth/90 transition-all text-xs font-bold shadow-sm hover:shadow-md active:scale-95 group"
                                                        >
                                                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="group-hover:rotate-12 transition-transform">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                            </svg>
                                                            Módulos
                                                        </button>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs italic font-medium">No requiere</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                        <div className="text-2xl font-bold text-slate-800">{users.length}</div>
                        <div className="text-sm text-slate-600">Total Usuarios</div>
                    </div>
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                        <div className="text-2xl font-bold text-slate-800">
                            {users.filter(u => u.role === 'customer').length}
                        </div>
                        <div className="text-sm text-slate-600">Clientes</div>
                    </div>
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                        <div className="text-2xl font-bold text-slate-800">
                            {users.filter(u => u.role === 'super_admin').length}
                        </div>
                        <div className="text-sm text-slate-600">Super Admins</div>
                    </div>
                </div>

                {/* Modal de Gestión de Módulos */}
                {showModal && selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Header del Modal */}
                            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800">Gestionar Módulos</h2>
                                        <p className="text-slate-600">{selectedUser.name} ({selectedUser.email})</p>
                                    </div>
                                    <button
                                        onClick={closeModal}
                                        className="text-slate-400 hover:text-slate-600 text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            {/* Contenido del Modal */}
                            <div className="p-6">
                                <div className="space-y-4">
                                    {modules.map(module => {
                                        const userHasModule = selectedUser.modules?.some(m => m.id === module.id);

                                        return (
                                            <div
                                                key={module.id}
                                                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-primary transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-3xl">{module.icon}</span>
                                                    <div>
                                                        <h3 className="font-semibold text-slate-800">{module.name}</h3>
                                                        <p className="text-sm text-slate-600">{module.description}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleModuleToggle(module.id, userHasModule)}
                                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${userHasModule
                                                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        }`}
                                                >
                                                    {userHasModule ? '❌ Deshabilitar' : '✅ Habilitar'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Footer del Modal */}
                            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4">
                                <button
                                    onClick={closeModal}
                                    className="w-full px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Modal de Gestión de Módulos (Existente) */}
                {/* ... */}

                {/* Modal de Crear/Editar Usuario */}
                {showUserModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                            {/* Header */}
                            <div className="bg-earth p-8 text-white relative">
                                <h2 className="text-2xl font-serif font-bold">
                                    {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                                </h2>
                                <p className="text-white/80 text-sm mt-1">
                                    {editingUser ? 'Actualiza el rol o datos del usuario' : 'Crea una nueva cuenta en el sistema'}
                                </p>
                                <button
                                    onClick={() => setShowUserModal(false)}
                                    className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                                >
                                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Formulario */}
                            <form onSubmit={handleUserSubmit} className="p-8 space-y-5">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2 ml-1">Nombre Completo</label>
                                        <input
                                            type="text"
                                            required
                                            disabled={editingUser}
                                            value={userData.name}
                                            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-paper border border-beige-dark/20 rounded-xl focus:outline-none focus:border-earth focus:ring-4 focus:ring-earth/5 transition-all font-medium disabled:opacity-50"
                                            placeholder="Juan Pérez"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2 ml-1">Email</label>
                                        <input
                                            type="email"
                                            required
                                            disabled={editingUser}
                                            value={userData.email}
                                            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-paper border border-beige-dark/20 rounded-xl focus:outline-none focus:border-earth focus:ring-4 focus:ring-earth/5 transition-all font-medium disabled:opacity-50"
                                            placeholder="ejemplo@correo.com"
                                        />
                                    </div>
                                    {!editingUser && (
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2 ml-1">Contraseña</label>
                                            <input
                                                type="password"
                                                required
                                                value={userData.password}
                                                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                                                className="w-full px-4 py-3 bg-paper border border-beige-dark/20 rounded-xl focus:outline-none focus:border-earth focus:ring-4 focus:ring-earth/5 transition-all font-medium"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2 ml-1">Rol del Sistema</label>
                                        <select
                                            value={userData.role}
                                            onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                                            className="w-full px-4 py-3 bg-paper border border-beige-dark/20 rounded-xl focus:outline-none focus:border-earth focus:ring-4 focus:ring-earth/5 transition-all font-medium cursor-pointer"
                                        >
                                            <option value="customer">Cliente (Sin acceso admin)</option>
                                            <option value="admin">Administrador (Acceso modular)</option>
                                            <option value="super_admin">Super Administrador (Acceso total)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowUserModal(false)}
                                        className="flex-1 px-6 py-3 border border-beige-dark/20 text-slate-500 rounded-xl hover:bg-paper transition-all font-bold text-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-earth text-white rounded-xl hover:bg-earth/90 transition-all font-bold text-sm shadow-lg shadow-earth/20"
                                    >
                                        {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
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

export default SuperAdminUserManagement;
