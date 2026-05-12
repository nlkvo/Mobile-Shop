import React, { useState } from 'react';
import axios from 'axios';
import { login } from '../auth';

export default function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!username || !password) { setError('Заполните все поля'); return; }
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
            login(res.data.token, res.data.role, res.data.full_name);
            onLogin(res.data.role, res.data.full_name);
        } catch (e) {
            setError(e.response?.data?.error || 'Ошибка входа');
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
            <div style={{ background: 'white', borderRadius: '12px', padding: '40px', width: '400px', maxWidth: '95vw', border: '0.5px solid #e8e4dc' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: '#0ea5e9', fontSize: '26px', fontWeight: '700', marginBottom: '6px' }}>Mobile Shop</h1>
                    <p style={{ color: '#94a3b8', fontSize: '14px' }}>Вход в систему</p>
                </div>

                {error && (
                    <div style={{ background: '#ffebee', color: '#c62828', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
                        {error}
                    </div>
                )}

                <div className="form-group">
                    <label>Логин</label>
                    <input value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                </div>
                <div className="form-group">
                    <label>Пароль</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                </div>

                <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '12px', fontSize: '15px', marginTop: '8px' }}>
                    {loading ? 'Вход...' : 'Войти'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <a href="/" style={{ color: '#94a3b8', fontSize: '13px', textDecoration: 'none' }}>← Вернуться на сайт без входа</a>
                </div>
            </div>
        </div>
    );
}