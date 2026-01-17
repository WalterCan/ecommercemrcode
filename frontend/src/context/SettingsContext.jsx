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
        whatsapp_number: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const response = await fetch(`${baseUrl}/settings`);
            if (response.ok) {
                const data = await response.json();
                setSettings(prev => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
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
