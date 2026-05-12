import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Arrivals from './pages/Arrivals';
import Writeoffs from './pages/Writeoffs';
import Stock from './pages/Stock';
import Login from './pages/Login';
import Reports from './pages/Reports';
import Models from './pages/Models';
import References from './pages/References';
import Transfers from './pages/Transfers';
import { getRole, getFullName, logout, isLoggedIn } from './auth';
import './App.css';

function App() {
    const [role, setRole] = useState(getRole() || 'customer');
    const [fullName, setFullName] = useState(getFullName() || 'Гость');
    const [loggedIn, setLoggedIn] = useState(isLoggedIn());
    const [showLogin, setShowLogin] = useState(false);

    const handleLogin = (role, full_name) => {
        setRole(role);
        setFullName(full_name);
        setLoggedIn(true);
        setShowLogin(false);
    };

    const handleLogout = () => {
        logout();
        setRole('customer');
        setFullName('Гость');
        setLoggedIn(false);
    };

    if (showLogin) return <Login onLogin={handleLogin} />;

    return (
        <BrowserRouter>
            <Navbar
                role={role}
                fullName={fullName}
                loggedIn={loggedIn}
                onLoginClick={() => setShowLogin(true)}
                onLogout={handleLogout}
            />
            <div className="main-content">
                <div className="container">
                    <Routes>
                        <Route path="/" element={<Navigate to="/products" />} />
                        <Route path="/products" element={<Products role={role} />} />
                        <Route path="/models" element={role !== 'admin' ? <Navigate to="/products" /> : <Models role={role} />} />
                        <Route path="/references" element={role !== 'admin' ? <Navigate to="/products" /> : <References />} />
                        <Route path="/sales" element={role === 'customer' ? <Navigate to="/products" /> : <Sales role={role} />} />
                        <Route path="/arrivals" element={role === 'customer' || role === 'seller' ? <Navigate to="/products" /> : <Arrivals role={role} />} />
                        <Route path="/writeoffs" element={role === 'customer' || role === 'seller' ? <Navigate to="/products" /> : <Writeoffs role={role} />} />
                        <Route path="/reports" element={role !== 'analyst' && role !== 'admin' ? <Navigate to="/products" /> : <Reports />} />
                        <Route path="/stock" element={<Stock role={role} />} />
                        <Route path="/transfers" element={role === 'customer' || role === 'seller' ? <Navigate to="/products" /> : <Transfers role={role} />} />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;