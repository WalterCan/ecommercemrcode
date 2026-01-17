import React from 'react';

/**
 * Filtro de Categorías.
 * Muestra pestañas sutiles para filtrar productos.
 */
const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => {
    return (
        <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button
                onClick={() => onCategoryChange(null)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === null
                        ? 'bg-earth text-white shadow-md'
                        : 'bg-white text-slate-500 hover:bg-beige-light hover:text-earth border border-beige-dark/20'
                    }`}
            >
                Todos
            </button>

            {categories.map((category) => (
                <button
                    key={category.id}
                    onClick={() => onCategoryChange(category.id)}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === category.id
                            ? 'bg-earth text-white shadow-md'
                            : 'bg-white text-slate-500 hover:bg-beige-light hover:text-earth border border-beige-dark/20'
                        }`}
                >
                    {category.name}
                </button>
            ))}
        </div>
    );
};

export default CategoryFilter;
