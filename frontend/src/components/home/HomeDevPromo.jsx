import React from 'react';
import { Link } from 'react-router-dom';
import { formatImageUrl } from '../../utils/imageConfig';
import { useAuth } from '../../context/AuthContext';

const HomeDevPromo = ({ settings }) => {
    const { user } = useAuth();

    return (
        <section className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
                {/* Grid & Noise & Glitch Lines */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>
                <div className="absolute inset-0 animate-pulse opacity-5 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,#00ffcc_1px,#00ffcc_2px)] bg-[size:100%_4px]"></div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 relative z-10 flex flex-col items-center justify-center flex-grow text-center">

                {/* User Logo (Floating) */}
                {settings?.site_logo_url && (
                    <div className="mb-12 animate-bounce duration-[3000ms]">
                        <img
                            src={formatImageUrl(settings.site_logo_url)}
                            alt="Logo"
                            className="h-24 md:h-32 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] filter brightness-110"
                        />
                    </div>
                )}

                {/* Badge Status */}
                <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-slate-900/50 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.15)] mb-8 animate-fade-in-down">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                    </span>
                    <span className="text-cyan-300 text-xs font-mono tracking-[0.2em] uppercase">
                        System Upgrade In Progress
                    </span>
                </div>

                {/* Main Title */}
                <div className="mb-10 relative">
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 text-white leading-tight">
                        <span className="block opacity-90 animate-fade-in-down" style={{ animationDelay: '0.2s' }}>SOMETHING</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-gradient-x inline-block">
                            INSANE
                        </span>
                        <span className="block text-4xl md:text-6xl text-slate-500 mt-2 font-light tracking-wide animate-fade-in-down" style={{ animationDelay: '0.5s' }}>IS COMING SOON</span>
                    </h1>

                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto mb-8 opacity-50"></div>

                    <p className="text-slate-300 max-w-2xl mx-auto text-lg md:text-xl font-light leading-relaxed animate-fade-in-down" style={{ animationDelay: '0.8s' }}>
                        Estamos trabajando intensamente para crear tu <span className="text-cyan-400 font-bold">nueva web</span>. <br />
                        Una experiencia digital diseñada para <span className="text-purple-400 italic">sorprenderte</span>.
                    </p>
                </div>

                {/* Code Animation Decoration - Enhanced */}
                <div className="max-w-md w-full bg-slate-900/80 p-4 rounded-xl border border-slate-700/50 text-left font-mono text-xs text-green-400 shadow-2xl backdrop-blur-sm mb-12 transform hover:scale-105 transition-transform duration-500 group">
                    <div className="flex gap-2 mb-2 opacity-50">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <p className="typing-effect overflow-hidden whitespace-nowrap border-r-2 border-green-400 animate-typing">
                        &gt; deploy --production --force
                    </p>
                    <p className="mt-2 text-slate-500 group-hover:text-slate-400 transition-colors">Optimizing assets... <span className="text-green-500">Done</span></p>
                    <p className="mt-1 text-slate-500 group-hover:text-slate-400 transition-colors">Injecting magic... <span className="text-green-500">Done</span></p>
                    <div className="mt-3 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-[85%] animate-pulse"></div>
                    </div>
                </div>

                {/* Admin Access Button */}
                <Link
                    to={user ? "/admin" : "/login"}
                    className="group relative px-8 py-3 bg-slate-900 overflow-hidden rounded-lg border border-slate-800 hover:border-cyan-500/50 transition-all duration-300"
                >
                    <div className="absolute inset-0 w-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 transition-all duration-[250ms] ease-out group-hover:w-full opacity-0 group-hover:opacity-100"></div>
                    <span className="relative text-slate-400 group-hover:text-cyan-300 font-mono text-xs uppercase tracking-widest flex items-center gap-2 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        {user ? 'Ir al Panel' : 'Acceso Propietario'}
                    </span>
                </Link>
            </div>

            {/* Custom Footer MR. CODE + Client Logo if available */}
            <div className="w-full relative z-10 py-6 border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-slate-500">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[10px] tracking-widest opacity-90 transition-opacity hover:opacity-100">
                            <span className="text-cyan-500 text-lg">⚡</span>
                            <span>POWERED BY</span>
                            <a href="https://www.mrcode.com.ar" target="_blank" rel="noopener noreferrer" className="ml-1">
                                <img
                                    src="/images/logo-no-background.svg"
                                    alt="Mr. Code"
                                    className="h-8 md:h-10 w-auto object-contain brightness-0 invert drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] hover:drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all"
                                />
                            </a>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <a
                            href="https://www.instagram.com/mrcodewebdesign/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-cyan-400 cursor-pointer transition-colors"
                        >
                            INSTAGRAM
                        </a>
                        <a
                            href="https://wa.me/5493412763219"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-purple-400 cursor-pointer transition-colors"
                        >
                            WHATSAPP
                        </a>
                    </div>

                    <div className="opacity-50">
                        EST. {new Date().getFullYear()}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomeDevPromo;
