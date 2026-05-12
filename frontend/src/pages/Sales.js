import React, { useEffect, useState } from 'react';
import { getSales, addSale, getProducts, getShops, getEmployees } from '../api';
import Loader from '../components/Loader';

export default function Sales({ role }) {
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [shops, setShops] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ sale_id: '', shop_code: '', employee_id: '', sku_code: '', actual_sale_price: '', quantity_sold: 1 });

    const load = async () => {
        setLoading(true);
        const [s, p, sh, e] = await Promise.all([getSales(), getProducts(), getShops(), getEmployees()]);
        setSales(s.data);
        setProducts(p.data);
        setShops(sh.data);
        setEmployees(e.data);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleSave = async () => {
        if (!form.sale_id || !form.shop_code || !form.employee_id || !form.sku_code || !form.actual_sale_price) {
            alert('Заполните все поля');
            return;
        }
        try {
            await addSale(form);
            setShowModal(false);
            load();
        } catch (e) {
            alert('Ошибка: ' + (e.response?.data?.error || e.message));
        }
    };

    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0);

    if (loading) return <Loader />;

    return (
        <div>
            <div className="page-header">
                <h1>Продажи ({sales.length})</h1>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ color: '#4caf50', fontWeight: '700', fontSize: '16px' }}>
                        Выручка: {totalRevenue.toLocaleString('ru')} ₽
                    </span>
                    {(role === 'admin' || role === 'seller') && (
                        <button className="btn btn-success" onClick={() => setShowModal(true)}>+ Оформить продажу</button>
                    )}
                </div>
            </div>

            <table>
                <thead>
                    <tr style={{ whiteSpace: 'nowrap' }}>
                        <th>ID</th>
                        <th>Дата</th>
                        <th>Магазин</th>
                        <th>Продавец</th>
                        <th>Товар</th>
                        <th>Цвет</th>
                        <th>Кол-во</th>
                        <th>Цена</th>
                        <th>Сумма</th>
                    </tr>
                </thead>
                <tbody>
                    {sales.map(s => (
                        <tr key={s.sale_id}>
                            <td><code>{s.sale_id}</code></td>
                            <td>{s.sale_datetime}</td>
                            <td>{s.shop_name}</td>
                            <td>{s.employee_full_name}</td>
                            <td>{s.product}</td>
                            <td>{s.color}</td>
                            <td>{s.quantity_sold}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{Number(s.actual_sale_price).toLocaleString('ru')} ₽</td>
                            <td style={{ whiteSpace: 'nowrap' }}><strong>{Number(s.total).toLocaleString('ru')} ₽</strong></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Оформить продажу</h2>
                        <div className="form-group">
                            <label>ID продажи</label>
                            <input value={form.sale_id} onChange={e => setForm({ ...form, sale_id: e.target.value })} placeholder="TR00000007" />
                        </div>
                        <div className="form-group">
                            <label>Магазин</label>
                            <select value={form.shop_code} onChange={e => setForm({ ...form, shop_code: e.target.value })}>
                                <option value="">Выберите</option>
                                {shops.map(s => <option key={s.shop_code} value={s.shop_code}>{s.shop_name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Продавец</label>
                            <select value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })}>
                                <option value="">Выберите</option>
                                {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.employee_full_name}</option>)}
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
                            <label>Цена продажи (₽)</label>
                            <input type="number" value={form.actual_sale_price} onChange={e => setForm({ ...form, actual_sale_price: e.target.value })} placeholder="99990" />
                        </div>
                        <div className="form-group">
                            <label>Количество</label>
                            <input type="number" min="1" value={form.quantity_sold} onChange={e => setForm({ ...form, quantity_sold: e.target.value })} />
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