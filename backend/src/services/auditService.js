const AuditLog = require('../models/AuditLog');

const auditService = {
    /**
     * Log an action
     * @param {Object} req - Express request object (optional, for extraction)
     * @param {string} action - Action type (CREATE, UPDATE, DELETE, etc.)
     * @param {string} resource - Target resource (User, Patient, etc.)
     * @param {string|number} resourceId - ID of target resource
     * @param {Object} details - Additional data
     */
    log: async (req, action, resource, resourceId, details = {}) => {
        try {
            let userId = null;
            let ipAddress = null;
            let userAgent = null;

            if (req) {
                userId = req.user ? req.user.id : null;
                ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                userAgent = req.headers['user-agent'];
            }

            // Fallbacks if passed directly via details (e.g. cron jobs)
            if (!userId && details.userId) userId = details.userId;

            await AuditLog.create({
                user_id: userId,
                action,
                resource,
                resource_id: String(resourceId),
                details,
                ip_address: ipAddress,
                user_agent: userAgent
            });

            console.log(`[AUDIT] ${action} on ${resource} ${resourceId} by User ${userId}`);
        } catch (error) {
            console.error('[AUDIT ERROR] Failed to create log:', error);
            // Non-blocking: don't throw error to avoid disrupting main flow
        }
    }
};

module.exports = auditService;
