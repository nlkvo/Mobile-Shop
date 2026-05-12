import React, { useEffect, useState } from 'react';
import { getProducts, getModels, addProduct, updateProduct, deleteProduct } from '../api';
import Loader from '../components/Loader';

export default function Products({ role }) {
    const [products, setProducts] = useState([]);
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterManufacturer, setFilterManufacturer] = useState('');
    const [filterRam, setFilterRam] = useState('');
    const [filterRom, setFilterRom] = useState('');
    const [filterPriceMin, setFilterPriceMin] = useState('');
    const [filterPriceMax, setFilterPriceMax] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({ sku_code: '', model_code: '', color: '', ram_size: '', rom_size: '', retail_price: '' });

    const load = async () => {
        setLoading(true);
        const [p, m] = await Promise.all([getProducts(), getModels()]);
        setProducts(p.data);
        setModels(m.data);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const openAdd = () => {
        setEditItem(null);
        setForm({ sku_code: '', model_code: '', color: '', ram_size: '', rom_size: '', retail_price: '' });
        setShowModal(true);
    };

    const openEdit = (p) => {
        setEditItem(p);
        setForm({
            sku_code: p.sku_code,
            model_code: models.find(m => m.model_name === p.model_name)?.model_code || '',
            color: p.color,
            ram_size: p.ram_size,
            rom_size: p.rom_size,
            retail_price: p.retail_price
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.sku_code || !form.model_code || !form.color || !form.ram_size || !form.rom_size || !form.retail_price) {
            alert('Заполните все поля');
            return;
        }
        try {
            if (editItem) {
                await updateProduct(editItem.sku_code, form);
            } else {
                await addProduct(form);
            }
            setShowModal(false);
            load();
        } catch (e) {
            alert('Ошибка: ' + (e.response?.data?.error || e.message));
        }
    };

    const handleDelete = async (sku) => {
    if (!window.confirm('Удалить товар?')) return;
    try {
        await deleteProduct(sku);
        load();
    } catch (e) {
        const msg = e.response?.data?.error || '';
        if (msg.includes('foreign key') || msg.includes('constraint')) {
            alert('Невозможно удалить товар — он используется в поступлениях, продажах или списаниях.');
        } else {
            alert('Ошибка удаления: ' + msg);
        }
    }
};

    const getCategory = (price) => {
        if (price >= 120000) return <span className="badge badge-red">Флагман</span>;
        if (price >= 80000) return <span className="badge badge-orange">Премиум</span>;
        if (price >= 40000) return <span className="badge badge-blue">Средний</span>;
        return <span className="badge badge-green">Бюджетный</span>;
    };

    const manufacturers = [...new Set(products.map(p => p.manufacturer_name))];
    const ramOptions = [...new Set(products.map(p => p.ram_size))].sort();
    const romOptions = [...new Set(products.map(p => p.rom_size))].sort();

    const filtered = products.filter(p => {
        const matchSearch = !search ||
            p.model_name.toLowerCase().includes(search.toLowerCase()) ||
            p.manufacturer_name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku_code.toLowerCase().includes(search.toLowerCase());
        const matchManufacturer = !filterManufacturer || p.manufacturer_name === filterManufacturer;
        const matchRam = !filterRam || p.ram_size === filterRam;
        const matchRom = !filterRom || p.rom_size === filterRom;
        const matchPriceMin = !filterPriceMin || Number(p.retail_price) >= Number(filterPriceMin);
        const matchPriceMax = !filterPriceMax || Number(p.retail_price) <= Number(filterPriceMax);
        return matchSearch && matchManufacturer && matchRam && matchRom && matchPriceMin && matchPriceMax;
    });

    if (loading) return <Loader />;

    return (
        <div>
            <div className="page-header">
                <h1>Товары ({filtered.length})</h1>
                {role === 'admin' && (
                    <button className="btn btn-success" onClick={openAdd}>+ Добавить товар</button>
                )}
            </div>

            <div style={{ background: 'white', borderRadius: '8px', padding: '16px 20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
                <div>
                    <div style={{ fontSize: '12px', color: '#777', marginBottom: '4px', fontWeight: '600' }}>Поиск</div>
                    <input placeholder="Поиск..." value={search} onChange={e => setSearch(e.target.value)}
                        style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', width: '200px', outline: 'none' }} />
                </div>
                <div>
                    <div style={{ fontSize: '12px', color: '#777', marginBottom: '4px', fontWeight: '600' }}>Производитель</div>
                    <select value={filterManufacturer} onChange={e => setFilterManufacturer(e.target.value)}
                        style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', outline: 'none' }}>
                        <option value="">Все</option>
                        {manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div>
                    <div style={{ fontSize: '12px', color: '#777', marginBottom: '4px', fontWeight: '600' }}>RAM</div>
                    <select value={filterRam} onChange={e => setFilterRam(e.target.value)}
                        style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', outline: 'none' }}>
                        <option value="">Все</option>
                        {ramOptions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <div>
                    <div style={{ fontSize: '12px', color: '#777', marginBottom: '4px', fontWeight: '600' }}>ROM</div>
                    <select value={filterRom} onChange={e => setFilterRom(e.target.value)}
                        style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', outline: 'none' }}>
                        <option value="">Все</option>
                        {romOptions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <div>
                    <div style={{ fontSize: '12px', color: '#777', marginBottom: '4px', fontWeight: '600' }}>Цена от (₽)</div>
                    <input type="number" placeholder="0" value={filterPriceMin} onChange={e => setFilterPriceMin(e.target.value)}
                        style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', width: '110px', outline: 'none' }} />
                </div>
                <div>
                    <div style={{ fontSize: '12px', color: '#777', marginBottom: '4px', fontWeight: '600' }}>Цена до (₽)</div>
                    <input type="number" placeholder="999999" value={filterPriceMax} onChange={e => setFilterPriceMax(e.target.value)}
                        style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', width: '110px', outline: 'none' }} />
                </div>
                <button className="btn" style={{ background: '#eee', color: '#555' }}
                    onClick={() => { setSearch(''); setFilterManufacturer(''); setFilterRam(''); setFilterRom(''); setFilterPriceMin(''); setFilterPriceMax(''); }}>
                    Сбросить
                </button>
            </div>

            <table>
                <thead>
                    <tr style={{ whiteSpace: 'nowrap' }}>
                        {role !== 'customer' && <th>SKU</th>}
                        <th>Производитель</th>
                        <th>Модель</th>
                        <th>Цвет</th>
                        <th>RAM</th>
                        <th>ROM</th>
                        <th>Цена</th>
                        <th>Категория</th>
                        {role === 'admin' && <th>Действия</th>}
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(p => (
                        <tr key={p.sku_code}>
                            {role !== 'customer' && <td><code>{p.sku_code}</code></td>}
                            <td>{p.manufacturer_name}</td>
                            <td>{p.model_name}</td>
                            <td>{p.color}</td>
                            <td>{p.ram_size}</td>
                            <td>{p.rom_size}</td>
                            <td><strong>{Number(p.retail_price).toLocaleString('ru')} ₽</strong></td>
                            <td>{getCategory(p.retail_price)}</td>
                            {role === 'admin' && (
                                <td style={{ display: 'flex', gap: '6px' }}>
                                    <button className="btn btn-warning" onClick={() => openEdit(p)}>✏️</button>
                                    <button className="btn btn-danger" onClick={() => handleDelete(p.sku_code)}>🗑️</button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{editItem ? 'Редактировать товар' : 'Добавить товар'}</h2>
                        <div className="form-group">
                            <label>Код SKU</label>
                            <input value={form.sku_code} disabled={!!editItem} onChange={e => setForm({ ...form, sku_code: e.target.value })} placeholder="L000000009" />
                        </div>
                        <div className="form-group">
                            <label>Модель</label>
                            <select value={form.model_code} onChange={e => setForm({ ...form, model_code: e.target.value })}>
                                <option value="">Выберите модель</option>
                                {models.map(m => (
                                    <option key={m.model_code} value={m.model_code}>{m.manufacturer_name} {m.model_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Цвет</label>
                            <input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} placeholder="Черный" />
                        </div>
                        <div className="form-group">
                            <label>RAM</label>
                            <select value={form.ram_size} onChange={e => setForm({ ...form, ram_size: e.target.value })}>
                                <option value="">Выберите</option>
                                {['4 ГБ','6 ГБ','8 ГБ','12 ГБ','16 ГБ'].map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>ROM</label>
                            <select value={form.rom_size} onChange={e => setForm({ ...form, rom_size: e.target.value })}>
                                <option value="">Выберите</option>
                                {['64 ГБ','128 ГБ','256 ГБ','512 ГБ','1 ТБ'].map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Цена (₽)</label>
                            <input type="number" value={form.retail_price} onChange={e => setForm({ ...form, retail_price: e.target.value })} placeholder="99990" />
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