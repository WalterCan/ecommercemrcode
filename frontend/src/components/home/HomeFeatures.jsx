import React from 'react';
import { Link } from 'react-router-dom';
import { formatImageUrl } from '../../utils/imageConfig';

const HomeFeatures = ({ settings }) => {
    // Verificar si está activo (maneja string 'true' o booleano true)
    const isActive = settings.home_cards_active === 'true' || settings.home_cards_active === true;

    if (!isActive) return null;

    const cards = [1, 2, 3].map(num => ({
        id: num,
        title: settings[`home_card_${num}_title`],
        desc: settings[`home_card_${num}_desc`],
        icon: settings[`home_card_${num}_icon`],
        link: settings[`home_card_${num}_link`],
        image: settings[`home_card_${num}_image_url`],
    }));

    // Si no hay ninguna tarjeta con título, no renderizamos nada para evitar gaps vacíos
    // Opcional: permitir mostrar tarjetas sin título si tienen imagen? Mejor exigir al menos título o desc.
    const validCards = cards.filter(c => c.title || c.desc || c.image);

    if (validCards.length === 0) return null;

    return (
        <section className="py-20 bg-white relative overflow-hidden">
            {/* Decoración de fondo sutil */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
                <div className="absolute top-1/4 left-0 w-64 h-64 bg-beige-dark/10 rounded-full blur-3xl transform -translate-x-1/2"></div>
                <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-earth/5 rounded-full blur-3xl transform translate-x-1/2"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Título de Sección */}
                {settings.home_cards_title && (
                    <div className="text-center mb-16">
                        <h2
                            className="text-3xl md:text-4xl font-serif font-bold mb-4"
                            style={{ color: settings.home_cards_title_color || '#1e293b' }}
                        >
                            {settings.home_cards_title}
                        </h2>
                        <div className="w-24 h-1 bg-earth/30 mx-auto rounded-full"></div>
                    </div>
                )}

                {/* Grid de Tarjetas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                    {validCards.map((card) => {
                        // Wrapper condicional: si hay link usa Link, sino div
                        const Wrapper = card.link ? Link : 'div';
                        const wrapperProps = card.link ? { to: card.link, className: "group h-full" } : { className: "h-full" };

                        return (
                            <Wrapper key={card.id} {...wrapperProps}>
                                <div className={`
                                    h-full bg-paper/30 rounded-3xl p-8 text-center transition-all duration-300 border border-beige-dark/5
                                    ${card.link ? 'hover:-translate-y-2 hover:shadow-xl hover:bg-white cursor-pointer' : ''}
                                `}>
                                    {/* Imagen o Icono */}
                                    <div className="mb-6 flex justify-center">
                                        {card.image ? (
                                            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm">
                                                <img
                                                    src={formatImageUrl(card.image)}
                                                    alt={card.title || 'Feature'}
                                                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                                                />
                                            </div>
                                        ) : card.icon ? (
                                            <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-4xl shadow-sm border border-earth/10 group-hover:scale-110 transition-transform duration-300">
                                                {card.icon}
                                            </div>
                                        ) : null}
                                    </div>

                                    {/* Contenido */}
                                    <h3 className="text-xl font-bold font-serif text-earth mb-4 group-hover:text-earth-dark transition-colors">
                                        {card.title}
                                    </h3>

                                    {card.desc && (
                                        <p className="text-slate-600 leading-relaxed text-sm">
                                            {card.desc}
                                        </p>
                                    )}

                                    {/* Indicador de link (flecha) sólo si hay link */}
                                    {card.link && (
                                        <div className="mt-6 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                            <span className="text-earth font-bold text-sm flex items-center gap-2">
                                                Ver más
                                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Wrapper>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default HomeFeatures;
