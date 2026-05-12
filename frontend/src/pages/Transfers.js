import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getProducts, getShops } from '../api';
import Loader from '../components/Loader';

export default function Transfers({ role }) {
    const [transfers, setTransfers] = useState([]);
    const [products, setProducts] = useState([]);
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ transfer_id: '', from_shop_code: '', to_shop_code: '', sku_code: '', quantity: '', transfer_date: '', notes: '' });

    const load = async () => {
        setLoading(true);
        const [t, p, s] = await Promise.all([
            axios.get('http://localhost:5000/api/transfers'),
            getProducts(),
            getShops()
        ]);
        setTransfers(t.data);
        setProducts(p.data);
        setShops(s.data);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleSave = async () => {
        if (!form.transfer_id || !form.from_shop_code || !form.to_shop_code || !form.sku_code || !form.quantity || !form.transfer_date) {
            alert('Заполните все обязательные поля');
            return;
        }
        if (form.from_shop_code === form.to_shop_code) {
            alert('Магазин отправитель и получатель не могут совпадать');
            return;
        }
        try {
            await axios.post('http://localhost:5000/api/transfers', form);
            setShowModal(false);
            setForm({ transfer_id: '', from_shop_code: '', to_shop_code: '', sku_code: '', quantity: '', transfer_date: '', notes: '' });
            load();
        } catch (e) {
            alert('Ошибка: ' + (e.response?.data?.error || e.message));
        }
    };

    if (loading) return <Loader />;

    return (
        <div>
            <div className="page-header">
                <h1>Перемещения ({transfers.length})</h1>
                {role === 'admin' && (
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Зарегистрировать перемещение</button>
                )}
            </div>

            <table>
                <thead>
                    <tr style={{ whiteSpace: 'nowrap' }}>
                        <th>ID</th>
                        <th>Дата</th>
                        <th>Откуда</th>
                        <th>Куда</th>
                        <th>Товар</th>
                        <th>Цвет</th>
                        <th>Количество</th>
                        <th>Примечание</th>
                    </tr>
                </thead>
                <tbody>
                    {transfers.map(t => (
                        <tr key={t.transfer_id}>
                            <td><code>{t.transfer_id}</code></td>
                            <td>{t.transfer_date}</td>
                            <td>{t.from_shop}</td>
                            <td>{t.to_shop}</td>
                            <td>{t.product}</td>
                            <td>{t.color}</td>
                            <td>{t.quantity} шт.</td>
                            <td>{t.notes || '—'}</td>
                        </tr>
                    ))}
                    {transfers.length === 0 && (
                        <tr><td colSpan={8} style={{ textAlign: 'center', color: '#aaa', padding: '30px' }}>Нет перемещений</td></tr>
                    )}
                </tbody>
            </table>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Зарегистрировать перемещение</h2>
                        <div className="form-group">
                            <label>ID перемещения</label>
                            <input value={form.transfer_id} onChange={e => setForm({ ...form, transfer_id: e.target.value })} placeholder="TF00000003" />
                        </div>
                        <div className="form-group">
                            <label>Откуда</label>
                            <select value={form.from_shop_code} onChange={e => setForm({ ...form, from_shop_code: e.target.value })}>
                                <option value="">Выберите магазин</option>
                                {shops.map(s => <option key={s.shop_code} value={s.shop_code}>{s.shop_name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Куда</label>
                            <select value={form.to_shop_code} onChange={e => setForm({ ...form, to_shop_code: e.target.value })}>
                                <option value="">Выберите магазин</option>
                                {shops.filter(s => s.shop_code !== form.from_shop_code).map(s => <option key={s.shop_code} value={s.shop_code}>{s.shop_name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Товар</label>
                            <select value={form.sku_code} onChange={e => setForm({ ...form, sku_code: e.target.value })}>
                                <option value="">Выберите товар</option>
                                {products.map(p => <option key={p.sku_code} value={p.sku_code}>{p.manufacturer_name} {p.model_name} {p.color}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Количество</label>
                            <input type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="1" />
                        </div>
                        <div className="form-group">
                            <label>Дата</label>
                            <input type="date" value={form.transfer_date} onChange={e => setForm({ ...form, transfer_date: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Примечание</label>
                            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Необязательно" />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-primary" onClick={handleSave}>Сохранить</button>
                            <button className="btn" style={{ background: '#eee' }} onClick={() => setShowModal(false)}>Отмена</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}