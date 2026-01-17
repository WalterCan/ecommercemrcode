const { body, param, validationResult } = require('express-validator');

/**
 * Middleware para manejar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Datos inválidos',
            details: errors.array()
        });
    }
    next();
};

/**
 * Validaciones para creación de producto
 */
const validateProduct = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 3, max: 200 }).withMessage('El nombre debe tener entre 3 y 200 caracteres'),
    body('description')
        .trim()
        .notEmpty().withMessage('La descripción es requerida')
        .isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),
    body('price')
        .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
    body('stock')
        .optional()
        .isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo'),
    body('category_id')
        .isInt({ min: 1 }).withMessage('Debes seleccionar una categoría válida'),
    handleValidationErrors
];

/**
 * Validaciones para creación de pedido
 */
const validateOrder = [
    body('customer_name')
        .trim()
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('customer_email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Debe ser un email válido')
        .normalizeEmail(),
    body('customer_phone')
        .trim()
        .notEmpty().withMessage('El teléfono es requerido')
        .matches(/^[0-9+\-\s()]+$/).withMessage('Formato de teléfono inválido'),
    body('items')
        .isArray({ min: 1 }).withMessage('Debes incluir al menos un producto'),
    body('items.*.id')
        .isInt({ min: 1 }).withMessage('ID de producto inválido'),
    body('items.*.quantity')
        .isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),
    body('total')
        .isFloat({ min: 0 }).withMessage('El total debe ser un número positivo'),
    body('payment_method')
        .isIn(['mercadopago', 'transfer', 'whatsapp', 'cash']).withMessage('Método de pago inválido'),
    handleValidationErrors
];

/**
 * Validaciones para registro de usuario
 */
const validateRegister = [
    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Debe ser un email válido')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    handleValidationErrors
];

/**
 * Validaciones para login
 */
const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Debe ser un email válido')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('La contraseña es requerida'),
    handleValidationErrors
];

/**
 * Validaciones para cupón
 */
const validateCoupon = [
    body('code')
        .trim()
        .notEmpty().withMessage('El código es requerido')
        .isLength({ min: 3, max: 20 }).withMessage('El código debe tener entre 3 y 20 caracteres')
        .isUppercase().withMessage('El código debe estar en mayúsculas'),
    body('discount_type')
        .isIn(['percentage', 'fixed']).withMessage('Tipo de descuento inválido'),
    body('discount_value')
        .isFloat({ min: 0 }).withMessage('El valor del descuento debe ser positivo'),
    handleValidationErrors
];

/**
 * Validaciones para reseña
 */
const validateReview = [
    body('customer_name')
        .trim()
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('rating')
        .isInt({ min: 1, max: 5 }).withMessage('La calificación debe ser entre 1 y 5'),
    body('comment')
        .trim()
        .notEmpty().withMessage('El comentario es requerido')
        .isLength({ min: 10, max: 1000 }).withMessage('El comentario debe tener entre 10 y 1000 caracteres'),
    body('product_id')
        .isInt({ min: 1 }).withMessage('ID de producto inválido'),
    handleValidationErrors
];

/**
 * Validaciones para email de recuperación de contraseña
 */
const validateForgotPassword = [
    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Debe ser un email válido')
        .normalizeEmail(),
    handleValidationErrors
];

/**
 * Validaciones para resetear contraseña
 */
const validateResetPassword = [
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
    body('confirmPassword')
        .notEmpty().withMessage('Debes confirmar la contraseña')
        .custom((value, { req }) => value === req.body.password).withMessage('Las contraseñas no coinciden'),
    handleValidationErrors
];

/**
 * Validaciones para categoría
 */
const validateCategory = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre de la categoría es requerido')
        .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('La descripción no puede exceder los 500 caracteres'),
    handleValidationErrors
];

module.exports = {
    validateProduct,
    validateOrder,
    validateRegister,
    validateLogin,
    validateCoupon,
    validateReview,
    validateForgotPassword,
    validateResetPassword,
    validateCategory
};
