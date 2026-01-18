import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        site_name: 'Perfumería E-commerce',
        site_tagline: 'Fragancias de Alta Calidad',
        site_logo_url: '',
        hero_title: '',
        hero_subtitle: '',
        hero_image_url: '',
        announcement_active: 'false',
        announcement_text: '',
        announcement_link: '',
        social_instagram: '',
        social_facebook: '',
        whatsapp_number: '',
        theme_primary_color: '#D4A5A5',
        theme_secondary_color: '#C9A961',
        theme_background_color: '#FFFBF5',
        theme_background_secondary: '#F7E7CE',
        theme_text_primary: '#1e293b',
        theme_text_secondary: '#64748b'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    // Apply theme colors as CSS variables
    useEffect(() => {
        console.log('🎨 Aplicando colores del tema:', settings);
        if (settings.theme_primary_color) {
            const root = document.documentElement;
            root.style.setProperty('--color-primary', settings.theme_primary_color);
            root.style.setProperty('--color-secondary', settings.theme_secondary_color);
            root.style.setProperty('--color-bg-primary', settings.theme_background_color);
            root.style.setProperty('--color-bg-secondary', settings.theme_background_secondary);
            root.style.setProperty('--color-text-primary', settings.theme_text_primary);
            root.style.setProperty('--color-text-secondary', settings.theme_text_secondary);
            console.log('✅ CSS Variables aplicadas correctamente');
        }
    }, [settings]);

    const fetchSettings = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            console.log('📡 Cargando settings desde:', `${baseUrl}/settings`);
            const response = await fetch(`${baseUrl}/settings`);
            if (response.ok) {
                const data = await response.json();
                console.log('📦 Settings recibidos:', data);
                setSettings(prev => ({ ...prev, ...data }));
            } else {
                console.error('❌ Error HTTP:', response.status);
            }
        } catch (error) {
            console.error('❌ Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshSettings = () => {
        fetchSettings();
    };

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
