const Module = require('../models/Module');
const User = require('../models/User');
const UserModule = require('../models/UserModule');
const { Op } = require('sequelize');

/**
 * Listar todos los módulos disponibles
 */
exports.listModules = async (req, res) => {
    try {
        console.log(`📋 Catálogo de módulos solicitado por usuario ID: ${req.user.id}, Rol: ${req.user.role}`);
        const modules = await Module.findAll({
            order: [['name', 'ASC']]
        });
        res.json(modules);
    } catch (error) {
        console.error('Error listing modules:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Obtener módulos de un usuario específico
 */
exports.getUserModules = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId, {
            include: [{
                model: Module,
                as: 'modules',
                through: {
                    attributes: ['enabled', 'enabled_at', 'enabled_by_admin_id']
                }
            }]
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(user.modules || []);
    } catch (error) {
        console.error('Error getting user modules:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Habilitar un módulo para un usuario
 */
exports.enableModuleForUser = async (req, res) => {
    try {
        const { userId, moduleId } = req.body;

        if (!userId || !moduleId) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'Se requiere userId y moduleId'
            });
        }

        const module = await Module.findByPk(moduleId);
        if (!module || !module.is_active) {
            return res.status(404).json({ error: 'Módulo no encontrado o inactivo' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Crear o actualizar el permiso
        const [userModule, created] = await UserModule.findOrCreate({
            where: { user_id: userId, module_id: moduleId },
            defaults: {
                enabled: true,
                enabled_at: new Date(),
                enabled_by_admin_id: req.user.id
            }
        });

        if (!created) {
            await userModule.update({
                enabled: true,
                enabled_at: new Date(),
                enabled_by_admin_id: req.user.id
            });
        }

        res.json({
            success: true,
            message: `Módulo "${module.name}" habilitado para ${user.name}`,
            userModule
        });
    } catch (error) {
        console.error('Error enabling module:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Deshabilitar un módulo para un usuario
 */
exports.disableModuleForUser = async (req, res) => {
    try {
        const { userId, moduleId } = req.body;

        if (!userId || !moduleId) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'Se requiere userId y moduleId'
            });
        }

        const userModule = await UserModule.findOne({
            where: { user_id: userId, module_id: moduleId }
        });

        if (!userModule) {
            return res.status(404).json({ error: 'Permiso no encontrado' });
        }

        await userModule.update({ enabled: false });

        const module = await Module.findByPk(moduleId);
        const user = await User.findByPk(userId);

        res.json({
            success: true,
            message: `Módulo "${module?.name}" deshabilitado para ${user?.name}`
        });
    } catch (error) {
        console.error('Error disabling module:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Obtener todos los usuarios con sus módulos (para panel Super Admin)
 */
exports.getAllUsersWithModules = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'created_at'],
            include: [{
                model: Module,
                as: 'modules',
                through: {
                    attributes: ['enabled', 'enabled_at'],
                    where: { enabled: true },
                    required: false
                }
            }],
            order: [['name', 'ASC']]
        });

        res.json(users);
    } catch (error) {
        console.error('Error getting users with modules:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Obtener módulos del usuario autenticado (para cliente)
 */
exports.getMyModules = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [{
                model: Module,
                as: 'modules',
                through: {
                    attributes: ['enabled', 'enabled_at'],
                    where: { enabled: true }
                }
            }]
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(user.modules || []);
    } catch (error) {
        console.error('Error getting my modules:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Crear un nuevo usuario (Super Admin)
 */
exports.createUser = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        if (!email || !password || !name || !role) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        // Verificar si ya existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
        }

        // Crear usuario
        const user = await User.create({
            email,
            password,
            name,
            role
        });

        res.status(201).json({
            message: 'Usuario creado con éxito',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

/**
 * Actualizar el rol de un usuario (Super Admin)
 */
exports.updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({ message: 'El rol es obligatorio' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Evitar que el super admin se quite a sí mismo el rol o degrade a otros super admins si se desea
        // Por ahora permitimos todo lo que pida el cliente, pero validamos que el rol sea válido
        const validRoles = ['super_admin', 'admin', 'customer'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Rol no válido' });
        }

        await user.update({ role });

        res.json({
            message: `Rol actualizado a ${role} con éxito`,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error al actualizar rol:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

/**
 * Activar/Desactivar un usuario (Super Admin)
 */
exports.toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;

        // No permitir que el super admin se desactive a sí mismo
        if (parseInt(userId) === req.user.id) {
            return res.status(400).json({ message: 'No puedes desactivar tu propia cuenta' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const newStatus = !user.is_active;
        await user.update({ is_active: newStatus });

        res.json({
            message: `Usuario ${newStatus ? 'activado' : 'desactivado'} con éxito`,
            user: {
                id: user.id,
                email: user.email,
                is_active: user.is_active
            }
        });
    } catch (error) {
        console.error('Error al cambiar estado del usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};
