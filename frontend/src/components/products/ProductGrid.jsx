import React from 'react';
import ProductCard from './ProductCard';

/**
 * Grilla de productos limpia y espaciada.
 */
const ProductGrid = ({ products, title, subtitle, titleColor, subtitleColor }) => {
    return (
        <section className="py-20 container mx-auto px-4">
            <div className="text-center mb-16">
                {subtitle && (
                    <span
                        className="font-medium tracking-widest uppercase text-xs mb-2 block"
                        style={{ color: subtitleColor || '#C9A961' }}
                    >
                        {subtitle}
                    </span>
                )}
                <h2
                    className="text-3xl md:text-4xl font-serif"
                    style={{ color: titleColor || '#1e293b' }}
                >
                    {title || 'Nuestros Productos'}
                </h2>
                <div className="w-16 h-1 bg-beige-dark mx-auto mt-4 rounded-full opacity-50"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
};

export default ProductGrid;
