import React, { useState, useEffect, useRef } from 'react';

/**
 * Componente LazyImage con Intersection Observer
 * Carga imágenes solo cuando están visibles en el viewport
 * Soporta WebP con fallback a formato original
 */
const LazyImage = ({
    src,
    alt,
    className = '',
    placeholder = '/images/placeholder.jpg',
    useWebP = true,
    size = 'medium' // 'thumbnail', 'medium', 'large', 'original'
}) => {
    const [imageSrc, setImageSrc] = useState(placeholder);
    const [imageLoaded, setImageLoaded] = useState(false);
    const imgRef = useRef(null);

    // Generar ruta WebP según el tamaño
    const getImageSrc = () => {
        if (!src) return placeholder;

        // Si no queremos WebP, devolver original
        if (!useWebP) return src;

        // Extraer nombre base y extensión
        const lastDot = src.lastIndexOf('.');
        const basePath = src.substring(0, lastDot);

        // Generar ruta según tamaño
        const sizeMap = {
            thumbnail: '_thumb',
            medium: '_medium',
            large: '_large',
            original: ''
        };

        const suffix = sizeMap[size] || '';
        return `${basePath}${suffix}.webp`;
    };

    useEffect(() => {
        // Crear Intersection Observer
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Imagen visible, cargar
                        const img = new Image();
                        const webpSrc = getImageSrc();

                        img.onload = () => {
                            setImageSrc(webpSrc);
                            setImageLoaded(true);
                        };

                        // Fallback a imagen original si WebP falla
                        img.onerror = () => {
                            setImageSrc(src);
                            setImageLoaded(true);
                        };

                        img.src = webpSrc;

                        // Dejar de observar una vez cargada
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: '50px', // Cargar 50px antes de ser visible
                threshold: 0.01
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => {
            if (imgRef.current) {
                observer.unobserve(imgRef.current);
            }
        };
    }, [src, size, useWebP]);

    return (
        <img
            ref={imgRef}
            src={imageSrc}
            alt={alt}
            className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-50'} transition-opacity duration-300`}
            loading="lazy"
        />
    );
};

export default LazyImage;
