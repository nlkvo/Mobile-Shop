import React, { useEffect, useState } from 'react';
import { getModels, addModel } from '../api';
import Loader from '../components/Loader';
import axios from 'axios';

export default function Models({ role }) {
    const [models, setModels] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ model_code: '', manufacturer_code: '', country_code: '', model_name: '' });

    const load = async () => {
        setLoading(true);
        const [m, man, c] = await Promise.all([
            getModels(),
            axios.get('http://localhost:5000/api/manufacturers'),
            axios.get('http://localhost:5000/api/countries')
        ]);
        setModels(m.data);
        setManufacturers(man.data);
        setCountries(c.data);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleSave = async () => {
        if (!form.model_code || !form.manufacturer_code || !form.country_code || !form.model_name) {
            alert('Заполните все поля');
            return;
        }
        try {
            await addModel(form);
            setShowModal(false);
            setForm({ model_code: '', manufacturer_code: '', country_code: '', model_name: '' });
            load();
        } catch (e) {
            alert('Ошибка: ' + (e.response?.data?.error || e.message));
        }
    };

    if (loading) return <Loader />;

    return (
        <div>
            <div className="page-header">
                <h1>Модели ({models.length})</h1>
                {role === 'admin' && (
                    <button className="btn btn-success" onClick={() => setShowModal(true)}>+ Добавить модель</button>
                )}
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Код</th>
                        <th>Производитель</th>
                        <th>Модель</th>
                        <th>Страна</th>
                    </tr>
                </thead>
                <tbody>
                    {models.map(m => (
                        <tr key={m.model_code}>
                            <td><code>{m.model_code}</code></td>
                            <td>{m.manufacturer_name}</td>
                            <td>{m.model_name}</td>
                            <td>{m.country_name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Добавить модель</h2>
                        <div className="form-group">
                            <label>Код модели</label>
                            <input value={form.model_code} onChange={e => setForm({ ...form, model_code: e.target.value })} placeholder="M000007" />
                        </div>
                        <div className="form-group">
                            <label>Производитель</label>
                            <select value={form.manufacturer_code} onChange={e => setForm({ ...form, manufacturer_code: e.target.value })}>
                                <option value="">Выберите</option>
                                {manufacturers.map(m => <option key={m.manufacturer_code} value={m.manufacturer_code}>{m.manufacturer_name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Страна производства</label>
                            <select value={form.country_code} onChange={e => setForm({ ...form, country_code: e.target.value })}>
                                <option value="">Выберите</option>
                                {countries.map(c => <option key={c.country_code} value={c.country_code}>{c.country_name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Название модели</label>
                            <input value={form.model_name} onChange={e => setForm({ ...form, model_name: e.target.value })} placeholder="iPhone 16 Pro" />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-success" onClick={handleSave}>Сохранить</button>
                            <button className="btn" style={{ background: '#eee' }} onClick={() => setShowModal(false)}>Отмена</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}