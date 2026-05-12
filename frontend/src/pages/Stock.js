import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '../components/Loader';

export default function Stock() {
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterShop, setFilterShop] = useState('');

    useEffect(() => {
        axios.get('http://localhost:5000/api/stock')
            .then(r => { setStock(r.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const shops = [...new Set(stock.map(s => s['Магазин']))];
    const filtered = filterShop ? stock.filter(s => s['Магазин'] === filterShop) : stock;

    if (loading) return <Loader />;

    return (
        <div>
            <div className="page-header">
                <h1>Наличие ({filtered.length} позиций)</h1>
                <select value={filterShop} onChange={e => setFilterShop(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}>
                    <option value="">Все магазины</option>
                    {shops.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <table>
                <thead>
                    <tr style={{ whiteSpace: 'nowrap' }}>
                        <th>Магазин</th>
                        <th>Производитель</th>
                        <th>Модель</th>
                        <th>SKU</th>
                        <th>Цвет</th>
                        <th>RAM</th>
                        <th>ROM</th>
                        <th>Цена</th>
                        <th>Остаток</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((s, i) => (
                        <tr key={i}>
                            <td>{s['Магазин']}</td>
                            <td>{s['Производитель']}</td>
                            <td>{s['Модель']}</td>
                            <td><code>{s['SKU']}</code></td>
                            <td>{s['Цвет']}</td>
                            <td>{s['RAM']}</td>
                            <td>{s['ROM']}</td>
                            <td>{Number(s['Цена']).toLocaleString('ru')} ₽</td>
                            <td>
                                <span className={`badge ${s['Остаток'] > 5 ? 'badge-green' : 'badge-orange'}`}>
                                    {s['Остаток']} шт.
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}