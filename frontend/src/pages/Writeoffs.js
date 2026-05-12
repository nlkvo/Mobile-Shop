import React, { useEffect, useState } from 'react';
import { getWriteoffs, addWriteoff, getProducts, getShops } from '../api';
import Loader from '../components/Loader';

export default function Writeoffs({ role }) {
    const [writeoffs, setWriteoffs] = useState([]);
    const [products, setProducts] = useState([]);
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ writeoff_id: '', shop_code: '', sku_code: '', writeoff_date: '', quantity: '', writeoff_reason: 'Брак', notes: '' });

    const load = async () => {
        setLoading(true);
        const [w, p, s] = await Promise.all([getWriteoffs(), getProducts(), getShops()]);
        setWriteoffs(w.data);
        setProducts(p.data);
        setShops(s.data);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleSave = async () => {
        if (!form.writeoff_id || !form.shop_code || !form.sku_code || !form.writeoff_date || !form.quantity) {
            alert('Заполните все поля');
            return;
        }
        try {
            await addWriteoff(form);
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
                <h1>Списания ({writeoffs.length})</h1>
                {role === 'admin' && (
                    <button className="btn btn-danger" onClick={() => setShowModal(true)}>+ Зарегистрировать списание</button>
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
                        <th>Причина</th>
                        <th>Примечание</th>
                    </tr>
                </thead>
                <tbody>
                    {writeoffs.map(w => (
                        <tr key={w.writeoff_id}>
                            <td><code>{w.writeoff_id}</code></td>
                            <td>{w.writeoff_date}</td>
                            <td>{w.shop_name}</td>
                            <td>{w.product}</td>
                            <td>{w.color}</td>
                            <td>{w.quantity} шт.</td>
                            <td>{w.writeoff_reason}</td>
                            <td>{w.notes || '—'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Зарегистрировать списание</h2>
                        <div className="form-group">
                            <label>ID списания</label>
                            <input value={form.writeoff_id} onChange={e => setForm({ ...form, writeoff_id: e.target.value })} placeholder="WR00000003" />
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
                            <label>Дата списания</label>
                            <input type="date" value={form.writeoff_date} onChange={e => setForm({ ...form, writeoff_date: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Количество</label>
                            <input type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Причина</label>
                            <select value={form.writeoff_reason} onChange={e => setForm({ ...form, writeoff_reason: e.target.value })}>
                                <option>Брак</option>
                                <option>Брак производителя</option>
                                <option>Потеря при инвентаризации</option>
                                <option>Повреждение при транспортировке</option>
                                <option>Истёк срок годности</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Примечание</label>
                            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Необязательно" />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-danger" onClick={handleSave}>Сохранить</button>
                            <button className="btn" style={{ background: '#eee' }} onClick={() => setShowModal(false)}>Отмена</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}