import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SEO = ({ title, description, image, type = 'website' }) => {
    const location = useLocation();
    const siteName = import.meta.env.VITE_SITE_NAME || 'Holística';
    const currentUrl = window.location.origin + location.pathname;
    const defaultImage = 'https://via.placeholder.com/1200x630?text=Holistica+Store';

    const finalTitle = title ? `${title} | ${siteName}` : siteName;
    const finalDescription = description || 'Tienda de productos holísticos y bienestar.';
    const finalImage = image || defaultImage;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{finalTitle}</title>
            <meta name='description' content={finalDescription} />
            <link rel="canonical" href={currentUrl} />

            {/* End standard metadata tags */}

            {/* Facebook tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={finalTitle} />
            <meta property="og:description" content={finalDescription} />
            <meta property="og:image" content={finalImage} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:site_name" content={siteName} />
            {/* End Facebook tags */}

            {/* Twitter tags */}
            <meta name="twitter:creator" content={siteName} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={finalTitle} />
            <meta name="twitter:description" content={finalDescription} />
            <meta name="twitter:image" content={finalImage} />
            {/* End Twitter tags */}
        </Helmet>
    );
}

export default SEO;
