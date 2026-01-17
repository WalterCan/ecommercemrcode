import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../context/ToastContext';

const AdminSettings = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        bank_name: '',
        bank_account_holder: '',
        bank_cbu: '',
        bank_alias: '',
        whatsapp_number: '',
        whatsapp_message: '',
        hero_title: '',
        hero_subtitle: '',
        hero_image_url: '',
        hero_cta_text: '',
        hero_cta1_link: '',
        hero_cta2_text: '',
        hero_cta1_link: '',
        hero_cta2_text: '',
        hero_cta2_link: '',
        email_host: '',
        email_port: '',
        email_user: '',
        email_password: '',
        email_secure: '',
        email_from_name: '',
        announcement_active: 'false',
        announcement_text: '',
        announcement_link: '',
        social_instagram: '',
        social_facebook: '',
        site_logo_url: '',
        site_name: ''
    });
    const [heroImageFile, setHeroImageFile] = useState(null);
    const [heroImagePreview, setHeroImagePreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            const response = await fetch(`${baseUrl}/settings`);
            const data = await response.json();

            // Mezclamos con los valores por defecto por si falta alguno
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
            }
        }
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        setSettings(prev => ({ ...prev, site_logo_url: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

            const formData = new FormData();
            formData.append('data', JSON.stringify(settings));
            if (heroImageFile) {
                formData.append('hero_image', heroImageFile);
            }
            if (logoFile) {
                formData.append('logo_image', logoFile);
            }

            const response = await fetch(`${baseUrl}/settings`, {
                method: 'PUT',
                body: formData
            });

            if (response.ok) {
                showToast('Configuraciones guardadas con éxito', 'success');
                fetchSettings(); // Recargar para obtener la URL de la imagen nueva
                setHeroImageFile(null);
                setHeroImagePreview(null);
                setLogoFile(null);
                setLogoPreview(null);
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
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-earth mx-auto"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Datos Bancarios */}
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
                        </section>

                        {/* WhatsApp para Pedidos */}
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
                                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-300 ${settings.announcement_active === 'true' || settings.announcement_active === true ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
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

                                    <div className="mb-6">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Nombre de la Tienda (Texto)</label>
                                        <input
                                            type="text"
                                            name="site_name"
                                            value={settings.site_name || ''}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth font-serif font-bold text-lg text-earth"
                                            placeholder="TIENDA HOLÍSTICA"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">Este texto se mostrará si no hay un logo subido.</p>
                                    </div>

                                    <div className="h-px bg-beige-dark/10 my-6"></div>

                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Logo de la Tienda</label>
                                    <div className="flex items-center gap-8">
                                        <div className="w-32 h-32 bg-white rounded-xl border border-beige-dark/10 flex items-center justify-center overflow-hidden p-2 relative group">
                                            {(logoPreview || settings.site_logo_url) ? (
                                                <>
                                                    <img
                                                        src={logoPreview || (settings.site_logo_url?.startsWith('http') ? settings.site_logo_url : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${settings.site_logo_url}`)}
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

                        {/* Configuración de Email (SMTP) */}
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
                        </section>

                        {/* Apariencia de Portada */}
                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
                            <h2 className="text-xl font-serif text-earth font-bold mb-6 flex items-center gap-2">
                                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Diseño de Portada (Hero)
                            </h2>
                            <div className="space-y-6">
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

                                <div className="p-6 bg-paper/50 rounded-2xl border border-beige-dark/10">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Fondo de Portada</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                        <div>
                                            <p className="text-[10px] text-slate-400 mb-2 uppercase font-bold">Subir Imagen Lokal</p>
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
                                                        src={heroImagePreview || (settings.hero_image_url?.startsWith('http') ? settings.hero_image_url : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${settings.hero_image_url}`)}
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
                    </form>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminSettings;
