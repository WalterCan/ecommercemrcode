import React from 'react';

/**
 * Filtro de Categorías.
 * Muestra pestañas sutiles para filtrar productos.
 * Responsive para móvil con scroll horizontal.
 */
const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => {
    return (
        <div className="mb-12 -mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex overflow-x-auto md:flex-wrap md:overflow-visible md:justify-center gap-2 md:gap-4 pb-2 md:pb-0 snap-x snap-mandatory">
                <button
                    onClick={() => onCategoryChange(null)}
                    className={`flex-shrink-0 px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap snap-start ${activeCategory === null
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
                        className={`flex-shrink-0 px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap snap-start ${activeCategory === category.id
                                ? 'bg-earth text-white shadow-md'
                                : 'bg-white text-slate-500 hover:bg-beige-light hover:text-earth border border-beige-dark/20'
                            }`}
                    >
                        {category.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryFilter;
