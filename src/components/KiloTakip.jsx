import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const FILTERS = [
    { key: 'week', label: 'Son Hafta', days: 7 },
    { key: 'month', label: 'Son Ay', days: 30 },
    { key: '6months', label: 'Son 6 Ay', days: 180 },
    { key: 'year', label: 'Son Yıl', days: 365 },
    { key: 'all', label: 'Tümü', days: null },
];

export default function KiloTakip() {
    const { state, dispatch } = useStore();
    const [form, setForm] = useState({ date: '', weight: '' });
    const [chartFilter, setChartFilter] = useState('all');
    const [editIndex, setEditIndex] = useState(null);
    const [editForm, setEditForm] = useState({ date: '', weight: '' });
    const [deleteIndex, setDeleteIndex] = useState(null);

    const handleAdd = () => {
        if (!form.date || !form.weight) return;
        dispatch({
            type: 'ADD_WEIGHT',
            payload: { date: form.date, weight: parseFloat(form.weight) },
        });
        setForm({ date: '', weight: '' });
    };

    const openEdit = (index) => {
        const entry = state.weightLog[index];
        setEditIndex(index);
        setEditForm({ date: entry.date, weight: String(entry.weight) });
    };

    const handleEdit = () => {
        if (!editForm.date || !editForm.weight) return;
        dispatch({
            type: 'EDIT_WEIGHT',
            index: editIndex,
            payload: { date: editForm.date, weight: parseFloat(editForm.weight) },
        });
        setEditIndex(null);
    };

    const confirmDelete = () => {
        if (deleteIndex !== null) {
            dispatch({ type: 'DELETE_WEIGHT', index: deleteIndex });
            setDeleteIndex(null);
        }
    };

    const filteredData = useMemo(() => {
        const filter = FILTERS.find((f) => f.key === chartFilter);
        if (!filter || !filter.days) return state.weightLog;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - filter.days);
        return state.weightLog.filter((e) => new Date(e.date) >= cutoff);
    }, [state.weightLog, chartFilter]);

    const chartData = filteredData.map((entry) => ({
        date: new Date(entry.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
        kg: entry.weight,
    }));

    return (
        <div className="space-y-6">
            {/* Add form */}
            <div className="card bg-base-200 rounded-xl">
                <div className="card-body p-4">
                    <h3 className="font-semibold mb-3">Kilo Ekle</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="date"
                            className="input input-bordered rounded-xl flex-1"
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                        />
                        <input
                            type="number"
                            step="0.1"
                            className="input input-bordered rounded-xl w-full sm:w-32"
                            value={form.weight}
                            onChange={(e) => setForm({ ...form, weight: e.target.value })}
                            placeholder="kg"
                        />
                        <button className="btn btn-primary rounded-xl" onClick={handleAdd}>Ekle</button>
                    </div>
                </div>
            </div>

            {/* Chart */}
            {chartData.length > 1 && (
                <motion.div
                    className="card bg-base-200 rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="card-body p-4">
                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <h3 className="font-semibold">Kilo Grafiği</h3>
                            <div className="flex flex-wrap gap-1">
                                {FILTERS.map((f) => (
                                    <button
                                        key={f.key}
                                        className={`btn btn-xs rounded-lg ${chartFilter === f.key ? 'btn-primary' : 'btn-ghost bg-base-300'}`}
                                        onClick={() => setChartFilter(f.key)}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                    />
                                    <YAxis
                                        domain={['auto', 'auto']}
                                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                        unit=" kg"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'oklch(0.25 0.01 260)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            color: '#fff',
                                        }}
                                        formatter={(value) => [`${value} kg`, 'Kilo']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="kg"
                                        stroke="oklch(0.65 0.24 265)"
                                        strokeWidth={2}
                                        dot={{ fill: 'oklch(0.65 0.24 265)', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* List */}
            {state.weightLog.length > 0 ? (
                <div className="card bg-base-200 rounded-xl">
                    <div className="card-body p-4">
                        <h3 className="font-semibold mb-3">Kayıtlar</h3>
                        <div className="overflow-x-auto">
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Tarih</th>
                                        <th>Kilo</th>
                                        <th className="w-20"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {state.weightLog.map((entry, i) => (
                                        <tr key={i}>
                                            <td>{new Date(entry.date).toLocaleDateString('tr-TR')}</td>
                                            <td className="font-medium">{entry.weight} kg</td>
                                            <td>
                                                <div className="flex gap-1">
                                                    <button
                                                        className="btn btn-ghost btn-xs text-info"
                                                        style={{ transform: 'scaleX(-1)' }}
                                                        onClick={() => openEdit(i)}
                                                    >
                                                        ✎
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost btn-xs text-error"
                                                        onClick={() => setDeleteIndex(i)}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card bg-base-200 rounded-xl">
                    <div className="card-body items-center text-center py-12">
                        <p className="text-base-content/50">Henüz kilo kaydı eklenmemiş.</p>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editIndex !== null && (
                <div className="modal modal-open">
                    <motion.div
                        className="modal-box rounded-2xl max-w-sm"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h3 className="font-bold text-lg mb-4">Kilo Düzenle</h3>
                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">Tarih</span></label>
                                <input
                                    type="date"
                                    className="input input-bordered rounded-xl w-full"
                                    value={editForm.date}
                                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Kilo (kg)</span></label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="input input-bordered rounded-xl w-full"
                                    value={editForm.weight}
                                    onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-action">
                            <button className="btn btn-ghost btn-sm rounded-xl" onClick={() => setEditIndex(null)}>İptal</button>
                            <button className="btn btn-primary btn-sm rounded-xl" onClick={handleEdit}>Kaydet</button>
                        </div>
                    </motion.div>
                    <div className="modal-backdrop" onClick={() => setEditIndex(null)} />
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteIndex !== null && (
                <div className="modal modal-open">
                    <motion.div
                        className="modal-box rounded-2xl max-w-sm"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.15 }}
                    >
                        <h3 className="font-bold text-lg mb-2">Silmeyi Onayla</h3>
                        <p className="text-sm text-base-content/60">Bu kilo kaydını silmek istediğinize emin misiniz?</p>
                        <div className="modal-action">
                            <button className="btn btn-ghost btn-sm rounded-xl" onClick={() => setDeleteIndex(null)}>İptal</button>
                            <button className="btn btn-error btn-sm rounded-xl" onClick={confirmDelete}>Sil</button>
                        </div>
                    </motion.div>
                    <div className="modal-backdrop" onClick={() => setDeleteIndex(null)} />
                </div>
            )}
        </div>
    );
}
