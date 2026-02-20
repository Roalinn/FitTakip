import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const MEASUREMENTS = [
    { key: 'chest', label: 'Göğüs', color: 'oklch(0.65 0.24 265)' },
    { key: 'waist', label: 'Bel', color: 'oklch(0.7 0.2 150)' },
    { key: 'hip', label: 'Kalça', color: 'oklch(0.7 0.2 30)' },
    { key: 'arm', label: 'Kol', color: 'oklch(0.7 0.2 60)' },
    { key: 'leg', label: 'Bacak', color: 'oklch(0.7 0.2 330)' },
    { key: 'shoulder', label: 'Omuz', color: 'oklch(0.7 0.2 200)' },
];

export default function BedenOlculeri() {
    const { state, dispatch } = useStore();
    const [showModal, setShowModal] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [filter, setFilter] = useState('all');
    const [form, setForm] = useState({
        date: '',
        chest: '', waist: '', hip: '', arm: '', leg: '', shoulder: '',
    });

    const openAdd = () => {
        setEditIndex(null);
        setForm({ date: '', chest: '', waist: '', hip: '', arm: '', leg: '', shoulder: '' });
        setShowModal(true);
    };

    const openEdit = (index) => {
        const entry = state.bodyMeasurements[index];
        setEditIndex(index);
        const f = { date: entry.date };
        MEASUREMENTS.forEach((m) => { f[m.key] = entry[m.key] ? String(entry[m.key]) : ''; });
        setForm(f);
        setShowModal(true);
    };

    const handleSave = () => {
        if (!form.date) return;
        const entry = { date: form.date };
        MEASUREMENTS.forEach((m) => {
            if (form[m.key]) entry[m.key] = parseFloat(form[m.key]);
        });

        if (editIndex !== null) {
            dispatch({ type: 'EDIT_BODY_MEASUREMENT', index: editIndex, payload: entry });
        } else {
            dispatch({ type: 'ADD_BODY_MEASUREMENT', payload: entry });
        }
        setForm({ date: '', chest: '', waist: '', hip: '', arm: '', leg: '', shoulder: '' });
        setEditIndex(null);
        setShowModal(false);
    };

    const confirmDelete = () => {
        if (deleteIndex !== null) {
            dispatch({ type: 'DELETE_BODY_MEASUREMENT', index: deleteIndex });
            setDeleteIndex(null);
        }
    };

    const chartData = state.bodyMeasurements.map((entry) => ({
        date: new Date(entry.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
        ...entry,
    }));

    const visibleMeasurements = filter === 'all'
        ? MEASUREMENTS
        : MEASUREMENTS.filter((m) => m.key === filter);

    return (
        <div className="space-y-6">
            {/* Add button */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Beden Ölçüleri</h3>
                <button className="btn btn-primary btn-sm rounded-xl" onClick={openAdd}>
                    + Ölçü Ekle
                </button>
            </div>

            {/* Filter & Chart */}
            {chartData.length > 1 && (
                <motion.div
                    className="card bg-base-200 rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="card-body p-4">
                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <h3 className="font-semibold">Ölçü Grafiği</h3>
                        </div>
                        {/* Filter buttons */}
                        <div className="flex flex-wrap gap-1 mb-4">
                            <button
                                className={`btn btn-xs rounded-lg ${filter === 'all' ? 'btn-primary' : 'btn-ghost bg-base-300'}`}
                                onClick={() => setFilter('all')}
                            >
                                Tümü
                            </button>
                            {MEASUREMENTS.map((m) => (
                                <button
                                    key={m.key}
                                    className={`btn btn-xs rounded-lg ${filter === m.key ? 'btn-primary' : 'btn-ghost bg-base-300'}`}
                                    onClick={() => setFilter(m.key)}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                    />
                                    <YAxis
                                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                        unit=" cm"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'oklch(0.25 0.01 260)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            color: '#fff',
                                        }}
                                    />
                                    <Legend />
                                    {visibleMeasurements.map((m) => (
                                        <Line
                                            key={m.key}
                                            type="monotone"
                                            dataKey={m.key}
                                            name={m.label}
                                            stroke={m.color}
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            connectNulls
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* List */}
            {state.bodyMeasurements.length > 0 ? (
                <div className="card bg-base-200 rounded-xl">
                    <div className="card-body p-4">
                        <h3 className="font-semibold mb-3">Kayıtlar</h3>
                        <div className="overflow-x-auto">
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Tarih</th>
                                        {MEASUREMENTS.map((m) => (
                                            <th key={m.key}>{m.label}</th>
                                        ))}
                                        <th className="w-20"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {state.bodyMeasurements.map((entry, i) => (
                                        <tr key={i}>
                                            <td>{new Date(entry.date).toLocaleDateString('tr-TR')}</td>
                                            {MEASUREMENTS.map((m) => (
                                                <td key={m.key}>{entry[m.key] ? `${entry[m.key]} cm` : '—'}</td>
                                            ))}
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
                        <p className="text-base-content/50">Henüz beden ölçüsü kaydı eklenmemiş.</p>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal modal-open">
                    <motion.div
                        className="modal-box rounded-2xl max-w-lg"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h3 className="font-bold text-lg mb-4">
                            {editIndex !== null ? 'Ölçü Düzenle' : 'Beden Ölçüsü Ekle'}
                        </h3>
                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">Tarih</span></label>
                                <input
                                    type="date"
                                    className="input input-bordered rounded-xl w-full"
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {MEASUREMENTS.map((m) => (
                                    <div key={m.key} className="form-control">
                                        <label className="label"><span className="label-text">{m.label} (cm)</span></label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="input input-bordered rounded-xl w-full"
                                            value={form[m.key]}
                                            onChange={(e) => setForm({ ...form, [m.key]: e.target.value })}
                                            placeholder="0"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-action">
                            <button className="btn btn-ghost rounded-xl" onClick={() => { setShowModal(false); setEditIndex(null); }}>İptal</button>
                            <button className="btn btn-primary rounded-xl" onClick={handleSave}>
                                {editIndex !== null ? 'Kaydet' : 'Ekle'}
                            </button>
                        </div>
                    </motion.div>
                    <div className="modal-backdrop" onClick={() => { setShowModal(false); setEditIndex(null); }} />
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
                        <p className="text-sm text-base-content/60">Bu ölçü kaydını silmek istediğinize emin misiniz?</p>
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
