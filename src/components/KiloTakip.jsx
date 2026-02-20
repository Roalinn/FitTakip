import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function KiloTakip() {
    const { state, dispatch } = useStore();
    const { t } = useTranslation();
    const [showAddModal, setShowAddModal] = useState(false);
    const [form, setForm] = useState({ date: '', weight: '' });
    const [chartFilter, setChartFilter] = useState('all');
    const [editIndex, setEditIndex] = useState(null);
    const [editForm, setEditForm] = useState({ date: '', weight: '' });
    const [deleteIndex, setDeleteIndex] = useState(null);

    const FILTERS = [
        { key: 'week', label: t('filter_week'), days: 7 },
        { key: 'month', label: t('filter_month'), days: 30 },
        { key: '6months', label: t('filter_6months'), days: 180 },
        { key: 'year', label: t('filter_year'), days: 365 },
        { key: 'all', label: t('filter_all'), days: null },
    ];

    const handleAdd = () => {
        if (!form.date || !form.weight) return;
        dispatch({
            type: 'ADD_WEIGHT',
            payload: { date: form.date, weight: parseFloat(form.weight) },
        });
        setForm({ date: '', weight: '' });
        setShowAddModal(false);
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
            {/* Header with add button */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t('kilo_title')}</h3>
                <button className="btn btn-primary btn-sm rounded-xl" onClick={() => setShowAddModal(true)}>
                    {t('kilo_btn_add')}
                </button>
            </div>

            {/* Chart - always visible */}
            <motion.div
                className="card bg-base-200 rounded-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="card-body p-4">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <h3 className="font-semibold">{t('kilo_chart_title')}</h3>
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
                    {chartData.length < 2 && (
                        <p className="text-xs text-base-content/40 mb-2">
                            {t('kilo_chart_min_warning')}
                        </p>
                    )}
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
                                    formatter={(value) => [`${value} kg`, t('common_weight')]}
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

            {/* List */}
            {state.weightLog.length > 0 ? (
                <div className="card bg-base-200 rounded-xl">
                    <div className="card-body p-4">
                        <h3 className="font-semibold mb-3">{t('kilo_records')}</h3>
                        <div className="overflow-x-auto">
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th>{t('common_date')}</th>
                                        <th>{t('common_weight')}</th>
                                        <th className="w-20"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {state.weightLog.map((entry, i) => (
                                        <tr key={i}>
                                            <td>{new Date(entry.date).toLocaleDateString()}</td>
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
                        <p className="text-base-content/50">{t('kilo_empty_state')}</p>
                    </div>
                </div>
            )}

            {/* Add Modal (popup) */}
            {showAddModal && (
                <div className="modal modal-open">
                    <motion.div
                        className="modal-box rounded-2xl max-w-sm"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h3 className="font-bold text-lg mb-4">{t('kilo_modal_add_title')}</h3>
                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">{t('kilo_modal_date')}</span></label>
                                <input
                                    type="date"
                                    className="input input-bordered rounded-xl w-full"
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">{t('kilo_modal_weight')}</span></label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="input input-bordered rounded-xl w-full"
                                    value={form.weight}
                                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                                    placeholder="85.0"
                                />
                            </div>
                        </div>
                        <div className="modal-action">
                            <button className="btn btn-ghost btn-sm rounded-xl" onClick={() => setShowAddModal(false)}>{t('modal_btn_cancel')}</button>
                            <button className="btn btn-primary btn-sm rounded-xl" onClick={handleAdd}>{t('modal_btn_add')}</button>
                        </div>
                    </motion.div>
                    <div className="modal-backdrop" onClick={() => setShowAddModal(false)} />
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
                        <h3 className="font-bold text-lg mb-4">{t('kilo_modal_edit_title')}</h3>
                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">{t('kilo_modal_date')}</span></label>
                                <input
                                    type="date"
                                    className="input input-bordered rounded-xl w-full"
                                    value={editForm.date}
                                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">{t('kilo_modal_weight')}</span></label>
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
                            <button className="btn btn-ghost btn-sm rounded-xl" onClick={() => setEditIndex(null)}>{t('modal_btn_cancel')}</button>
                            <button className="btn btn-primary btn-sm rounded-xl" onClick={handleEdit}>{t('modal_btn_save')}</button>
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
                        <h3 className="font-bold text-lg mb-2">{t('common_confirm_delete')}</h3>
                        <p className="text-sm text-base-content/60">{t('kilo_delete_warning')}</p>
                        <div className="modal-action">
                            <button className="btn btn-ghost btn-sm rounded-xl" onClick={() => setDeleteIndex(null)}>{t('modal_btn_cancel')}</button>
                            <button className="btn btn-error btn-sm rounded-xl" onClick={confirmDelete}>{t('modal_btn_delete')}</button>
                        </div>
                    </motion.div>
                    <div className="modal-backdrop" onClick={() => setDeleteIndex(null)} />
                </div>
            )}
        </div>
    );
}
