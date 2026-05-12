import React, { useEffect, useState } from 'react';
import { getArrivals, addArrival, getProducts, getShops } from '../api';
import Loader from '../components/Loader';

export default function Arrivals({ role }) {
    const [arrivals, setArrivals] = useState([]);
    const [products, setProducts] = useState([]);
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ arrival_id: '', shop_code: '', sku_code: '', arrival_date: '', purchase_price: '', quantity: '' });

    const load = async () => {
        setLoading(true);
        const [a, p, s] = await Promise.all([getArrivals(), getProducts(), getShops()]);
        setArrivals(a.data);
        setProducts(p.data);
        setShops(s.data);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleSave = async () => {
        if (!form.arrival_id || !form.shop_code || !form.sku_code || !form.arrival_date || !form.purchase_price || !form.quantity) {
            alert('Заполните все поля');
            return;
        }
        try {
            await addArrival(form);
            setShowModal(false);
            load();
        } catch (e) {
            alert('Ошибка: ' + (e.response?.data?.error || e.message));
        }
    };

    if (loading) return <Loader />;

    return (
        <div>
            <div className="page-header">
                <h1>Поступления ({arrivals.length})</h1>
                {role === 'admin' && (
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Зарегистрировать поступление</button>
                )}
            </div>

            <table>
                <thead>
                    <tr style={{ whiteSpace: 'nowrap' }}>
                        <th>ID</th>
                        <th>Дата</th>
                        <th>Магазин</th>
                        <th>Товар</th>
                        <th>Цвет</th>
                        <th>Количество</th>
                        <th>Цена закупки</th>
                    </tr>
                </thead>
                <tbody>
                    {arrivals.map(a => (
                        <tr key={a.arrival_id}>
                            <td><code>{a.arrival_id}</code></td>
                            <td>{a.arrival_date}</td>
                            <td>{a.shop_name}</td>
                            <td>{a.product}</td>
                            <td>{a.color}</td>
                            <td>{a.quantity} шт.</td>
                            <td>{Number(a.purchase_price).toLocaleString('ru')} ₽</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Зарегистрировать поступление</h2>
                        <div className="form-group">
                            <label>ID поступления</label>
                            <input value={form.arrival_id} onChange={e => setForm({ ...form, arrival_id: e.target.value })} placeholder="PR00000007" />
                        </div>
                        <div className="form-group">
                            <label>Магазин</label>
                            <select value={form.shop_code} onChange={e => setForm({ ...form, shop_code: e.target.value })}>
                                <option value="">Выберите</option>
                                {shops.map(s => <option key={s.shop_code} value={s.shop_code}>{s.shop_name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Товар</label>
                            <select value={form.sku_code} onChange={e => setForm({ ...form, sku_code: e.target.value })}>
                                <option value="">Выберите</option>
                                {products.map(p => <option key={p.sku_code} value={p.sku_code}>{p.manufacturer_name} {p.model_name} {p.color}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Дата поступления</label>
                            <input type="date" value={form.arrival_date} onChange={e => setForm({ ...form, arrival_date: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Цена закупки (₽)</label>
                            <input type="number" value={form.purchase_price} onChange={e => setForm({ ...form, purchase_price: e.target.value })} placeholder="75000" />
                        </div>
                        <div className="form-group">
                            <label>Количество</label>
                            <input type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="10" />
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