import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '../components/Loader';

export default function Reports() {
    const [tab, setTab] = useState('sales');
    const today = new Date().toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const [dateFrom, setDateFrom] = useState(monthAgo);
    const [dateTo, setDateTo] = useState(today);
    const [salesData, setSalesData] = useState([]);
    const [stockData, setStockData] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadReports = async () => {
        setLoading(true);
        try {
            const [s, st] = await Promise.all([
                axios.get(`http://localhost:5000/api/reports/sales?from=${dateFrom}&to=${dateTo}`),
                axios.get('http://localhost:5000/api/reports/stock')
            ]);
            setSalesData(s.data);
            setStockData(st.data);
        } catch (e) {
            alert('Ошибка загрузки: ' + e.message);
        }
        setLoading(false);
    };

    useEffect(() => { loadReports(); }, []);

    const totalRevenue = salesData.reduce((sum, s) => sum + Number(s.revenue), 0);
    const totalSold = salesData.reduce((sum, s) => sum + Number(s.quantity), 0);

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

    return (
        <div>
            <div className="page-header">
                <h1>Отчёты и аналитика</h1>
            </div>

            <div style={{ background: 'white', borderRadius: '8px', padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <span style={{ fontWeight: '600', color: '#555' }}>Период:</span>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', background: 'white' }} />
                <span style={{ color: '#999' }}>—</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', background: 'white' }} />
                <button className="btn btn-primary" onClick={loadReports}>Сформировать</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #4caf50' }}>
                    <div style={{ color: '#999', fontSize: '13px', marginBottom: '8px' }}>Выручка за период</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#2c3e50' }}>{totalRevenue.toLocaleString('ru')} ₽</div>
                </div>
                <div style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #0ea5e9' }}>
                    <div style={{ color: '#999', fontSize: '13px', marginBottom: '8px' }}>Продано единиц</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#2c3e50' }}>{totalSold} шт.</div>
                </div>
                <div style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #ff9800' }}>
                    <div style={{ color: '#999', fontSize: '13px', marginBottom: '8px' }}>Позиций в наличии</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#2c3e50' }}>{stockData.length} шт.</div>
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: '8px 8px 0 0', borderBottom: '1px solid #eee', display: 'flex' }}>
                <button style={tabStyle('sales')} onClick={() => setTab('sales')}>Продажи по товарам</button>
                <button style={tabStyle('shops')} onClick={() => setTab('shops')}>Продажи по магазинам</button>
                <button style={tabStyle('stock')} onClick={() => setTab('stock')}>Остатки</button>
            </div>

            {loading ? <Loader /> : (
                <>
                    {tab === 'sales' && (
                        <table>
                            <thead>
                                <tr>
                                    <th>Товар</th>
                                    <th>Производитель</th>
                                    <th>Продано (шт.)</th>
                                    <th>Выручка</th>
                                    <th>Средняя цена</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salesData.map((s, i) => (
                                    <tr key={i}>
                                        <td>{s.model_name}</td>
                                        <td>{s.manufacturer_name}</td>
                                        <td>{s.quantity}</td>
                                        <td><strong>{Number(s.revenue).toLocaleString('ru')} ₽</strong></td>
                                        <td>{Number(s.avg_price).toLocaleString('ru')} ₽</td>
                                    </tr>
                                ))}
                                {salesData.length === 0 && (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', color: '#999', padding: '30px' }}>Нет данных за выбранный период</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}

                    {tab === 'shops' && (
                        <table>
                            <thead>
                                <tr>
                                    <th>Магазин</th>
                                    <th>Продаж</th>
                                    <th>Единиц продано</th>
                                    <th>Выручка</th>
                                    <th>Средний чек</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salesData.length > 0 ? (
                                    Object.values(
                                        salesData.reduce((acc, s) => {
                                            const key = s.shop_name || 'Неизвестно';
                                            if (!acc[key]) acc[key] = { shop: key, sales: 0, qty: 0, rev: 0 };
                                            acc[key].sales += 1;
                                            acc[key].qty += Number(s.quantity);
                                            acc[key].rev += Number(s.revenue);
                                            return acc;
                                        }, {})
                                    ).map((s, i) => (
                                        <tr key={i}>
                                            <td>{s.shop}</td>
                                            <td>{s.sales}</td>
                                            <td>{s.qty} шт.</td>
                                            <td><strong>{s.rev.toLocaleString('ru')} ₽</strong></td>
                                            <td>{Math.round(s.rev / s.sales).toLocaleString('ru')} ₽</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', color: '#999', padding: '30px' }}>Нет данных за выбранный период</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}

                    {tab === 'stock' && (
                        <table>
                            <thead>
                                <tr>
                                    <th>Магазин</th>
                                    <th>Товар</th>
                                    <th>Цвет</th>
                                    <th>RAM</th>
                                    <th>ROM</th>
                                    <th>Цена</th>
                                    <th>Остаток</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockData.map((s, i) => (
                                    <tr key={i}>
                                        <td>{s['Магазин']}</td>
                                        <td>{s['Производитель']} {s['Модель']}</td>
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
                    )}
                </>
            )}
        </div>
    );
}