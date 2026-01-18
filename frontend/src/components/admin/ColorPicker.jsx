import React from 'react';

const ColorPicker = ({ label, name, value, onChange, description }) => {
    return (
        <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">
                {label}
            </label>
            <div className="flex gap-3 items-center">
                {/* Color input visual */}
                <div className="relative">
                    <input
                        type="color"
                        name={name}
                        value={value || '#000000'}
                        onChange={onChange}
                        className="w-16 h-12 rounded-lg cursor-pointer border-2 border-beige-dark/20"
                        title={`Seleccionar ${label}`}
                    />
                </div>

                {/* Text input para código hex */}
                <input
                    type="text"
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    className="flex-1 bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth font-mono text-sm uppercase"
                    placeholder="#000000"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    maxLength="7"
                />

                {/* Preview circle */}
                <div
                    className="w-12 h-12 rounded-full border-2 border-beige-dark/20 shadow-sm"
                    style={{ backgroundColor: value || '#000000' }}
                    title="Vista previa"
                />
            </div>
            {description && (
                <p className="text-[10px] text-slate-400 italic">{description}</p>
            )}
        </div>
    );
};

export default ColorPicker;
