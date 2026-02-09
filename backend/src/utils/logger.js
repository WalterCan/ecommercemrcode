const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Definir niveles de log personalizados
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Definir colores para cada nivel
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

winston.addColors(colors);

// Formato personalizado para logs
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
);

// Transports para diferentes tipos de logs
const transports = [
    // Console transport (para desarrollo)
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }),

    // Archivo para todos los logs (rotación diaria)
    new DailyRotateFile({
        filename: path.join(__dirname, '../../logs/combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.combine(
            winston.format.uncolorize(),
            winston.format.timestamp(),
            winston.format.json()
        )
    }),

    // Archivo solo para errores (rotación diaria)
    new DailyRotateFile({
        level: 'error',
        filename: path.join(__dirname, '../../logs/error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        format: winston.format.combine(
            winston.format.uncolorize(),
            winston.format.timestamp(),
            winston.format.json()
        )
    }),
];

// Crear el logger
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    levels,
    format,
    transports,
    exitOnError: false,
});

// Método helper para logging de requests HTTP
logger.http = (message, meta = {}) => {
    logger.log('http', message, meta);
};

// Método helper para logging de errores con stack trace
logger.logError = (error, context = '') => {
    const errorMessage = context ? `${context}: ${error.message}` : error.message;
    logger.error(errorMessage, {
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
    });
};

module.exports = logger;
