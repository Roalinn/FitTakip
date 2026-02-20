import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';

export default function GymTakip() {
    const { state, dispatch } = useStore();
    const { t } = useTranslation();
    const [showModal, setShowModal] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() };
    });
    const [selectedDate, setSelectedDate] = useState(null);
    const [form, setForm] = useState({
        date: '',
        exercises: [{ name: '', sets: '', reps: '', duration: '', weight: '' }],
    });

    // Build a map: dateString -> gymLog entries
    const logMap = useMemo(() => {
        const map = {};
        state.gymLog.forEach((log, idx) => {
            const key = log.date;
            if (!map[key]) map[key] = [];
            map[key].push({ ...log, _index: idx });
        });
        return map;
    }, [state.gymLog]);

    // Calendar helpers
    const { year, month } = currentMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = (firstDay.getDay() + 6) % 7; // Monday = 0
    const daysInMonth = lastDay.getDate();

    const monthLabel = firstDay.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

    const prevMonth = () => {
        setCurrentMonth((prev) => {
            const m = prev.month - 1;
            return m < 0 ? { year: prev.year - 1, month: 11 } : { year: prev.year, month: m };
        });
        setSelectedDate(null);
    };

    const nextMonth = () => {
        setCurrentMonth((prev) => {
            const m = prev.month + 1;
            return m > 11 ? { year: prev.year + 1, month: 0 } : { year: prev.year, month: m };
        });
        setSelectedDate(null);
    };

    const calendarDays = [];
    for (let i = 0; i < startDow; i++) calendarDays.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

    const makeDateKey = (day) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const selectedDateKey = selectedDate ? makeDateKey(selectedDate) : null;
    const selectedLogs = selectedDateKey ? (logMap[selectedDateKey] || []) : [];

    // Form helpers
    const addExerciseRow = () => {
        setForm({
            ...form,
            exercises: [...form.exercises, { name: '', sets: '', reps: '', duration: '', weight: '' }],
        });
    };

    const updateExercise = (index, field, value) => {
        const updated = [...form.exercises];
        updated[index] = { ...updated[index], [field]: value };
        setForm({ ...form, exercises: updated });
    };

    const removeExerciseRow = (index) => {
        setForm({
            ...form,
            exercises: form.exercises.filter((_, i) => i !== index),
        });
    };

    const openAdd = () => {
        const dateStr = selectedDateKey || new Date().toISOString().split('T')[0];
        setEditIndex(null);
        setForm({
            date: dateStr,
            exercises: [{ name: '', sets: '', reps: '', duration: '', weight: '' }],
        });
        setShowModal(true);
    };

    const openEdit = (globalIndex) => {
        const log = state.gymLog[globalIndex];
        setEditIndex(globalIndex);
        setForm({
            date: log.date,
            exercises: log.exercises.map((ex) => ({
                name: ex.name,
                sets: ex.sets ? String(ex.sets) : '',
                reps: ex.reps ? String(ex.reps) : '',
                duration: ex.duration || '',
                weight: ex.weight || '',
            })),
        });
        setShowModal(true);
    };

    const handleSave = () => {
        if (!form.date) return;
        const validExercises = form.exercises
            .filter((ex) => ex.name.trim())
            .map((ex) => ({
                name: ex.name.trim(),
                sets: parseInt(ex.sets) || 0,
                reps: parseInt(ex.reps) || 0,
                duration: ex.duration.trim(),
                weight: ex.weight.trim(),
            }));

        if (validExercises.length === 0) return;

        const payload = { date: form.date, exercises: validExercises };

        if (editIndex !== null) {
            dispatch({ type: 'EDIT_GYM_LOG', index: editIndex, payload });
        } else {
            dispatch({ type: 'ADD_GYM_LOG', payload });
        }
        setForm({
            date: '',
            exercises: [{ name: '', sets: '', reps: '', duration: '', weight: '' }],
        });
        setEditIndex(null);
        setShowModal(false);
    };

    const confirmDelete = () => {
        if (deleteIndex !== null) {
            dispatch({ type: 'DELETE_GYM_LOG', index: deleteIndex });
            setDeleteIndex(null);
        }
    };

    const DOW_LABELS = [
        t('day_short_pzt', 'Pzt'), t('day_short_sal', 'Sal'), t('day_short_car', 'Çar'),
        t('day_short_per', 'Per'), t('day_short_cum', 'Cum'), t('day_short_cmt', 'Cmt'), t('day_short_paz', 'Paz')
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t('takip_tab_gym', 'Gym Takip')}</h3>
                <button className="btn btn-primary btn-sm rounded-xl" onClick={openAdd}>
                    {t('gym_btn_add', '+ Antrenman Ekle')}
                </button>
            </div>

            {/* Calendar */}
            <motion.div
                className="card bg-base-200 rounded-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="card-body p-4">
                    {/* Month nav */}
                    <div className="flex items-center justify-between mb-4">
                        <button className="btn btn-ghost btn-sm btn-square rounded-xl" onClick={prevMonth}>
                            ◀
                        </button>
                        <div className="flex items-center justify-center rounded-xl px-4 py-1">
                            <h3 className="font-semibold capitalize text-lg text-center">{monthLabel}</h3>
                        </div>
                        <button className="btn btn-ghost btn-sm btn-square rounded-xl" onClick={nextMonth}>
                            ▶
                        </button>
                    </div>

                    {/* Day of week headers */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                        {DOW_LABELS.map((d) => (
                            <div key={d} className="text-center text-xs text-base-content/40 font-medium py-1">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, i) => {
                            if (day === null) {
                                return <div key={`empty-${i}`} />;
                            }
                            const dateKey = makeDateKey(day);
                            const hasLog = !!logMap[dateKey];
                            const isSelected = selectedDate === day;
                            const isToday =
                                day === new Date().getDate() &&
                                month === new Date().getMonth() &&
                                year === new Date().getFullYear();

                            return (
                                <button
                                    key={day}
                                    className={`
                    py-2 rounded-xl text-sm font-medium transition-all duration-150
                    flex items-center justify-center relative
                    ${isSelected
                                            ? 'bg-primary text-primary-content shadow-md shadow-primary/20'
                                            : hasLog
                                                ? 'bg-primary/15 text-primary hover:bg-primary/25'
                                                : 'hover:bg-base-300'
                                        }
                    ${isToday && !isSelected ? 'ring-1 ring-primary/50' : ''}
                  `}
                                    onClick={() => setSelectedDate(day)}
                                >
                                    {day}
                                    {hasLog && !isSelected && (
                                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </motion.div>

            {/* Selected day detail */}
            <AnimatePresence mode="wait">
                {selectedDate && (
                    <motion.div
                        key={selectedDateKey}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">
                                {new Date(year, month, selectedDate).toLocaleDateString('tr-TR', {
                                    day: 'numeric', month: 'long', year: 'numeric',
                                })}
                            </h4>
                        </div>

                        {selectedLogs.length > 0 ? (
                            <div className="space-y-3">
                                {selectedLogs.map((log, i) => (
                                    <div key={i} className="card bg-base-200 rounded-xl">
                                        <div className="card-body p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm text-base-content/50">
                                                    {log.exercises.length} {t('gym_moves_count', 'hareket')}
                                                </span>
                                                <div className="flex gap-1">
                                                    <button
                                                        className="btn btn-ghost btn-xs text-info"
                                                        style={{ transform: 'scaleX(-1)' }}
                                                        onClick={() => openEdit(log._index)}
                                                    >
                                                        ✎
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost btn-xs text-error"
                                                        onClick={() => setDeleteIndex(log._index)}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="table table-sm">
                                                    <thead>
                                                        <tr>
                                                            <th>{t('gym_move', 'Hareket')}</th>
                                                            <th>{t('gym_sets', 'Set')}</th>
                                                            <th>{t('gym_reps', 'Tekrar')}</th>
                                                            <th>{t('gym_duration', 'Süre')}</th>
                                                            <th>{t('gym_weight', 'Ağırlık')}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {log.exercises.map((ex, j) => (
                                                            <tr key={j}>
                                                                <td className="font-medium">{ex.name}</td>
                                                                <td>{ex.sets || '—'}</td>
                                                                <td>{ex.reps || '—'}</td>
                                                                <td>{ex.duration || '—'}</td>
                                                                <td>{ex.weight || '—'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="card bg-base-200 rounded-xl">
                                <div className="card-body items-center text-center py-8">
                                    <p className="text-base-content/50 text-sm">{t('gym_empty', 'Bu gün için antrenman kaydı yok.')}</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal modal-open">
                    <motion.div
                        className="modal-box rounded-2xl max-w-2xl"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h3 className="font-bold text-lg mb-4">
                            {editIndex !== null ? t('gym_modal_edit', 'Antrenman Düzenle') : t('gym_modal_add', 'Antrenman Ekle')}
                        </h3>
                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">{t('common_date', 'Tarih')}</span></label>
                                <input
                                    type="date"
                                    className="input input-bordered rounded-xl w-full"
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="label-text font-medium">{t('gym_exercises', 'Hareketler')}</label>
                                    <button className="btn btn-ghost btn-xs text-primary" onClick={addExerciseRow}>
                                        {t('gym_add_row', '+ Satır Ekle')}
                                    </button>
                                </div>
                                {form.exercises.map((ex, i) => (
                                    <div key={i} className="grid grid-cols-6 gap-2 items-end">
                                        <div className="col-span-2">
                                            {i === 0 && <label className="label"><span className="label-text text-xs">{t('gym_move', 'Hareket')}</span></label>}
                                            <input
                                                type="text"
                                                className="input input-bordered input-sm rounded-xl w-full"
                                                value={ex.name}
                                                onChange={(e) => updateExercise(i, 'name', e.target.value)}
                                                placeholder={t('gym_name', 'Adı')}
                                            />
                                        </div>
                                        <div>
                                            {i === 0 && <label className="label"><span className="label-text text-xs">{t('gym_sets', 'Set')}</span></label>}
                                            <input
                                                type="number"
                                                className="input input-bordered input-sm rounded-xl w-full"
                                                value={ex.sets}
                                                onChange={(e) => updateExercise(i, 'sets', e.target.value)}
                                                placeholder="4"
                                            />
                                        </div>
                                        <div>
                                            {i === 0 && <label className="label"><span className="label-text text-xs">{t('gym_reps', 'Tekrar')}</span></label>}
                                            <input
                                                type="number"
                                                className="input input-bordered input-sm rounded-xl w-full"
                                                value={ex.reps}
                                                onChange={(e) => updateExercise(i, 'reps', e.target.value)}
                                                placeholder="12"
                                            />
                                        </div>
                                        <div>
                                            {i === 0 && <label className="label"><span className="label-text text-xs">{t('gym_weight', 'Ağırlık')}</span></label>}
                                            <input
                                                type="text"
                                                className="input input-bordered input-sm rounded-xl w-full"
                                                value={ex.weight}
                                                onChange={(e) => updateExercise(i, 'weight', e.target.value)}
                                                placeholder="20 kg"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            {form.exercises.length > 1 && (
                                                <button
                                                    className="btn btn-ghost btn-sm btn-square text-error"
                                                    onClick={() => removeExerciseRow(i)}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-action">
                            <button className="btn btn-ghost rounded-xl" onClick={() => { setShowModal(false); setEditIndex(null); }}>{t('modal_btn_cancel', 'İptal')}</button>
                            <button className="btn btn-primary rounded-xl" onClick={handleSave}>
                                {editIndex !== null ? t('modal_btn_save', 'Kaydet') : t('modal_btn_add', 'Ekle')}
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
                        <h3 className="font-bold text-lg mb-2">{t('common_confirm_delete', 'Silmeyi Onayla')}</h3>
                        <p className="text-sm text-base-content/60">{t('gym_delete_msg', 'Bu antrenman kaydını silmek istediğinize emin misiniz?')}</p>
                        <div className="modal-action">
                            <button className="btn btn-ghost btn-sm rounded-xl" onClick={() => setDeleteIndex(null)}>{t('modal_btn_cancel', 'İptal')}</button>
                            <button className="btn btn-error btn-sm rounded-xl" onClick={confirmDelete}>{t('modal_btn_delete', 'Sil')}</button>
                        </div>
                    </motion.div>
                    <div className="modal-backdrop" onClick={() => setDeleteIndex(null)} />
                </div>
            )}
        </div>
    );
}
