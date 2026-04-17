import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ColorPicker from '../../components/admin/ColorPicker';
import { useToast } from '../../context/ToastContext';
import { formatImageUrl } from '../../utils/imageConfig';

import { useAuth } from '../../context/AuthContext'; // [NEW]

const AdminSettings = () => {
    const { user } = useAuth(); // [NEW]
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        bank_name: '',
        bank_account_holder: '',
        bank_cbu: '',
        bank_alias: '',
        terms_text: '',
        privacy_text: '',
        whatsapp_number: '',
        whatsapp_message: '',
        hero_tagline: '',
        hero_tagline_color: '#64748b',
        hero_title: '',
        hero_title_color: '#1e293b',
        hero_subtitle: '',
        hero_subtitle_color: '#64748b',
        hero_image_url: '',
        hero_cta_text: '',
        hero_cta1_link: '',
        hero_cta2_text: '',
        hero_cta2_link: '',
        email_host: '',
        email_port: '',
        email_user: '',
        email_password: '',
        email_secure: '',
        email_from_name: '',
        contact_email: '',
        contact_address: '',
        contact_city: '',
        contact_phone: '',
        announcement_active: 'false',
        announcement_text: '',
        announcement_text_color: '#ffffff',
        announcement_bg_color: '#8A9A5B',
        announcement_link: '',
        social_instagram: '',
        social_facebook: '',
        site_logo_url: '',
        site_name: '',
        site_name_color: '#334155',
        site_tagline: '',
        site_tagline_color: '#64748b',
        theme_primary_color: '#D4A5A5',
        theme_secondary_color: '#C9A961',
        theme_background_color: '#FFFBF5',
        theme_background_secondary: '#F7E7CE',
        theme_text_primary: '#1e293b',
        theme_text_secondary: '#64748b',
        site_logo_height: '48',
        site_logo_height_mobile: '32',
        // Nosotros
        about_hero_tagline: '',
        about_hero_tagline_color: '#9a3412',
        about_hero_title: '',
        about_hero_title_color: '#1e293b',
        about_mission_image_url: '',
        about_mission_title: '',
        about_mission_title_color: '#1e293b',
        about_mission_text: '',
        about_mission_text_color: '#475569',
        about_prop_1_title: '',
        about_prop_1_text: '',
        about_prop_2_title: '',
        about_prop_2_text: '',
        about_values_title: '',
        about_values_title_color: '#1e293b',
        about_values_subtitle: '',
        about_values_subtitle_color: '#64748b',
        // Sección Decorativa Home
        home_decorative_title: '',
        home_decorative_title_color: '#3d4a3d',
        home_decorative_text: '',
        home_decorative_text_color: '#475569',
        about_value_1_title: '',
        about_value_1_text: '',
        about_value_1_icon: '',
        about_value_1_image_url: '',
        about_value_2_title: '',
        about_value_2_text: '',
        about_value_2_icon: '',
        about_value_2_image_url: '',
        about_value_3_title: '',
        about_value_3_text: '',
        about_value_3_icon: '',
        about_value_3_image_url: '',
        // Productos
        products_title: '',
        products_title_color: '#1e293b',
        products_subtitle: '',
        products_subtitle_color: '#64748b',
        products_empty_icon: '🕯️',
        products_empty_text: '',
        products_empty_text_color: '#94a3b8',
        products_empty_image_url: '',
        products_detail_reviews_color: '#8A9A5B',
        // Licencia
        license_key: '',
        // Detalle de Producto
        products_detail_title_color: '#0f172a',
        products_detail_price_color: '#8A9A5B',
        products_detail_stock_color: '#8A9A5B',
        products_detail_description_color: '#475569',
        products_detail_button_bg_color: '#8A9A5B',
        products_detail_button_text_color: '#ffffff',
        products_detail_badge_bg_color: '#F7E7CE',
        products_detail_badge_text_color: '#8A9A5B',
        // Atributos de detalle
        products_detail_attr1_text: '100% Natural',
        products_detail_attr1_icon: '🌿',
        products_detail_attr1_image_url: '',
        products_detail_attr2_text: 'Artesanal',
        products_detail_attr2_icon: '✨',
        products_detail_attr2_image_url: '',
        // CTA
        about_cta_title: '',
        about_cta_title_color: '#ffffff',
        about_cta_button_text: '',
        about_cta_button_link: '',
        // Footer
        footer_bg_color: '#FDFCF8',
        footer_border_color: '#E5E7EB',
        footer_text_color: '#475569',
        footer_description: 'Productos seleccionados para tu bienestar y equilibrio energético.',
        footer_title_color: '#8A9A5B',
        footer_tagline: 'Inspirando tu equilibrio natural',
        footer_tagline_color: '#94a3b8',
        footer_copyright_color: '#94a3b8',

        // Tarjetas Home
        home_cards_active: 'false',
        home_cards_title: 'Nuestros Servicios',
        home_cards_title_color: '#1e293b',
        // Visibilidad Web
        web_show_home: 'true',
        web_show_about: 'true',
        web_show_contact: 'true',
        web_show_products: 'true', // [NEW]
        web_show_therapies: 'true', // [NEW]
        maintenance_mode_active: 'false', // [NEW]
        // Envío
        shipping_enabled: 'false',
        shipping_fixed_cost: '0',
        home_card_1_title: '',
        home_card_1_desc: '',
        home_card_1_icon: '🌱',
        home_card_1_link: '',
        home_card_1_image_url: '',
        home_card_2_title: '',
        home_card_2_desc: '',
        home_card_2_icon: '✨',
        home_card_2_link: '',
        home_card_2_image_url: '',
        home_card_3_title: '',
        home_card_3_desc: '',
        home_card_3_icon: '🧘',
        home_card_3_link: '',
        home_card_3_image_url: '',
    });
    const [heroImageFile, setHeroImageFile] = useState(null);
    const [heroImagePreview, setHeroImagePreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [aboutImageFile, setAboutImageFile] = useState(null);
    const [aboutImagePreview, setAboutImagePreview] = useState(null);
    const [v1ImageFile, setV1ImageFile] = useState(null);
    const [v1ImagePreview, setV1ImagePreview] = useState(null);
    const [v2ImageFile, setV2ImageFile] = useState(null);
    const [v2ImagePreview, setV2ImagePreview] = useState(null);
    const [v3ImageFile, setV3ImageFile] = useState(null);
    const [v3ImagePreview, setV3ImagePreview] = useState(null);
    const [productsEmptyImageFile, setProductsEmptyImageFile] = useState(null);
    const [productsEmptyImagePreview, setProductsEmptyImagePreview] = useState(null);
    const [attr1ImageFile, setAttr1ImageFile] = useState(null);
    const [attr1ImagePreview, setAttr1ImagePreview] = useState(null);
    const [attr2ImageFile, setAttr2ImageFile] = useState(null);
    const [attr2ImagePreview, setAttr2ImagePreview] = useState(null);
    // Home Cards Images
    const [card1ImageFile, setCard1ImageFile] = useState(null);
    const [card1ImagePreview, setCard1ImagePreview] = useState(null);
    const [card2ImageFile, setCard2ImageFile] = useState(null);
    const [card2ImagePreview, setCard2ImagePreview] = useState(null);
    const [card3ImageFile, setCard3ImageFile] = useState(null);
    const [card3ImagePreview, setCard3ImagePreview] = useState(null);
    const [activeTab, setActiveTab] = useState('general');
    const [activeModules, setActiveModules] = useState([]); // [NEW]

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
                const res = await fetch(`${baseUrl}/modules/active`);
                if (res.ok) {
                    const data = await res.json();
                    setActiveModules(data);
                }
            } catch (error) {
                console.error('Error fetching modules:', error);
            }
        };
        fetchModules();
        fetchSettings();
    }, []);

    const tabs = [
        { id: 'general', label: 'General', icon: '⚙️' },
        { id: 'legal', label: 'Legales', icon: '⚖️' },
        { id: 'pagos', label: 'Pagos', icon: '💳' },
        { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
        { id: 'email', label: 'Correo', icon: '📧' },
        { id: 'hero', label: 'Portada', icon: '🖼️' },
        { id: 'nosotros', label: 'Nosotros', icon: '👥' },
        { id: 'productos', label: 'Productos', icon: '🛍️' },
        { id: 'footer', label: 'Footer', icon: '🦶' },
        { id: 'estilo', label: 'Estilo', icon: '🎨' },
        { id: 'cards', label: 'Web Inst.', icon: '🌐' },
        // { id: 'licencia', label: 'Licencia', icon: '🔑' }, // REMOVED
        { id: 'agenda', label: 'Turnos', icon: '📅' },
    ].filter(tab => {
        // [NEW] Restricción Super Admin para Web Inst.
        if (tab.id === 'cards' && user?.role !== 'super_admin') return false;

        if (tab.id === 'agenda' && !activeModules.includes('appointments')) return false;
        return true;
    });

    const fetchSettings = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const response = await fetch(`${baseUrl}/settings`);
            const data = await response.json();

            // Mezclamos con los valores por defecto por si falta alguno
            console.log('📦 Data recibida del server:', data);
            setSettings(prev => ({ ...prev, ...data }));
        } catch (error) {
            console.error('Error fetching settings:', error);
            showToast('Error al cargar configuraciones', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'hero') {
                setHeroImageFile(file);
                setHeroImagePreview(URL.createObjectURL(file));
            } else if (type === 'logo') {
                setLogoFile(file);
                setLogoPreview(URL.createObjectURL(file));
            } else if (type === 'about') {
                setAboutImageFile(file);
                setAboutImagePreview(URL.createObjectURL(file));
            } else if (type === 'v1') {
                setV1ImageFile(file);
                setV1ImagePreview(URL.createObjectURL(file));
            } else if (type === 'v2') {
                setV2ImageFile(file);
                setV2ImagePreview(URL.createObjectURL(file));
            } else if (type === 'v3') {
                setV3ImageFile(file);
                setV3ImagePreview(URL.createObjectURL(file));
            } else if (type === 'products_empty') {
                setProductsEmptyImageFile(file);
                setProductsEmptyImagePreview(URL.createObjectURL(file));
            } else if (type === 'attr1') {
                setAttr1ImageFile(file);
                setAttr1ImagePreview(URL.createObjectURL(file));
            } else if (type === 'attr2') {
                setAttr2ImageFile(file);
                setAttr2ImagePreview(URL.createObjectURL(file));
            }
        }
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        setSettings(prev => {
            const newSettings = { ...prev };
            delete newSettings.site_logo_url; // Remove from updates so it doesn't try to save old
            return newSettings;
        });
        // We explicitly need to tell the backend to clear it
        setSettings(prev => ({ ...prev, site_logo_url: '' }));
    };

    const handleRemoveIcon = (type) => {
        if (type === 'v1') {
            setV1ImageFile(null);
            setV1ImagePreview(null);
            setSettings(prev => ({ ...prev, about_value_1_image_url: '' }));
        } else if (type === 'v2') {
            setV2ImageFile(null);
            setV2ImagePreview(null);
            setSettings(prev => ({ ...prev, about_value_2_image_url: '' }));
        } else if (type === 'v3') {
            setV3ImageFile(null);
            setV3ImagePreview(null);
            setSettings(prev => ({ ...prev, about_value_3_image_url: '' }));
        } else if (type === 'products_empty') {
            setProductsEmptyImageFile(null);
            setProductsEmptyImagePreview(null);
            setSettings(prev => ({ ...prev, products_empty_image_url: '' }));
        } else if (type === 'attr1') {
            setAttr1ImageFile(null);
            setAttr1ImagePreview(null);
            setSettings(prev => ({ ...prev, products_detail_attr1_image_url: '' }));
        } else if (type === 'attr2') {
            setAttr2ImageFile(null);
            setAttr2ImagePreview(null);
            setSettings(prev => ({ ...prev, products_detail_attr2_image_url: '' }));
        } else if (type === 'card1') {
            setCard1ImageFile(null);
            setCard1ImagePreview(null);
            setSettings(prev => ({ ...prev, home_card_1_image_url: '' }));
        } else if (type === 'card2') {
            setCard2ImageFile(null);
            setCard2ImagePreview(null);
            setSettings(prev => ({ ...prev, home_card_2_image_url: '' }));
        } else if (type === 'card3') {
            setCard3ImageFile(null);
            setCard3ImagePreview(null);
            setSettings(prev => ({ ...prev, home_card_3_image_url: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

            const formData = new FormData();
            formData.append('data', JSON.stringify(settings));
            if (heroImageFile) {
                formData.append('hero_image', heroImageFile);
            }
            if (logoFile) {
                formData.append('logo_image', logoFile);
            }
            if (aboutImageFile) {
                formData.append('about_mission_image', aboutImageFile);
            }
            if (v1ImageFile) formData.append('v1_image', v1ImageFile);
            if (v2ImageFile) formData.append('v2_image', v2ImageFile);
            if (v3ImageFile) formData.append('v3_image', v3ImageFile);
            if (productsEmptyImageFile) formData.append('products_empty_image', productsEmptyImageFile);
            if (attr1ImageFile) formData.append('attr1_image', attr1ImageFile);
            if (attr2ImageFile) formData.append('attr2_image', attr2ImageFile);
            if (card1ImageFile) formData.append('card1_image', card1ImageFile);
            if (card2ImageFile) formData.append('card2_image', card2ImageFile);
            if (card3ImageFile) formData.append('card3_image', card3ImageFile);

            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl}/settings`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                showToast('Configuraciones guardadas', 'success');
                // IMPORTANTE: Refrescar los settings para obtener las nuevas URLs del servidor
                await fetchSettings();
                // Limpiar los archivos temporales ya que ahora tenemos las URLs reales
                setHeroImageFile(null);
                setHeroImagePreview(null);
                setLogoFile(null);
                setLogoPreview(null);
                setAboutImageFile(null);
                setAboutImagePreview(null);
                setV1ImageFile(null);
                setV1ImagePreview(null);
                setV2ImageFile(null);
                setV2ImagePreview(null);
                setV3ImageFile(null);
                setV3ImagePreview(null);
                setProductsEmptyImageFile(null);
                setProductsEmptyImagePreview(null);
                setAttr1ImageFile(null);
                setAttr1ImagePreview(null);
                setAttr2ImageFile(null);
                setAttr2ImagePreview(null);
                setCard1ImageFile(null);
                setCard1ImagePreview(null);
                setCard2ImageFile(null);
                setCard2ImagePreview(null);
                setCard3ImageFile(null);
                setCard3ImagePreview(null);
            } else {
                showToast('Error al guardar configuraciones', 'error');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            showToast('Error de conexión', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout title="Ajustes de la Tienda">
            <div className="p-10 max-w-4xl mx-auto w-full">
                <div className="space-y-8">
                    {/* Tab Switcher */}
                    <div className="flex flex-wrap gap-2 mb-8 bg-paper/50 p-2 rounded-2xl border border-beige-dark/10">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium text-sm ${activeTab === tab.id
                                    ? 'bg-earth text-white shadow-md'
                                    : 'text-slate-500 hover:bg-white hover:text-earth'
                                    }`}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-earth/20 border-t-earth"></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* General Tab */}
                            {activeTab === 'general' && (
                                <>
                                    {/* Barra de Anuncios */}
                                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
                                        <h2 className="text-xl font-serif text-earth font-bold mb-6 flex items-center gap-2">
                                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                                            Barra de Anuncios
                                        </h2>
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="announcement_active"
                                                        checked={settings.announcement_active === 'true' || settings.announcement_active === true}
                                                        onChange={(e) => handleChange({ target: { name: 'announcement_active', value: e.target.checked.toString() } })}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-earth/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-earth"></div>
                                                    <span className="ml-3 text-sm font-medium text-slate-700">Activar Barra Superior</span>
                                                </label>
                                            </div>
                                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 items-start transition-opacity duration-300 ${settings.announcement_active === 'true' || settings.announcement_active === true ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Mensaje</label>
                                                        <input
                                                            type="text"
                                                            name="announcement_text"
                                                            value={settings.announcement_text || ''}
                                                            onChange={handleChange}
                                                            className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth font-bold text-earth"
                                                            placeholder="¡Envío gratis!"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Enlace (Opcional)</label>
                                                        <input
                                                            type="text"
                                                            name="announcement_link"
                                                            value={settings.announcement_link || ''}
                                                            onChange={handleChange}
                                                            className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth"
                                                            placeholder="/productos"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <ColorPicker
                                                        label="Color de Fondo de Barra"
                                                        name="announcement_bg_color"
                                                        value={settings.announcement_bg_color}
                                                        onChange={handleChange}
                                                    />
                                                    <ColorPicker
                                                        label="Color de Texto de Barra"
                                                        name="announcement_text_color"
                                                        value={settings.announcement_text_color}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Identidad de Marca y Redes */}
                                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
                                        <h2 className="text-xl font-serif text-earth font-bold mb-6 flex items-center gap-2">
                                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                            Identidad y Redes Sociales
                                        </h2>
                                        <div className="space-y-8">
                                            <div className="p-6 bg-paper/50 rounded-2xl border border-beige-dark/10">
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Identidad Visual</label>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mb-6">
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Nombre de la Tienda (Texto)</label>
                                                        <input
                                                            type="text"
                                                            name="site_name"
                                                            value={settings.site_name || ''}
                                                            onChange={handleChange}
                                                            className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth font-serif font-bold text-lg text-earth"
                                                            placeholder="Perfumería E-commerce"
                                                        />
                                                        <p className="text-[10px] text-slate-400 mt-1">Este texto se mostrará si no hay un logo subido.</p>
                                                    </div>
                                                    <ColorPicker
                                                        label="Color del Nombre"
                                                        name="site_name_color"
                                                        value={settings.site_name_color}
                                                        onChange={handleChange}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mb-6">
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Eslogan / Tagline</label>
                                                        <input
                                                            type="text"
                                                            name="site_tagline"
                                                            value={settings.site_tagline || ''}
                                                            onChange={handleChange}
                                                            className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth text-sm"
                                                            placeholder="Fragancias de Alta Calidad"
                                                        />
                                                        <p className="text-[10px] text-slate-400 mt-1">Aparecerá en el título de la pestaña del navegador.</p>
                                                    </div>
                                                    <ColorPicker
                                                        label="Color del Tagline (en logo texto)"
                                                        name="site_tagline_color"
                                                        value={settings.site_tagline_color}
                                                        onChange={handleChange}
                                                    />
                                                </div>

                                                <div className="h-px bg-beige-dark/10 my-6"></div>

                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Logo de la Tienda</label>
                                                <div className="flex items-center gap-8">
                                                    <div className="w-32 h-32 bg-white rounded-xl border border-beige-dark/10 flex items-center justify-center overflow-hidden p-2 relative group">
                                                        {(logoPreview || settings.site_logo_url) ? (
                                                            <>
                                                                <img
                                                                    src={logoPreview || formatImageUrl(settings.site_logo_url)}
                                                                    alt="Logo Preview"
                                                                    className="w-full h-full object-contain"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={handleRemoveLogo}
                                                                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    title="Eliminar Logo"
                                                                >
                                                                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <div className="text-center p-2 flex flex-col items-center justify-center h-full">
                                                                <span className="text-earth font-serif font-bold text-xs uppercase text-center leading-tight">
                                                                    {settings.site_name || 'TIENDA HOLÍSTICA'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleFileChange(e, 'logo')}
                                                            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-earth/10 file:text-earth hover:file:bg-earth/20 cursor-pointer mb-2"
                                                        />
                                                        <p className="text-[10px] text-slate-400">Recomendado: PNG transparente, máx 2MB.</p>
                                                        {(logoPreview || settings.site_logo_url) && (
                                                            <button
                                                                type="button"
                                                                onClick={handleRemoveLogo}
                                                                className="text-xs text-red-500 hover:text-red-700 mt-2 font-bold flex items-center gap-1"
                                                            >
                                                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                Eliminar Logo Actual
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Altura del Logo (Desktop - px)</label>
                                                        <input
                                                            type="number"
                                                            name="site_logo_height"
                                                            value={settings.site_logo_height || '48'}
                                                            onChange={handleChange}
                                                            className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth text-sm"
                                                            placeholder="48"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Altura del Logo (Móvil - px)</label>
                                                        <input
                                                            type="number"
                                                            name="site_logo_height_mobile"
                                                            value={settings.site_logo_height_mobile || '32'}
                                                            onChange={handleChange}
                                                            className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth text-sm"
                                                            placeholder="32"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Facebook URL</label>
                                                    <input
                                                        type="text"
                                                        name="social_facebook"
                                                        value={settings.social_facebook || ''}
                                                        onChange={handleChange}
                                                        className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth"
                                                        placeholder="https://facebook.com/..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Instagram URL</label>
                                                    <input
                                                        type="text"
                                                        name="social_instagram"
                                                        value={settings.social_instagram || ''}
                                                        onChange={handleChange}
                                                        className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth"
                                                        placeholder="https://instagram.com/..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Datos de Contacto */}
                                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10 mt-8">
                                        <h2 className="text-xl font-serif text-earth font-bold mb-6 flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                            </svg>
                                            Datos de Contacto (Público)
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Dirección Física</label>
                                                <input
                                                    type="text"
                                                    name="contact_address"
                                                    value={settings.contact_address || ''}
                                                    onChange={handleChange}
                                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth"
                                                    placeholder="Av. Pellegrini 1234"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Ciudad / Provincia</label>
                                                <input
                                                    type="text"
                                                    name="contact_city"
                                                    value={settings.contact_city || ''}
                                                    onChange={handleChange}
                                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth"
                                                    placeholder="Rosario, Santa Fe"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Teléfono de Contacto</label>
                                                <input
                                                    type="text"
                                                    name="contact_phone"
                                                    value={settings.contact_phone || ''}
                                                    onChange={handleChange}
                                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth"
                                                    placeholder="+54 341 1234567"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Email Visible en Web</label>
                                                <input
                                                    type="text"
                                                    name="contact_email"
                                                    value={settings.contact_email || ''}
                                                    onChange={handleChange}
                                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth"
                                                    placeholder="contacto@ejemplo.com"
                                                />
                                                <p className="text-[10px] text-slate-400 mt-1">Si se deja vacío, se usará el configurado en Email (SMTP).</p>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Sección Decorativa (Home) */}
                                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
                                        <h2 className="text-xl font-serif text-earth font-bold mb-6 flex items-center gap-2">
                                            <span className="p-2 bg-earth/10 rounded-xl text-lg">✨</span>
                                            Cita / Sección Decorativa (Home)
                                        </h2>
                                        <div className="space-y-8">
                                            <div className="p-6 bg-paper/50 rounded-2xl border border-earth/10">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-6">
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Título de la Sección</label>
                                                        <input
                                                            type="text"
                                                            name="home_decorative_title"
                                                            value={settings.home_decorative_title || ''}
                                                            onChange={handleChange}
                                                            className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth font-serif font-bold text-lg"
                                                            placeholder='"El bienestar comienza con la intención"'
                                                        />
                                                    </div>
                                                    <ColorPicker
                                                        label="Color del Título"
                                                        name="home_decorative_title_color"
                                                        value={settings.home_decorative_title_color}
                                                        onChange={handleChange}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Texto Descriptivo</label>
                                                        <textarea
                                                            name="home_decorative_text"
                                                            value={settings.home_decorative_text || ''}
                                                            onChange={handleChange}
                                                            rows="3"
                                                            className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth italic"
                                                            placeholder="En nuestra tienda cada objeto ha sido seleccionado por su vibración..."
                                                        />
                                                    </div>
                                                    <ColorPicker
                                                        label="Color del Texto"
                                                        name="home_decorative_text_color"
                                                        value={settings.home_decorative_text_color}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </>
                            )}

                            {/* Legal Tab */}
                            {activeTab === 'legal' && (
                                <section className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
                                    <h2 className="text-xl font-serif text-earth font-bold mb-6 flex items-center gap-2">
                                        <span className="p-2 bg-earth/10 rounded-xl text-lg">⚖️</span>
                                        Textos Legales
                                    </h2>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                                Términos y Condiciones
                                            </label>
                                            <textarea
                                                name="terms_text"
                                                value={settings.terms_text || ''}
                                                onChange={handleChange}
                                                rows="10"
                                                className="w-full bg-white border border-beige-dark/20 rounded-xl p-4 focus:outline-none focus:border-earth text-sm text-slate-600 font-mono"
                                                placeholder="Escribe aquí los términos y condiciones..."
                                            />
                                            <p className="text-xs text-slate-400 mt-2">
                                                Se mostrará en /terminos
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                                Política de Privacidad
                                            </label>
                                            <textarea
                                                name="privacy_text"
                                                value={settings.privacy_text || ''}
                                                onChange={handleChange}
                                                rows="10"
                                                className="w-full bg-white border border-beige-dark/20 rounded-xl p-4 focus:outline-none focus:border-earth text-sm text-slate-600 font-mono"
                                                placeholder="Escribe aquí la política de privacidad..."
                                            />
                                            <p className="text-xs text-slate-400 mt-2">
                                                Se mostrará en /privacidad
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Pagos Tab */}
                            {
                                activeTab === 'pagos' && (
                                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
                                        <h2 className="text-xl font-serif text-earth font-bold mb-6 flex items-center gap-2">
                                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                            Datos para Transferencia
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Nombre del Banco</label>
                                                <input
                                                    type="text"
                                                    name="bank_name"
                                                    value={settings.bank_name || ''}
                                                    onChange={handleChange}
                                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                                    placeholder="Ej: Banco Galicia"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Titular de la Cuenta</label>
                                                <input
                                                    type="text"
                                                    name="bank_account_holder"
                                                    value={settings.bank_account_holder || ''}
                                                    onChange={handleChange}
                                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                                    placeholder="Nombre completo"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">CBU / CVU</label>
                                                <input
                                                    type="text"
                                                    name="bank_cbu"
                                                    value={settings.bank_cbu || ''}
                                                    onChange={handleChange}
                                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                                    placeholder="0000000000000000000000"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Alias</label>
                                                <input
                                                    type="text"
                                                    name="bank_alias"
                                                    value={settings.bank_alias || ''}
                                                    onChange={handleChange}
                                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                                    placeholder="mi.alias.tienda"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-12 pt-12 border-t border-beige-dark/10">
                                            <h2 className="text-xl font-serif text-earth font-bold mb-6 flex items-center gap-2">
                                                <span className="p-2 bg-green-100 rounded-xl text-lg">🚚</span>
                                                Costo de Envío
                                            </h2>
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            name="shipping_enabled"
                                                            checked={settings.shipping_enabled === 'true' || settings.shipping_enabled === true}
                                                            onChange={(e) => handleChange({ target: { name: 'shipping_enabled', value: e.target.checked.toString() } })}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-earth/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-earth"></div>
                                                        <span className="ml-3 text-sm font-medium text-slate-700">Habilitar cobro de envío a domicilio</span>
                                                    </label>
                                                </div>
                                                <div className={`transition-opacity duration-300 ${settings.shipping_enabled === 'true' || settings.shipping_enabled === true ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Costo Fijo de Envío ($)</label>
                                                    <input
                                                        type="number"
                                                        name="shipping_fixed_cost"
                                                        value={settings.shipping_fixed_cost || ''}
                                                        onChange={handleChange}
                                                        className="w-full md:w-1/2 bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                                        placeholder="Ej: 5000"
                                                        min="0"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-12 pt-12 border-t border-beige-dark/10">
                                            <h2 className="text-xl font-serif text-earth font-bold mb-6 flex items-center gap-2">
                                                <span className="p-2 bg-blue-100 rounded-xl text-lg">💳</span>
                                                Pasarela Mercado Pago
                                            </h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Access Token (Producción/Prueba)</label>
                                                    <input
                                                        type="password"
                                                        name="mercadopago_access_token"
                                                        value={settings.mercadopago_access_token || ''}
                                                        onChange={handleChange}
                                                        className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                                        placeholder="APP_USR-..."
                                                    />
                                                    <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-tight italic">
                                                        Tu token de acceso privado. No lo compartas con nadie.
                                                    </p>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Public Key</label>
                                                    <input
                                                        type="text"
                                                        name="mercadopago_public_key"
                                                        value={settings.mercadopago_public_key || ''}
                                                        onChange={handleChange}
                                                        className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                                        placeholder="APP_USR-..."
                                                    />
                                                    <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-tight italic">
                                                        Necesaria para inicializar los componentes de pago en el checkout.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                )
                            }
                            {/* Licencia Tab */}
                            {
                                activeTab === 'licencia' && (
                                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
                                        <h2 className="text-xl font-serif text-earth font-bold mb-6 flex items-center gap-2">
                                            <span className="p-2 bg-yellow-100 rounded-xl text-lg">🔑</span>
                                            Licencia de Producto
                                        </h2>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Clave de Activación (SaaS)</label>
                                                <input
                                                    type="text"
                                                    name="license_key"
                                                    value={settings.license_key || ''}
                                                    onChange={handleChange}
                                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all font-mono tracking-widest text-center text-lg"
                                                    placeholder="XXXX-XXXX-XXXX-XXXX"
                                                />
                                                <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-tight italic">
                                                    Ingresa tu clave para desbloquear módulos Premium como Clínica y Turnos.
                                                </p>
                                                {settings.license_key === 'CLINIC-PRO-2025' && (
                                                    <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-2">
                                                        <span>✅</span>
                                                        <span className="font-bold text-sm">Módulo Clínica ACTIVADO</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </section>
                                )
                            }


                            {/* Web Settings Tab */}
                            {
                                activeTab === 'cards' && (
                                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
                                        <h2 className="text-xl font-serif text-earth font-bold mb-6 flex items-center gap-2">
                                            <span className="p-2 bg-earth/10 rounded-xl text-lg">🌐</span>
                                            Visibilidad Web y Tarjetas
                                        </h2>

                                        <div className="space-y-8">
                                            <div className="p-6 bg-paper/50 rounded-2xl border border-beige-dark/10">
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6">Visibilidad de Secciones</h3>

                                                <div className="space-y-4">
                                                    {/* Force Maintenance Mode */}
                                                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                                                        <div>
                                                            <span className="block font-medium text-red-800">Modo Mantenimiento (Forzado)</span>
                                                            <span className="text-xs text-red-600">Si activas esto, el sitio mostrará la pantalla de "Próximamente" a todos (menos al Super Admin).</span>
                                                        </div>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                name="maintenance_mode_active"
                                                                checked={settings.maintenance_mode_active === 'true' || settings.maintenance_mode_active === true}
                                                                onChange={(e) => handleChange({ target: { name: 'maintenance_mode_active', value: e.target.checked.toString() } })}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                                        </label>
                                                    </div>

                                                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-beige-dark/10">
                                                        <span className="font-medium text-slate-700">🏠 Mostrar Página de Inicio</span>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                name="web_show_home"
                                                                checked={settings.web_show_home === 'true' || settings.web_show_home === true}
                                                                onChange={(e) => handleChange({ target: { name: 'web_show_home', value: e.target.checked.toString() } })}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-earth/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-earth"></div>
                                                        </label>
                                                    </div>

                                                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-beige-dark/10">
                                                        <span className="font-medium text-slate-700">👥 Mostrar "Nosotros"</span>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                name="web_show_about"
                                                                checked={settings.web_show_about === 'true' || settings.web_show_about === true}
                                                                onChange={(e) => handleChange({ target: { name: 'web_show_about', value: e.target.checked.toString() } })}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-earth/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-earth"></div>
                                                        </label>
                                                    </div>

                                                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-beige-dark/10">
                                                        <span className="font-medium text-slate-700">📞 Mostrar "Contacto"</span>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                name="web_show_contact"
                                                                checked={settings.web_show_contact === 'true' || settings.web_show_contact === true}
                                                                onChange={(e) => handleChange({ target: { name: 'web_show_contact', value: e.target.checked.toString() } })}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-earth/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-earth"></div>
                                                        </label>
                                                    </div>

                                                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-beige-dark/10">
                                                        <span className="font-medium text-slate-700">🛍️ Mostrar "Productos"</span>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                name="web_show_products"
                                                                checked={settings.web_show_products === 'true' || settings.web_show_products === true}
                                                                onChange={(e) => handleChange({ target: { name: 'web_show_products', value: e.target.checked.toString() } })}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-earth/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-earth"></div>
                                                        </label>
                                                    </div>

                                                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-beige-dark/10">
                                                        <span className="font-medium text-slate-700">🧘 Mostrar "Terapias"</span>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                name="web_show_therapies"
                                                                checked={settings.web_show_therapies === 'true' || settings.web_show_therapies === true}
                                                                onChange={(e) => handleChange({ target: { name: 'web_show_therapies', value: e.target.checked.toString() } })}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-earth/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-earth"></div>
                                                        </label>
                                                    </div>

                                                    <p className="text-xs text-slate-500 italic mt-2">
                                                        💡 Si desactivas "Inicio" (o todo), los visitantes verán una pantalla de "Sitio en Construcción".
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-paper/50 rounded-2xl border border-beige-dark/10">
                                                <div className="flex items-center justify-between mb-6">
                                                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Tarjetas Informativas (Home)</h3>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            name="home_cards_active"
                                                            checked={settings.home_cards_active === 'true' || settings.home_cards_active === true}
                                                            onChange={(e) => handleChange({ target: { name: 'home_cards_active', value: e.target.checked.toString() } })}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-earth/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-earth"></div>
                                                        <span className="ml-3 text-sm font-medium text-slate-700">Activar Sección</span>
                                                    </label>
                                                </div>

                                                <div className={`transition-opacity duration-300 ${settings.home_cards_active === 'true' || settings.home_cards_active === true ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mb-8">
                                                        <div>
                                                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Título de la Sección</label>
                                                            <input
                                                                type="text"
                                                                name="home_cards_title"
                                                                value={settings.home_cards_title || ''}
                                                                onChange={handleChange}
                                                                className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth font-serif font-bold text-lg"
                                                                placeholder="Nuestros Servicios"
                                                            />
                                                        </div>
                                                        <ColorPicker
                                                            label="Color del Título"
                                                            name="home_cards_title_color"
                                                            value={settings.home_cards_title_color}
                                                            onChange={handleChange}
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        {[1, 2, 3].map((num) => (
                                                            <div key={num} className="bg-white p-4 rounded-xl border border-beige-dark/10 shadow-sm relative">
                                                                <span className="absolute -top-3 -left-3 bg-earth text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">{num}</span>

                                                                <h3 className="font-bold text-earth mb-4 mt-2 text-center">Tarjeta {num}</h3>

                                                                <div className="space-y-4">
                                                                    <div>
                                                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Imagen / Icono</label>
                                                                        <div className="flex flex-col items-center gap-2">
                                                                            <div className="w-20 h-20 bg-paper rounded-lg border border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group">
                                                                                {(eval(`card${num}ImagePreview`) || settings[`home_card_${num}_image_url`]) ? (
                                                                                    <>
                                                                                        <img
                                                                                            src={eval(`card${num}ImagePreview`) || formatImageUrl(settings[`home_card_${num}_image_url`])}
                                                                                            alt={`Card ${num}`}
                                                                                            className="w-full h-full object-cover"
                                                                                        />
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleRemoveIcon(`card${num}`)}
                                                                                            className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                            title="Eliminar Imagen"
                                                                                        >
                                                                                            ✕
                                                                                        </button>
                                                                                    </>
                                                                                ) : (
                                                                                    <span className="text-2xl">{settings[`home_card_${num}_icon`] || '❓'}</span>
                                                                                )}
                                                                            </div>
                                                                            <input
                                                                                type="file"
                                                                                accept="image/*"
                                                                                onChange={(e) => handleFileChange(e, `card${num}`)}
                                                                                className="hidden"
                                                                                id={`file-card-${num}`}
                                                                            />
                                                                            <label htmlFor={`file-card-${num}`} className="text-xs text-earth hover:underline cursor-pointer">
                                                                                Subir Imagen
                                                                            </label>
                                                                        </div>
                                                                    </div>

                                                                    <div>
                                                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">O Icono Emoji</label>
                                                                        <input
                                                                            type="text"
                                                                            name={`home_card_${num}_icon`}
                                                                            value={settings[`home_card_${num}_icon`] || ''}
                                                                            onChange={handleChange}
                                                                            className="w-full bg-paper border border-beige-dark/20 rounded-lg p-2 focus:outline-none focus:border-earth text-center text-xl"
                                                                            placeholder="🌱"
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Título</label>
                                                                        <input
                                                                            type="text"
                                                                            name={`home_card_${num}_title`}
                                                                            value={settings[`home_card_${num}_title`] || ''}
                                                                            onChange={handleChange}
                                                                            className="w-full bg-paper border border-beige-dark/20 rounded-lg p-2 focus:outline-none focus:border-earth font-bold text-sm"
                                                                            placeholder="Título"
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Descripción</label>
                                                                        <textarea
                                                                            name={`home_card_${num}_desc`}
                                                                            value={settings[`home_card_${num}_desc`] || ''}
                                                                            onChange={handleChange}
                                                                            rows="3"
                                                                            className="w-full bg-paper border border-beige-dark/20 rounded-lg p-2 focus:outline-none focus:border-earth text-xs"
                                                                            placeholder="Descripción breve..."
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Enlace (Opcional)</label>
                                                                        <input
                                                                            type="text"
                                                                            name={`home_card_${num}_link`}
                                                                            value={settings[`home_card_${num}_link`] || ''}
                                                                            onChange={handleChange}
                                                                            className="w-full bg-paper border border-beige-dark/20 rounded-lg p-2 focus:outline-none focus:border-earth text-xs"
                                                                            placeholder="/ejemplo"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                )
                            }

                            {/* Agenda Tab */}
                            {
                                activeTab === 'agenda' && (
                                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
                                        <h2 className="text-xl font-serif text-earth font-bold mb-6 flex items-center gap-2">
                                            <span className="p-2 bg-slate-100 rounded-xl text-lg">📅</span>
                                            Configuración de Agenda
                                        </h2>
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Hora Inicio</label>
                                                    <input
                                                        type="time"
                                                        name="agenda_start_time" // Necesito agregar esto al state inicial si no existe
                                                        value={settings.agenda_start_time || '09:00'}
                                                        onChange={handleChange}
                                                        className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Hora Fin</label>
                                                    <input
                                                        type="time"
                                                        name="agenda_end_time"
                                                        value={settings.agenda_end_time || '18:00'}
                                                        onChange={handleChange}
                                                        className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Días Laborales</label>
                                                <div className="flex gap-4 flex-wrap">
                                                    {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map((d, i) => (
                                                        <label key={i} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-slate-50">
                                                            <input type="checkbox" className="accent-earth" checked={true} readOnly={true} /> {/* Placeholder: Implementar lógica de días reales */}
                                                            <span className="text-sm font-medium text-slate-700">{d}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                                <p className="text-[10px] text-slate-400 mt-2 italic">Por ahora se asume Lunes a Viernes.</p>
                                            </div>
                                        </div>
                                    </section>
                                )
                            }
                            {/* WhatsApp Tab */}
                            {
                                activeTab === 'whatsapp' && (
                                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
                                        <h2 className="text-xl font-serif text-earth font-bold mb-6 flex items-center gap-2">
                                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.827-1.213L3 20l1.391-3.952A8.076 8.076 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                            Coordinación por WhatsApp
                                        </h2>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Número de WhatsApp</label>
                                                <input
                                                    type="text"
                                                    name="whatsapp_number"
                                                    value={settings.whatsapp_number || ''}
                                                    onChange={handleChange}
                                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                                    placeholder="Ej: 5491123456789 (Sin símbolos ni espacios)"
                                                />
                                                <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-tight italic">
                                                    Importante: Incluye código de país y área (ej: 54 9 11...).
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Mensaje Sugerido</label>
                                                <textarea
                                                    name="whatsapp_message"
                                                    value={settings.whatsapp_message || ''}
                                                    onChange={handleChange}
                                                    rows="3"
                                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                                    placeholder="Hola, acabo de realizar un pedido..."
                                                />
                                            </div>
                                        </div>
                                    </section>
                                )
                            }

                            {/* Personalización de Colores */}
                            {/* Estilo Tab */}
                            {
                                activeTab === 'estilo' && (
                                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
                                        <h2 className="text-xl font-serif text-earth font-bold mb-6 flex items-center gap-2">
                                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                                            Personalización de Colores
                                        </h2>

                                        <div className="space-y-8">
                                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                                <p className="text-sm text-blue-800">
                                                    <strong>💡 Tip:</strong> Personaliza los colores de tu tienda para que coincidan con tu marca. Los cambios se aplicarán automáticamente en todo el sitio.
                                                </p>
                                            </div>

                                            <div className="p-6 bg-paper/50 rounded-2xl border border-beige-dark/10">
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700 mb-6">Colores Principales</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <ColorPicker
                                                        label="Color Primario"
                                                        name="theme_primary_color"
                                                        value={settings.theme_primary_color}
                                                        onChange={handleChange}
                                                        description="Usado en botones principales, enlaces y elementos destacados"
                                                    />
                                                    <ColorPicker
                                                        label="Color Secundario"
                                                        name="theme_secondary_color"
                                                        value={settings.theme_secondary_color}
                                                        onChange={handleChange}
                                                        description="Usado en acentos, badges y elementos decorativos"
                                                    />
                                                </div>
                                            </div>

                                            <div className="p-6 bg-paper/50 rounded-2xl border border-beige-dark/10">
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700 mb-6">Colores de Fondo</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <ColorPicker
                                                        label="Fondo Principal"
                                                        name="theme_background_color"
                                                        value={settings.theme_background_color}
                                                        onChange={handleChange}
                                                        description="Color de fondo general del sitio"
                                                    />
                                                    <ColorPicker
                                                        label="Fondo Secundario"
                                                        name="theme_background_secondary"
                                                        value={settings.theme_background_secondary}
                                                        onChange={handleChange}
                                                        description="Usado en tarjetas, secciones y áreas destacadas"
                                                    />
                                                </div>
                                            </div>

                                            <div className="p-6 bg-paper/50 rounded-2xl border border-beige-dark/10">
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700 mb-6">Colores de Texto</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <ColorPicker
                                                        label="Texto Principal"
                                                        name="theme_text_primary"
                                                        value={settings.theme_text_primary}
                                                        onChange={handleChange}
                                                        description="Color del texto principal y títulos"
                                                    />
                                                    <ColorPicker
                                                        label="Texto Secundario"
                                                        name="theme_text_secondary"
                                                        value={settings.theme_text_secondary}
                                                        onChange={handleChange}
                                                        description="Color de texto secundario y descripciones"
                                                    />
                                                </div>
                                            </div>

                                            <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700 mb-6">Vista Previa</h3>
                                                <div
                                                    className="p-8 rounded-xl border-2"
                                                    style={{
                                                        backgroundColor: settings.theme_background_color,
                                                        borderColor: settings.theme_primary_color + '40'
                                                    }}
                                                >
                                                    <h4
                                                        className="text-2xl font-serif font-bold mb-3"
                                                        style={{ color: settings.theme_text_primary }}
                                                    >
                                                        Ejemplo de Título
                                                    </h4>
                                                    <p
                                                        className="text-sm mb-6"
                                                        style={{ color: settings.theme_text_secondary }}
                                                    >
                                                        Este es un ejemplo de cómo se verá el texto secundario en tu tienda con los colores seleccionados.
                                                    </p>
                                                    <div className="flex gap-4 flex-wrap">
                                                        <button
                                                            type="button"
                                                            className="px-6 py-3 rounded-full font-bold text-white shadow-lg transition-transform hover:scale-105"
                                                            style={{ backgroundColor: settings.theme_primary_color }}
                                                        >
                                                            Botón Primario
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="px-6 py-3 rounded-full font-bold text-white shadow-lg transition-transform hover:scale-105"
                                                            style={{ backgroundColor: settings.theme_secondary_color }}
                                                        >
                                                            Botón Secundario
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl">
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-amber-900 mb-4">Paletas Predefinidas</h3>
                                                <p className="text-xs text-amber-700 mb-4">Haz clic en una paleta para aplicarla instantáneamente:</p>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSettings(prev => ({
                                                            ...prev,
                                                            theme_primary_color: '#D4A5A5',
                                                            theme_secondary_color: '#C9A961',
                                                            theme_background_color: '#FFFBF5',
                                                            theme_background_secondary: '#F7E7CE',
                                                            theme_text_primary: '#1e293b',
                                                            theme_text_secondary: '#64748b'
                                                        }))}
                                                        className="p-4 bg-white rounded-xl border-2 border-beige-dark/20 hover:border-earth hover:shadow-lg transition-all text-left"
                                                    >
                                                        <div className="flex gap-2 mb-2">
                                                            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#D4A5A5' }}></div>
                                                            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#C9A961' }}></div>
                                                            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#FFFBF5' }}></div>
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-700">Perfumería Elegante</p>
                                                        <p className="text-[10px] text-slate-500">Rosa · Champagne · Oro</p>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setSettings(prev => ({
                                                            ...prev,
                                                            theme_primary_color: '#3b82f6',
                                                            theme_secondary_color: '#8b5cf6',
                                                            theme_background_color: '#f8fafc',
                                                            theme_background_secondary: '#e0e7ff',
                                                            theme_text_primary: '#1e293b',
                                                            theme_text_secondary: '#64748b'
                                                        }))}
                                                        className="p-4 bg-white rounded-xl border-2 border-beige-dark/20 hover:border-earth hover:shadow-lg transition-all text-left"
                                                    >
                                                        <div className="flex gap-2 mb-2">
                                                            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
                                                            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#8b5cf6' }}></div>
                                                            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#f8fafc' }}></div>
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-700">Moderno Tecnológico</p>
                                                        <p className="text-[10px] text-slate-500">Azul · Púrpura · Gris Claro</p>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setSettings(prev => ({
                                                            ...prev,
                                                            theme_primary_color: '#10b981',
                                                            theme_secondary_color: '#059669',
                                                            theme_background_color: '#f0fdf4',
                                                            theme_background_secondary: '#d1fae5',
                                                            theme_text_primary: '#1e293b',
                                                            theme_text_secondary: '#64748b'
                                                        }))}
                                                        className="p-4 bg-white rounded-xl border-2 border-beige-dark/20 hover:border-earth hover:shadow-lg transition-all text-left"
                                                    >
                                                        <div className="flex gap-2 mb-2">
                                                            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
                                                            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#059669' }}></div>
                                                            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#f0fdf4' }}></div>
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-700">Natural Orgánico</p>
                                                        <p className="text-[10px] text-slate-500">Verde · Esmeralda · Menta</p>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                )
                            }

                            {/* Email Tab */}
                            {
                                activeTab === 'email' && (
                                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
                                        <h2 className="text-xl font-serif text-earth font-bold mb-6 flex items-center gap-2">
                                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            Configuración de Email (SMTP)
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Host SMTP</label>
                                                <input
                                                    type="text"
                                                    name="email_host"
                                                    value={settings.email_host || ''}
                                                    onChange={handleChange}
                                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                                    placeholder="Ej: smtp.gmail.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Puerto SMTP</label>
                                                <input
                                                    type="number"
                                                    name="email_port"
                                                    value={settings.email_port || ''}
                                                    onChange={handleChange}
                                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                                    placeholder="Ej: 587"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Usuario / Email</label>
                                                <input
                                                    type="text"
                                                    name="email_user"
                                                    value={settings.email_user || ''}
                                                    onChange={handleChange}
                                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                                    placeholder="tu@email.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Contraseña / App Password</label>
                                                <input
                                                    type="password"
                                                    name="email_password"
                                                    value={settings.email_password || ''}
                                                    onChange={handleChange}
                                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Nombre del Remitente</label>
                                                <input
                                                    type="text"
                                                    name="email_from_name"
                                                    value={settings.email_from_name || ''}
                                                    onChange={handleChange}
                                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                                    placeholder="Ej: Tienda Holística"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Email para Contacto Web</label>
                                                <input
                                                    type="text"
                                                    name="contact_email"
                                                    value={settings.contact_email || ''}
                                                    onChange={handleChange}
                                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                                    placeholder="Ej: contacto@tutienda.com"
                                                />
                                                <p className="text-[10px] text-slate-400 mt-2 italic">A este correo llegarán los mensajes del formulario de contacto.</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Seguridad SSL/TLS</label>
                                                <select
                                                    name="email_secure"
                                                    value={settings.email_secure || 'false'}
                                                    onChange={handleChange}
                                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                                >
                                                    <option value="false">STARTTLS (Puerto 587 - Recomendado)</option>
                                                    <option value="true">SSL/TLS (Puerto 465)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-12 border-t border-beige-dark/10">
                                            <div className="col-span-full">
                                                <h3 className="text-lg font-serif text-earth font-bold mb-2">Identidad Visual y Mensajes</h3>
                                                <p className="text-sm text-slate-500 mb-6">Personaliza la apariencia y el tono de los correos que reciben tus clientes.</p>
                                            </div>

                                            <div className="space-y-6">
                                                <ColorPicker
                                                    label="Color de Acento (Botones y Detalles)"
                                                    name="email_accent_color"
                                                    value={settings.email_accent_color || '#8A9A5B'}
                                                    onChange={handleChange}
                                                />

                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Texto del Pie de Página (Footer)</label>
                                                    <input
                                                        type="text"
                                                        name="email_footer_text"
                                                        value={settings.email_footer_text || ''}
                                                        onChange={handleChange}
                                                        className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all text-sm"
                                                        placeholder="Ej: Conecta con tu esencia natural"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Frase de Cierre / Bendición</label>
                                                <textarea
                                                    name="email_closing_phrase"
                                                    value={settings.email_closing_phrase || ''}
                                                    onChange={handleChange}
                                                    rows="5"
                                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all text-sm h-[132px]"
                                                    placeholder="Ej: Gracias por confiar en nosotros para tu camino de bienestar..."
                                                ></textarea>
                                                <p className="text-[10px] text-slate-400 mt-2 italic">Aparecerá al final de cada correo entre comillas.</p>
                                            </div>
                                        </div>
                                    </section>
                                )
                            }

                            {/* Hero Tab */}
                            {
                                activeTab === 'hero' && (
                                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
                                        <h2 className="text-xl font-serif text-earth font-bold mb-6 flex items-center gap-2">
                                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            Diseño de Portada (Hero de Inicio)
                                        </h2>
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Tagline (Texto Superior)</label>
                                                    <input
                                                        type="text"
                                                        name="hero_tagline"
                                                        value={settings.hero_tagline || ''}
                                                        onChange={handleChange}
                                                        className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                                        placeholder="Ej: Bienvenido a tu Espacio Sagrado"
                                                    />
                                                </div>
                                                <ColorPicker
                                                    label="Color del Tagline"
                                                    name="hero_tagline_color"
                                                    value={settings.hero_tagline_color}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Título Principal</label>
                                                    <input
                                                        type="text"
                                                        name="hero_title"
                                                        value={settings.hero_title || ''}
                                                        onChange={handleChange}
                                                        className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                                        placeholder="Ej: Conecta con tu esencia..."
                                                    />
                                                </div>
                                                <ColorPicker
                                                    label="Color del Título"
                                                    name="hero_title_color"
                                                    value={settings.hero_title_color}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Subtítulo / Descripción</label>
                                                    <textarea
                                                        name="hero_subtitle"
                                                        value={settings.hero_subtitle || ''}
                                                        onChange={handleChange}
                                                        rows="2"
                                                        className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                                        placeholder="Descripción breve debajo del título"
                                                    />
                                                </div>
                                                <ColorPicker
                                                    label="Color del Subtítulo"
                                                    name="hero_subtitle_color"
                                                    value={settings.hero_subtitle_color}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="p-6 bg-paper/50 rounded-2xl border border-beige-dark/10">
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Fondo de Portada</label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 mb-2 uppercase font-bold">Subir Imagen Local</p>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleFileChange(e, 'hero')}
                                                            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-earth/10 file:text-earth hover:file:bg-earth/20 cursor-pointer"
                                                        />
                                                        <div className="mt-4">
                                                            <p className="text-[10px] text-slate-400 mb-2 uppercase font-bold">O usar URL externa</p>
                                                            <input
                                                                type="text"
                                                                name="hero_image_url"
                                                                value={settings.hero_image_url || ''}
                                                                onChange={handleChange}
                                                                className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 text-sm focus:outline-none focus:border-earth"
                                                                placeholder="https://..."
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 mb-2 uppercase font-bold">Vista Previa</p>
                                                        <div className="h-32 rounded-xl overflow-hidden border border-beige-dark/10 bg-white">
                                                            {(heroImagePreview || settings.hero_image_url) ? (
                                                                <img
                                                                    src={heroImagePreview || formatImageUrl(settings.hero_image_url)}
                                                                    alt="Hero Preview"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs italic">Sin imagen</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                {/* Botón 1 */}
                                                <div className="p-6 bg-earth/5 rounded-2xl border border-earth/10">
                                                    <p className="text-[10px] font-bold text-earth uppercase tracking-widest mb-4">Botón Principal</p>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Texto</label>
                                                            <input
                                                                type="text"
                                                                name="hero_cta_text"
                                                                value={settings.hero_cta_text || ''}
                                                                onChange={handleChange}
                                                                className="w-full bg-white border border-beige-dark/20 rounded-lg p-2 text-sm focus:outline-none focus:border-earth"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Enlace</label>
                                                            <input
                                                                type="text"
                                                                name="hero_cta1_link"
                                                                value={settings.hero_cta1_link || ''}
                                                                onChange={handleChange}
                                                                className="w-full bg-white border border-beige-dark/20 rounded-lg p-2 text-sm focus:outline-none focus:border-earth"
                                                                placeholder="/productos"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Botón 2 */}
                                                <div className="p-6 bg-paper/50 rounded-2xl border border-beige-dark/10">
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Botón Secundario</p>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Texto (Opcional)</label>
                                                            <input
                                                                type="text"
                                                                name="hero_cta2_text"
                                                                value={settings.hero_cta2_text || ''}
                                                                onChange={handleChange}
                                                                className="w-full bg-white border border-beige-dark/20 rounded-lg p-2 text-sm focus:outline-none focus:border-earth"
                                                                placeholder="Ej: Sobre Nosotros"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Enlace</label>
                                                            <input
                                                                type="text"
                                                                name="hero_cta2_link"
                                                                value={settings.hero_cta2_link || ''}
                                                                onChange={handleChange}
                                                                className="w-full bg-white border border-beige-dark/20 rounded-lg p-2 text-sm focus:outline-none focus:border-earth"
                                                                placeholder="/nosotros"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                )
                            }

                            {/* Nosotros Tab */}
                            {
                                activeTab === 'nosotros' && (
                                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
                                        <h2 className="text-xl font-serif text-earth font-bold mb-6 flex items-center gap-2">
                                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            Página "Nosotros"
                                        </h2>
                                        <div className="space-y-8">
                                            {/* Hero de Nosotros */}
                                            <div className="p-6 bg-paper/50 rounded-2xl border border-beige-dark/10">
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Cabecera de la Página</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Tagline (Ej: Nuestra Esencia)</label>
                                                        <input
                                                            type="text"
                                                            name="about_hero_tagline"
                                                            value={settings.about_hero_tagline || ''}
                                                            onChange={handleChange}
                                                            className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth"
                                                        />
                                                    </div>
                                                    <ColorPicker
                                                        label="Color del Tagline"
                                                        name="about_hero_tagline_color"
                                                        value={settings.about_hero_tagline_color}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mt-6">
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Título Principal</label>
                                                        <input
                                                            type="text"
                                                            name="about_hero_title"
                                                            value={settings.about_hero_title || ''}
                                                            onChange={handleChange}
                                                            className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth"
                                                        />
                                                    </div>
                                                    <ColorPicker
                                                        label="Color del Título"
                                                        name="about_hero_title_color"
                                                        value={settings.about_hero_title_color}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </div>

                                            {/* Misión e Imagen */}
                                            <div className="p-6 bg-paper/50 rounded-2xl border border-beige-dark/10">
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Sección Misión / Historia</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                                    <div className="space-y-6">
                                                        <div className="grid grid-cols-1 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Título</label>
                                                                <input
                                                                    type="text"
                                                                    name="about_mission_title"
                                                                    value={settings.about_mission_title || ''}
                                                                    onChange={handleChange}
                                                                    className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth font-bold"
                                                                />
                                                            </div>
                                                            <ColorPicker
                                                                label="Color del Título"
                                                                name="about_mission_title_color"
                                                                value={settings.about_mission_title_color}
                                                                onChange={handleChange}
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Texto / Historia</label>
                                                                <textarea
                                                                    name="about_mission_text"
                                                                    value={settings.about_mission_text || ''}
                                                                    onChange={handleChange}
                                                                    rows="5"
                                                                    className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth text-sm"
                                                                />
                                                            </div>
                                                            <ColorPicker
                                                                label="Color del Texto"
                                                                name="about_mission_text_color"
                                                                value={settings.about_mission_text_color}
                                                                onChange={handleChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Imagen de la Sección</label>
                                                        <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-beige-dark/10 bg-white mb-4">
                                                            {(aboutImagePreview || settings.about_mission_image_url) ? (
                                                                <img
                                                                    src={aboutImagePreview || formatImageUrl(settings.about_mission_image_url)}
                                                                    alt="Mission Preview"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs italic">Sin imagen</div>
                                                            )}
                                                        </div>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleFileChange(e, 'about')}
                                                            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-earth/10 file:text-earth hover:file:bg-earth/20 cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Propósitos y Pureza */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="p-6 bg-earth/5 rounded-2xl border border-earth/10">
                                                    <h3 className="text-[10px] font-bold text-earth uppercase tracking-widest mb-4">Bloque secundario 1 (Propósito)</h3>
                                                    <div className="space-y-4">
                                                        <input
                                                            type="text"
                                                            name="about_prop_1_title"
                                                            value={settings.about_prop_1_title || ''}
                                                            onChange={handleChange}
                                                            className="w-full bg-white border border-beige-dark/20 rounded-lg p-2 text-xs font-bold focus:outline-none focus:border-earth uppercase tracking-widest"
                                                            placeholder="Ej: Propósito"
                                                        />
                                                        <textarea
                                                            name="about_prop_1_text"
                                                            value={settings.about_prop_1_text || ''}
                                                            onChange={handleChange}
                                                            rows="2"
                                                            className="w-full bg-white border border-beige-dark/20 rounded-lg p-2 text-xs focus:outline-none focus:border-earth"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="p-6 bg-earth/5 rounded-2xl border border-earth/10">
                                                    <h3 className="text-[10px] font-bold text-earth uppercase tracking-widest mb-4">Bloque secundario 2 (Pureza)</h3>
                                                    <div className="space-y-4">
                                                        <input
                                                            type="text"
                                                            name="about_prop_2_title"
                                                            value={settings.about_prop_2_title || ''}
                                                            onChange={handleChange}
                                                            className="w-full bg-white border border-beige-dark/20 rounded-lg p-2 text-xs font-bold focus:outline-none focus:border-earth uppercase tracking-widest"
                                                            placeholder="Ej: Pureza"
                                                        />
                                                        <textarea
                                                            name="about_prop_2_text"
                                                            value={settings.about_prop_2_text || ''}
                                                            onChange={handleChange}
                                                            rows="2"
                                                            className="w-full bg-white border border-beige-dark/20 rounded-lg p-2 text-xs focus:outline-none focus:border-earth"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Pilares */}
                                            <div className="p-6 bg-paper/50 rounded-2xl border border-beige-dark/10">
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Sección Pilares / Valores</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 items-start">
                                                    <div className="space-y-6">
                                                        <div>
                                                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Título de la sección</label>
                                                            <input
                                                                type="text"
                                                                name="about_values_title"
                                                                value={settings.about_values_title || ''}
                                                                onChange={handleChange}
                                                                className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth font-bold"
                                                                placeholder="Título de la sección"
                                                            />
                                                        </div>
                                                        <ColorPicker
                                                            label="Color del Título"
                                                            name="about_values_title_color"
                                                            value={settings.about_values_title_color}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    <div className="space-y-6">
                                                        <div>
                                                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Frase / Subtítulo</label>
                                                            <input
                                                                type="text"
                                                                name="about_values_subtitle"
                                                                value={settings.about_values_subtitle || ''}
                                                                onChange={handleChange}
                                                                className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth italic text-sm"
                                                                placeholder="Frase / Subtítulo"
                                                            />
                                                        </div>
                                                        <ColorPicker
                                                            label="Color del Subtítulo"
                                                            name="about_values_subtitle_color"
                                                            value={settings.about_values_subtitle_color}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    {/* Pilar 1 */}
                                                    <div className="p-4 bg-white rounded-xl border border-beige-dark/10">
                                                        <div className="flex flex-col gap-4">
                                                            <div>
                                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Icono (Emoji)</label>
                                                                <input
                                                                    type="text"
                                                                    name="about_value_1_title"
                                                                    value={settings.about_value_1_title || ''}
                                                                    onChange={handleChange}
                                                                    className="w-full text-xs font-bold text-slate-700 bg-slate-50 rounded p-1 mb-2"
                                                                    placeholder="Título 1"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    name="about_value_1_icon"
                                                                    value={settings.about_value_1_icon || ''}
                                                                    onChange={handleChange}
                                                                    className="w-full text-center text-2xl bg-slate-50 rounded p-2"
                                                                    placeholder="🌱"
                                                                />
                                                            </div>
                                                            <div className="border-t border-slate-100 pt-4">
                                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">O Imagen / SVG</label>
                                                                {(v1ImagePreview || settings.about_value_1_image_url) ? (
                                                                    <div className="relative group w-16 h-16 mx-auto">
                                                                        <img
                                                                            src={v1ImagePreview || formatImageUrl(settings.about_value_1_image_url)}
                                                                            className="w-full h-full object-contain rounded-lg border border-beige"
                                                                            alt="Preview"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveIcon('v1')}
                                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        >
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*,.svg"
                                                                        onChange={(e) => handleFileChange(e, 'v1')}
                                                                        className="text-[10px] w-full"
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <textarea
                                                            name="about_value_1_text"
                                                            value={settings.about_value_1_text || ''}
                                                            onChange={handleChange}
                                                            rows="3"
                                                            className="w-full text-xs text-slate-500 focus:outline-none bg-slate-50 rounded p-1"
                                                            placeholder="Descripción 1"
                                                        />
                                                    </div>
                                                    {/* Pilar 2 */}
                                                    <div className="p-4 bg-white rounded-xl border border-beige-dark/10">
                                                        <div className="flex flex-col gap-4">
                                                            <div>
                                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Icono (Emoji)</label>
                                                                <input
                                                                    type="text"
                                                                    name="about_value_2_title"
                                                                    value={settings.about_value_2_title || ''}
                                                                    onChange={handleChange}
                                                                    className="w-full text-xs font-bold text-slate-700 bg-slate-50 rounded p-1 mb-2"
                                                                    placeholder="Título 2"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    name="about_value_2_icon"
                                                                    value={settings.about_value_2_icon || ''}
                                                                    onChange={handleChange}
                                                                    className="w-full text-center text-2xl bg-slate-50 rounded p-2"
                                                                    placeholder="✨"
                                                                />
                                                            </div>
                                                            <div className="border-t border-slate-100 pt-4">
                                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">O Imagen / SVG</label>
                                                                {(v2ImagePreview || settings.about_value_2_image_url) ? (
                                                                    <div className="relative group w-16 h-16 mx-auto">
                                                                        <img
                                                                            src={v2ImagePreview || formatImageUrl(settings.about_value_2_image_url)}
                                                                            className="w-full h-full object-contain rounded-lg border border-beige"
                                                                            alt="Preview"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveIcon('v2')}
                                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        >
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*,.svg"
                                                                        onChange={(e) => handleFileChange(e, 'v2')}
                                                                        className="text-[10px] w-full"
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <textarea
                                                            name="about_value_2_text"
                                                            value={settings.about_value_2_text || ''}
                                                            onChange={handleChange}
                                                            rows="3"
                                                            className="w-full text-xs text-slate-500 focus:outline-none bg-slate-50 rounded p-1"
                                                            placeholder="Descripción 2"
                                                        />
                                                    </div>
                                                    {/* Pilar 3 */}
                                                    <div className="p-4 bg-white rounded-xl border border-beige-dark/10">
                                                        <div className="flex flex-col gap-4">
                                                            <div>
                                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Icono (Emoji)</label>
                                                                <input
                                                                    type="text"
                                                                    name="about_value_3_title"
                                                                    value={settings.about_value_3_title || ''}
                                                                    onChange={handleChange}
                                                                    className="w-full text-xs font-bold text-slate-700 bg-slate-50 rounded p-1 mb-2"
                                                                    placeholder="Título 3"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    name="about_value_3_icon"
                                                                    value={settings.about_value_3_icon || ''}
                                                                    onChange={handleChange}
                                                                    className="w-full text-center text-2xl bg-slate-50 rounded p-2"
                                                                    placeholder="🧘"
                                                                />
                                                            </div>
                                                            <div className="border-t border-slate-100 pt-4">
                                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">O Imagen / SVG</label>
                                                                {(v3ImagePreview || settings.about_value_3_image_url) ? (
                                                                    <div className="relative group w-16 h-16 mx-auto">
                                                                        <img
                                                                            src={v3ImagePreview || formatImageUrl(settings.about_value_3_image_url)}
                                                                            className="w-full h-full object-contain rounded-lg border border-beige"
                                                                            alt="Preview"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveIcon('v3')}
                                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        >
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*,.svg"
                                                                        onChange={(e) => handleFileChange(e, 'v3')}
                                                                        className="text-[10px] w-full"
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <textarea
                                                            name="about_value_3_text"
                                                            value={settings.about_value_3_text || ''}
                                                            onChange={handleChange}
                                                            rows="3"
                                                            className="w-full text-xs text-slate-500 focus:outline-none bg-slate-50 rounded p-1"
                                                            placeholder="Descripción 3"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CTA Final */}
                                            <div className="p-6 bg-earth/5 rounded-2xl border border-earth/10">
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-earth mb-4">Llamado a la Acción (Final)</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                                    <div className="space-y-6">
                                                        <div>
                                                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Título del CTA</label>
                                                            <input
                                                                type="text"
                                                                name="about_cta_title"
                                                                value={settings.about_cta_title || ''}
                                                                onChange={handleChange}
                                                                className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth font-bold"
                                                            />
                                                        </div>
                                                        <ColorPicker
                                                            label="Color del Título"
                                                            name="about_cta_title_color"
                                                            value={settings.about_cta_title_color}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    <div className="space-y-6">
                                                        <div className="grid grid-cols-1 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Texto del Botón</label>
                                                                <input
                                                                    type="text"
                                                                    name="about_cta_button_text"
                                                                    value={settings.about_cta_button_text || ''}
                                                                    onChange={handleChange}
                                                                    className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Enlace del Botón</label>
                                                                <input
                                                                    type="text"
                                                                    name="about_cta_button_link"
                                                                    value={settings.about_cta_button_link || ''}
                                                                    onChange={handleChange}
                                                                    className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                )
                            }

                            {/* Productos Tab */}
                            {
                                activeTab === 'productos' && (
                                    <section className="bg-white rounded-3xl shadow-sm border border-beige-dark/10 overflow-hidden mb-8">
                                        <div className="p-8 border-b border-beige-dark/10 bg-paper/30">
                                            <h2 className="text-xl font-serif text-earth flex items-center gap-3">
                                                <span className="p-2 bg-earth/10 rounded-xl text-lg">🛍️</span>
                                                Colección de Productos
                                            </h2>
                                            <p className="text-slate-500 text-sm mt-1 italic">Personaliza la apariencia del catálogo cuando no hay resultados.</p>
                                        </div>

                                        <div className="p-8 space-y-8">
                                            {/* Títulos de la Colección */}
                                            <div className="p-6 bg-paper/50 rounded-2xl border border-beige-dark/10">
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Cabecera del Catálogo</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Título de la Colección</label>
                                                        <input
                                                            type="text"
                                                            name="products_title"
                                                            value={settings.products_title || ''}
                                                            onChange={handleChange}
                                                            className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth font-serif font-bold"
                                                            placeholder="Nuestra Colección"
                                                        />
                                                    </div>
                                                    <ColorPicker
                                                        label="Color del Título"
                                                        name="products_title_color"
                                                        value={settings.products_title_color}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mt-6">
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Subtítulo / Frase</label>
                                                        <input
                                                            type="text"
                                                            name="products_subtitle"
                                                            value={settings.products_subtitle || ''}
                                                            onChange={handleChange}
                                                            className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth italic text-sm"
                                                            placeholder="Cada objeto sagrado ha sido cuidadosamente seleccionado..."
                                                        />
                                                    </div>
                                                    <ColorPicker
                                                        label="Color del Subtítulo"
                                                        name="products_subtitle_color"
                                                        value={settings.products_subtitle_color}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </div>

                                            <div className="p-6 bg-paper/50 rounded-2xl border border-beige-dark/10">
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Página de Detalle de Producto</h3>
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                    <div className="space-y-6">
                                                        <ColorPicker
                                                            label="Color del Título"
                                                            name="products_detail_title_color"
                                                            value={settings.products_detail_title_color}
                                                            onChange={handleChange}
                                                        />
                                                        <ColorPicker
                                                            label="Color del Precio"
                                                            name="products_detail_price_color"
                                                            value={settings.products_detail_price_color}
                                                            onChange={handleChange}
                                                        />
                                                        <ColorPicker
                                                            label="Color de Etiqueta Stock"
                                                            name="products_detail_stock_color"
                                                            value={settings.products_detail_stock_color}
                                                            onChange={handleChange}
                                                        />
                                                        <ColorPicker
                                                            label="Color de la Descripción"
                                                            name="products_detail_description_color"
                                                            value={settings.products_detail_description_color}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    <div className="space-y-6">
                                                        <div className="p-4 bg-white rounded-xl border border-beige-dark/10 space-y-4">
                                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Botón de Compra</h4>
                                                            <div className="grid grid-cols-1 gap-6">
                                                                <ColorPicker
                                                                    label="Fondo"
                                                                    name="products_detail_button_bg_color"
                                                                    value={settings.products_detail_button_bg_color}
                                                                    onChange={handleChange}
                                                                />
                                                                <ColorPicker
                                                                    label="Texto"
                                                                    name="products_detail_button_text_color"
                                                                    value={settings.products_detail_button_text_color}
                                                                    onChange={handleChange}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="p-4 bg-white rounded-xl border border-beige-dark/10 space-y-4">
                                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tarjetas de Atributos</h4>
                                                            <div className="grid grid-cols-1 gap-6">
                                                                <ColorPicker
                                                                    label="Fondo"
                                                                    name="products_detail_badge_bg_color"
                                                                    value={settings.products_detail_badge_bg_color}
                                                                    onChange={handleChange}
                                                                />
                                                                <ColorPicker
                                                                    label="Texto"
                                                                    name="products_detail_badge_text_color"
                                                                    value={settings.products_detail_badge_text_color}
                                                                    onChange={handleChange}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tarjetas de Atributos Personalizables */}
                                            <div className="p-6 bg-paper/50 rounded-2xl border border-beige-dark/10">
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Tarjetas de Atributos Personalizables (Dúo)</h3>
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                    {/* Atributo 1 */}
                                                    <div className="p-6 bg-white rounded-2xl border border-beige-dark/10 space-y-6">
                                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-earth">Atributo Izquierdo</h4>
                                                        <div>
                                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Texto del Atributo</label>
                                                            <input
                                                                type="text"
                                                                name="products_detail_attr1_text"
                                                                value={settings.products_detail_attr1_text || ''}
                                                                onChange={handleChange}
                                                                className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth text-sm"
                                                                placeholder="Ej: 100% Natural"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Icono (Emoji)</label>
                                                                <input
                                                                    type="text"
                                                                    name="products_detail_attr1_icon"
                                                                    value={settings.products_detail_attr1_icon || ''}
                                                                    onChange={handleChange}
                                                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth text-center text-xl"
                                                                    placeholder="🌿"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">O Imagen / SVG</label>
                                                                <div className="flex flex-col items-center justify-center p-4 rounded-3xl border border-beige-dark/20 h-[100px] gap-2"
                                                                    style={{
                                                                        backgroundColor: settings.products_detail_badge_bg_color || '#FDFCF8',
                                                                        color: settings.products_detail_badge_text_color || '#8A9A5B'
                                                                    }}
                                                                >
                                                                    {(attr1ImagePreview || (settings.products_detail_attr1_image_url && settings.products_detail_attr1_image_url !== '')) ? (
                                                                        <div className="relative group flex items-center justify-center h-10 w-full">
                                                                            <img
                                                                                src={attr1ImagePreview || formatImageUrl(settings.products_detail_attr1_image_url)}
                                                                                className="h-full object-contain"
                                                                                alt="Preview"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleRemoveIcon('attr1')}
                                                                                className="absolute -top-6 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                                                                                title="Eliminar Imagen"
                                                                            >
                                                                                <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex flex-col items-center gap-2">
                                                                            <div className="text-2xl">{settings.products_detail_attr1_icon || '🌿'}</div>
                                                                            <input
                                                                                type="file"
                                                                                accept="image/*,.svg"
                                                                                onChange={(e) => handleFileChange(e, 'attr1')}
                                                                                className="text-[10px] w-full"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    <span className="text-[8px] font-bold uppercase tracking-widest">{settings.products_detail_attr1_text || 'Vista Previa'}</span>
                                                                </div>
                                                                <p className="text-[10px] text-slate-400 mt-2 italic">Si subes imagen, el emoji se ignorará.</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Atributo 2 */}
                                                    <div className="p-6 bg-white rounded-2xl border border-beige-dark/10 space-y-6">
                                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-earth">Atributo Derecho</h4>
                                                        <div>
                                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Texto del Atributo</label>
                                                            <input
                                                                type="text"
                                                                name="products_detail_attr2_text"
                                                                value={settings.products_detail_attr2_text || ''}
                                                                onChange={handleChange}
                                                                className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth text-sm"
                                                                placeholder="Ej: Artesanal"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Icono (Emoji)</label>
                                                                <input
                                                                    type="text"
                                                                    name="products_detail_attr2_icon"
                                                                    value={settings.products_detail_attr2_icon || ''}
                                                                    onChange={handleChange}
                                                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth text-center text-xl"
                                                                    placeholder="✨"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">O Imagen / SVG</label>
                                                                <div className="flex flex-col items-center justify-center p-4 rounded-3xl border border-beige-dark/20 h-[100px] gap-2"
                                                                    style={{
                                                                        backgroundColor: settings.products_detail_badge_bg_color || '#FDFCF8',
                                                                        color: settings.products_detail_badge_text_color || '#8A9A5B'
                                                                    }}
                                                                >
                                                                    {(attr2ImagePreview || (settings.products_detail_attr2_image_url && settings.products_detail_attr2_image_url !== '')) ? (
                                                                        <div className="relative group flex items-center justify-center h-10 w-full">
                                                                            <img
                                                                                src={attr2ImagePreview || formatImageUrl(settings.products_detail_attr2_image_url)}
                                                                                className="h-full object-contain"
                                                                                alt="Preview"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleRemoveIcon('attr2')}
                                                                                className="absolute -top-6 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                                                                                title="Eliminar Imagen"
                                                                            >
                                                                                <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex flex-col items-center gap-2">
                                                                            <div className="text-2xl">{settings.products_detail_attr2_icon || '✨'}</div>
                                                                            <input
                                                                                type="file"
                                                                                accept="image/*,.svg"
                                                                                onChange={(e) => handleFileChange(e, 'attr2')}
                                                                                className="text-[10px] w-full"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    <span className="text-[8px] font-bold uppercase tracking-widest">{settings.products_detail_attr2_text || 'Vista Previa'}</span>
                                                                </div>
                                                                <p className="text-[10px] text-slate-400 mt-2 italic">Si subes imagen, el emoji se ignorará.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-paper/50 rounded-2xl border border-beige-dark/10">
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Estado Vacío (Sin Resultados)</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                                                    <div className="md:col-span-1">
                                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Icono (Emoji)</label>
                                                        <input
                                                            type="text"
                                                            name="products_empty_icon"
                                                            value={settings.products_empty_icon || ''}
                                                            onChange={handleChange}
                                                            className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth text-center text-2xl"
                                                            placeholder="🕯️"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-1">
                                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">O Imagen / SVG</label>
                                                        <div className="bg-white border border-beige-dark/20 rounded-xl p-3 h-[58px] flex items-center justify-center">
                                                            {(productsEmptyImagePreview || settings.products_empty_image_url) ? (
                                                                <div className="relative group w-full h-full flex items-center justify-center">
                                                                    <img
                                                                        src={productsEmptyImagePreview || formatImageUrl(settings.products_empty_image_url)}
                                                                        className="h-full object-contain"
                                                                        alt="Preview"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveIcon('products_empty')}
                                                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <input
                                                                    type="file"
                                                                    accept="image/*,.svg"
                                                                    onChange={(e) => handleFileChange(e, 'products_empty')}
                                                                    className="text-[10px] w-full"
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <div className="space-y-4">
                                                            <div>
                                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Mensaje cuando no hay resultados</label>
                                                                <input
                                                                    type="text"
                                                                    name="products_empty_text"
                                                                    value={settings.products_empty_text || ''}
                                                                    onChange={handleChange}
                                                                    className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth italic"
                                                                    placeholder="No encontramos objetos para esta vibración actualmente."
                                                                />
                                                            </div>
                                                            <ColorPicker
                                                                label="Color del Mensaje"
                                                                name="products_empty_text_color"
                                                                value={settings.products_empty_text_color}
                                                                onChange={handleChange}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                )
                            }

                            {/* Footer Tab */}
                            {
                                activeTab === 'footer' && (
                                    <section className="bg-white rounded-3xl shadow-sm border border-beige-dark/10 overflow-hidden mb-8">
                                        <div className="p-8 border-b border-beige-dark/10 bg-paper/30">
                                            <h2 className="text-xl font-serif text-earth flex items-center gap-3">
                                                <span className="p-2 bg-earth/10 rounded-xl text-lg">🦶</span>
                                                Personalización del Footer
                                            </h2>
                                            <p className="text-slate-500 text-sm mt-1 italic">Personaliza los textos y colores del pie de página.</p>
                                        </div>

                                        <div className="p-8 space-y-8">
                                            {/* Diseño General */}
                                            <div className="p-6 bg-paper/50 rounded-2xl border border-beige-dark/10">
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Diseño General</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <ColorPicker
                                                        label="Fondo del Footer"
                                                        name="footer_bg_color"
                                                        value={settings.footer_bg_color}
                                                        onChange={handleChange}
                                                    />
                                                    <ColorPicker
                                                        label="Color de Bordes/Divisores"
                                                        name="footer_border_color"
                                                        value={settings.footer_border_color}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </div>

                                            {/* Columna Marca */}
                                            <div className="p-6 bg-paper/50 rounded-2xl border border-beige-dark/10">
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Identidad de Marca</h3>
                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Descripción (Bajo el Logo)</label>
                                                        <textarea
                                                            name="footer_description"
                                                            value={settings.footer_description || ''}
                                                            onChange={handleChange}
                                                            rows="2"
                                                            className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth text-sm"
                                                            placeholder="Productos seleccionados para tu bienestar..."
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <ColorPicker
                                                            label="Color de Descripción"
                                                            name="footer_text_color"
                                                            value={settings.footer_text_color}
                                                            onChange={handleChange}
                                                        />
                                                        <ColorPicker
                                                            label="Color de Títulos de Columnas"
                                                            name="footer_title_color"
                                                            value={settings.footer_title_color}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Frase y Copyright */}
                                            <div className="p-6 bg-paper/50 rounded-2xl border border-beige-dark/10">
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Cierre y Legal</h3>
                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                                        <div>
                                                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Frase de Cierre (Tagline)</label>
                                                            <input
                                                                type="text"
                                                                name="footer_tagline"
                                                                value={settings.footer_tagline || ''}
                                                                onChange={handleChange}
                                                                className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth text-sm italic"
                                                                placeholder="Inspirando tu equilibrio natural"
                                                            />
                                                        </div>
                                                        <ColorPicker
                                                            label="Color de Frase de Cierre"
                                                            name="footer_tagline_color"
                                                            value={settings.footer_tagline_color}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    <ColorPicker
                                                        label="Color de Copyright"
                                                        name="footer_copyright_color"
                                                        value={settings.footer_copyright_color}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                )
                            }

                            <div className="flex justify-end pb-10">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-earth text-white px-10 py-4 rounded-full font-bold hover:bg-earth-dark transition-all shadow-lg shadow-earth/20 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                                            Guardando...
                                        </>
                                    ) : (
                                        'Guardar Cambios'
                                    )}
                                </button>
                            </div>
                        </form >
                    )}
                </div >
            </div >
        </AdminLayout >
    );
};

export default AdminSettings;
