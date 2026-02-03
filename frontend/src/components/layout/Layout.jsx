import React from 'react';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';

const Layout = ({ children }) => {
    return (
        <div className="bg-paper min-h-screen font-sans text-slate-800 selection:bg-rose-100 selection:text-rose-900 flex flex-col">
            <Header />
            <CartDrawer />
            <main className="flex-grow">
                {children}
            </main>
        </div>
    );
};

export default Layout;
