import React from 'react';

/**
 * StockBadge - Componente reutilizable para mostrar el estado del stock
 * @param {number} stock - Cantidad actual en stock
 * @param {number} stockMinimo - Umbral de stock bajo
 * @param {number} stockCritico - Umbral de stock crítico
 * @param {string} size - Tamaño del badge ('sm', 'md', 'lg')
 */
const StockBadge = ({ stock, stockMinimo = 10, stockCritico = 3, size = 'md' }) => {
    const getStatus = () => {
        if (stock <= stockCritico) return 'critical';
        if (stock <= stockMinimo) return 'low';
        return 'ok';
    };

    const status = getStatus();

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base'
    };

    const statusConfig = {
        critical: {
            bg: 'bg-red-100',
            text: 'text-red-800',
            border: 'border-red-300',
            label: 'Crítico',
            icon: '⚠️'
        },
        low: {
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            border: 'border-yellow-300',
            label: 'Bajo',
            icon: '⚡'
        },
        ok: {
            bg: 'bg-green-100',
            text: 'text-green-800',
            border: 'border-green-300',
            label: 'OK',
            icon: '✓'
        }
    };

    const config = statusConfig[status];

    return (
        <span
            className={`
                inline-flex items-center gap-1 rounded-full border font-medium
                ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}
            `}
            title={`Stock: ${stock} unidades`}
        >
            <span>{config.icon}</span>
            <span>{stock} {size !== 'sm' && `- ${config.label}`}</span>
        </span>
    );
};

export default StockBadge;
