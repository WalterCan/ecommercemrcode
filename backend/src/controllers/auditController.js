const logger = require('../utils/logger');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

// Obtener logs (Super Admin)
const getAuditLogs = async (req, res) => {
    try {
        const { limit = 50, offset = 0, action, resource, user_id } = req.query;

        const where = {};
        if (action) where.action = action;
        if (resource) where.resource = resource;
        if (user_id) where.user_id = user_id;

        const logs = await AuditLog.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']],
            include: [
                { model: User, as: 'user', attributes: ['name', 'email', 'role'] }
            ]
        });

        res.json(logs);
    } catch (error) {
        logger.error('Error fetching audit logs:', error);
        res.status(500).json({ error: 'Error al obtener logs de auditoría' });
    }
};

module.exports = {
    getAuditLogs
};
