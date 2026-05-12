import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const ROLE_LABELS = {
    admin: 'Администратор',
    seller: 'Продавец',
    analyst: 'Аналитик',
    customer: 'Гость'
};

const NAV_ITEMS = [
    { to: '/products', label: 'Товары', roles: ['admin','seller','analyst','customer'] },
    { to: '/models', label: 'Модели', roles: ['admin'] },
    { to: '/references', label: 'Справочники', roles: ['admin'] },
    { to: '/sales', label: 'Продажи', roles: ['admin','seller','analyst'] },
    { to: '/arrivals', label: 'Поступления', roles: ['admin','analyst'] },
    { to: '/writeoffs', label: 'Списания', roles: ['admin','analyst'] },
    { to: '/reports', label: 'Отчёты', roles: ['admin','analyst'] },
    { to: '/transfers', label: 'Перемещения', roles: ['admin','analyst'] },
    { to: '/stock', label: 'Наличие', roles: ['admin','seller','analyst','customer'] },
];

const GRADIENT = 'linear-gradient(180deg, #0ea5e9 0%, #0369a1 100%)';

export default function Navbar({ role, loggedIn, onLoginClick, onLogout }) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(role));

    const linkStyle = ({ isActive }) => ({
        display: 'block',
        padding: '10px 16px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
        color: isActive ? 'white' : 'rgba(255,255,255,0.75)',
        background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
        transition: 'all 0.15s',
        marginBottom: '2px'
    });

    const sidebarInner = (onClose) => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '24px 20px 20px', borderBottom: '0.5px solid rgba(255,255,255,0.15)', textAlign: 'center' }}>
                <span style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.3px', color: 'white' }}>Mobile Shop</span>
            </div>
            <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
                {visibleItems.map(item => (
                    <NavLink key={item.to} to={item.to} style={linkStyle} onClick={onClose}>
                        {item.label}
                    </NavLink>
                ))}
            </nav>
            <div style={{ padding: '16px 12px', borderTop: '0.5px solid rgba(255,255,255,0.15)' }}>
                <div style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', marginBottom: '10px', textAlign: 'center' }}>
                    {ROLE_LABELS[role]}
                </div>
                {loggedIn
                    ? <button onClick={onLogout} style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '0.5px solid rgba(255,255,255,0.3)', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Выйти</button>
                    : <button onClick={onLoginClick} style={{ width: '100%', padding: '8px', background: 'white', color: '#0ea5e9', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Войти</button>
                }
            </div>
        </div>
    );

    return (
        <>
            <div className="sidebar-desktop" style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '220px', background: GRADIENT, zIndex: 100 }}>
                {sidebarInner(() => {})}
            </div>

            <div className="mobile-header" style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, height: '56px', background: GRADIENT, alignItems: 'center', padding: '0 20px', zIndex: 200, justifyContent: 'space-between' }}>
                <button onClick={() => setDrawerOpen(true)} style={{ background: 'rgba(255,255,255,0.15)', border: '0.5px solid rgba(255,255,255,0.3)', borderRadius: '6px', color: 'white', fontSize: '18px', cursor: 'pointer', padding: '4px 10px', lineHeight: 1 }}>☰</button>
                <span style={{ fontSize: '16px', fontWeight: '700', color: 'white', letterSpacing: '-0.3px' }}>Mobile Shop</span>
                <div style={{ width: '40px' }} />
            </div>

            {drawerOpen && (
                <div onClick={() => setDrawerOpen(false)} className="mobile-overlay" style={{ display: 'none', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 299 }} />
            )}

            <div className="mobile-drawer" style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '240px', background: GRADIENT, zIndex: 300, transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.25s ease', display: 'none' }}>
                {sidebarInner(() => setDrawerOpen(false))}
            </div>
        </>
    );
}