import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '../components/Loader';

export default function References() {
    const [tab, setTab] = useState('manufacturers');
    const [manufacturers, setManufacturers] = useState([]);
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ code: '', name: '' });

    const load = async () => {
        setLoading(true);
        const [man, cnt] = await Promise.all([
            axios.get('http://localhost:5000/api/manufacturers'),
            axios.get('http://localhost:5000/api/countries')
        ]);
        setManufacturers(man.data);
        setCountries(cnt.data);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleSave = async () => {
        if (!form.code || !form.name) { alert('Заполните все поля'); return; }
        try {
            if (tab === 'manufacturers') {
                await axios.post('http://localhost:5000/api/manufacturers', { manufacturer_code: form.code, manufacturer_name: form.name });
            } else {
                await axios.post('http://localhost:5000/api/countries', { country_code: form.code, country_name: form.name });
            }
            setShowModal(false);
            setForm({ code: '', name: '' });
            load();
        } catch (e) {
            alert('Ошибка: ' + (e.response?.data?.error || e.message));
        }
    };

    const tabStyle = (t) => ({
        padding: '10px 24px',
        border: 'none',
        borderBottom: tab === t ? '3px solid #0ea5e9' : '3px solid transparent',
        background: 'white',
        color: tab === t ? '#0ea5e9' : '#666',
        fontWeight: tab === t ? 700 : 400,
        fontSize: '14px',
        cursor: 'pointer'
    });

    if (loading) return <Loader />;

    const data = tab === 'manufacturers' ? manufacturers : countries;
    const codeField = tab === 'manufacturers' ? 'manufacturer_code' : 'country_code';
    const nameField = tab === 'manufacturers' ? 'manufacturer_name' : 'country_name';

    return (
        <div>
            <div className="page-header">
                <h1>Справочники</h1>
                <button className="btn btn-success" onClick={() => setShowModal(true)}>+ Добавить</button>
            </div>

            <div style={{ background: 'white', borderRadius: '8px 8px 0 0', borderBottom: '1px solid #eee', display: 'flex' }}>
                <button style={tabStyle('manufacturers')} onClick={() => setTab('manufacturers')}>Производители ({manufacturers.length})</button>
                <button style={tabStyle('countries')} onClick={() => setTab('countries')}>Страны ({countries.length})</button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Код</th>
                        <th>{tab === 'manufacturers' ? 'Производитель' : 'Страна'}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(item => (
                        <tr key={item[codeField]}>
                            <td><code>{item[codeField]}</code></td>
                            <td>{item[nameField]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Добавить {tab === 'manufacturers' ? 'производителя' : 'страну'}</h2>
                        <div className="form-group">
                            <label>Код</label>
                            <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })}
                                placeholder={tab === 'manufacturers' ? 'P006' : 'C006'} />
                        </div>
                        <div className="form-group">
                            <label>Название</label>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder={tab === 'manufacturers' ? 'OnePlus' : 'Япония'} />
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