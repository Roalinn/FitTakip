import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import ExerciseProgress from './ExerciseProgress';

export default function GymTakip() {
    const { state, dispatch } = useStore();
    const { t } = useTranslation();
    const [subTab, setSubTab] = useState('takip');
    const [showModal, setShowModal] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [showTemplateSave, setShowTemplateSave] = useState(false);
    const [templateName, setTemplateName] = useState('');
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

    // Templates
    const templates = state.gymTemplates || [];

    const saveTemplate = () => {
        if (!templateName.trim()) return;
        const validExercises = form.exercises.filter(ex => ex.name.trim());
        if (validExercises.length === 0) return;
        dispatch({
            type: 'SAVE_GYM_TEMPLATE',
            payload: { name: templateName.trim(), exercises: validExercises },
        });
        setTemplateName('');
        setShowTemplateSave(false);
    };

    const loadTemplate = (tmpl) => {
        setForm({
            ...form,
            exercises: tmpl.exercises.map(ex => ({
                name: ex.name,
                sets: ex.sets ? String(ex.sets) : '',
                reps: ex.reps ? String(ex.reps) : '',
                duration: ex.duration || '',
                weight: ex.weight || '',
            })),
        });
    };

    const deleteTemplate = (index) => {
        dispatch({ type: 'DELETE_GYM_TEMPLATE', index });
    };

    const DOW_LABELS = [
        t('day_short_pzt', 'Pzt'), t('day_short_sal', 'Sal'), t('day_short_car', 'Çar'),
        t('day_short_per', 'Per'), t('day_short_cum', 'Cum'), t('day_short_cmt', 'Cmt'), t('day_short_paz', 'Paz')
    ];

    return (
        <div className="space-y-6">
            {/* Sub-tabs */}
            <div className="flex items-center justify-between">
                <div role="tablist" className="tabs tabs-boxed bg-base-200 rounded-xl p-1 inline-flex">
                    <button
                        role="tab"
                        className={`tab rounded-lg font-medium transition-all duration-200 ${subTab === 'takip' ? 'tab-active bg-primary text-primary-content' : ''}`}
                        onClick={() => setSubTab('takip')}
                    >
                        {t('takip_tab_gym', 'Gym Takip')}
                    </button>
                    <button
                        role="tab"
                        className={`tab rounded-lg font-medium transition-all duration-200 ${subTab === 'gelisim' ? 'tab-active bg-primary text-primary-content' : ''}`}
                        onClick={() => setSubTab('gelisim')}
                    >
                        {t('exercise_progress_title', 'Gym Gelişim')}
                    </button>
                </div>
                {subTab === 'takip' && (
                    <button className="btn btn-primary btn-sm rounded-xl" onClick={openAdd}>
                        {t('gym_btn_add', '+ Antrenman Ekle')}
                    </button>
                )}
            </div>

            {subTab === 'gelisim' ? (
                <ExerciseProgress />
            ) : (
                <>
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
                                    <div className="card bg-base-200 rounded-xl">
                                        <div className="card-body p-4">
                                            <div className="overflow-x-auto">
                                                <table className="table table-sm">
                                                    <thead>
                                                        <tr>
                                                            <th>{t('gym_move', 'Hareket')}</th>
                                                            <th>{t('gym_sets', 'Set')}</th>
                                                            <th>{t('gym_reps', 'Tekrar')}</th>
                                                            <th>{t('gym_weight', 'Ağırlık')}</th>
                                                            <th>{t('gym_duration', 'Süre')}</th>
                                                            <th></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedLogs.flatMap(log =>
                                                            log.exercises.map((ex, j) => (
                                                                <tr key={`${log._index}-${j}`}>
                                                                    <td className="font-medium">{ex.name}</td>
                                                                    <td>{ex.sets || '—'}</td>
                                                                    <td>{ex.reps || '—'}</td>
                                                                    <td>{ex.weight || '—'}</td>
                                                                    <td>{ex.duration ? `${ex.duration} dk` : '—'}</td>
                                                                    <td className="text-right">
                                                                        {j === 0 && (
                                                                            <div className="flex gap-1 justify-end">
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
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="card bg-base-200 rounded-xl">
                                        <div className="card-body items-center text-center py-8 text-base-content/40">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h4v4H3v-4zm14 0h4v4h-4v-4zM7 11h10v2H7v-2zM4 6h2v12H4V6zm14 0h2v12h-2V6z" />
                                            </svg>
                                            <p className="text-sm font-medium">{t('gym_empty', 'Bu gün için antrenman kaydı yok.')}</p>
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

                                    {/* Templates */}
                                    {templates.length > 0 && (
                                        <div>
                                            <label className="label"><span className="label-text text-xs">{t('gym_templates', 'Şablonlar')}</span></label>
                                            <div className="flex flex-wrap gap-2">
                                                {templates.map((tmpl, i) => (
                                                    <button
                                                        key={i}
                                                        className="btn btn-sm btn-ghost bg-base-200 rounded-xl group"
                                                        onClick={() => loadTemplate(tmpl)}
                                                    >
                                                        📋 {tmpl.name}
                                                        <span
                                                            className="text-error opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                                                            onClick={(e) => { e.stopPropagation(); deleteTemplate(i); }}
                                                        >
                                                            ✕
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="label-text font-medium">{t('gym_exercises', 'Hareketler')}</label>
                                            <button className="btn btn-ghost btn-xs text-primary" onClick={addExerciseRow}>
                                                {t('gym_add_row', '+ Satır Ekle')}
                                            </button>
                                        </div>
                                        {form.exercises.map((ex, i) => (
                                            <div key={i} className="grid grid-cols-7 gap-2 items-end">
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
                                                        placeholder="kg"
                                                    />
                                                </div>
                                                <div>
                                                    {i === 0 && <label className="label"><span className="label-text text-xs">{t('gym_duration', 'Süre')}</span></label>}
                                                    <input
                                                        type="number"
                                                        className="input input-bordered input-sm rounded-xl w-full"
                                                        value={ex.duration}
                                                        onChange={(e) => updateExercise(i, 'duration', e.target.value)}
                                                        placeholder="dk"
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

                                {/* Save as template */}
                                {showTemplateSave ? (
                                    <div className="flex items-center gap-2 mt-2">
                                        <input
                                            type="text"
                                            className="input input-bordered input-sm rounded-xl flex-1"
                                            placeholder={t('gym_template_name', 'Şablon adı...')}
                                            value={templateName}
                                            onChange={(e) => setTemplateName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && saveTemplate()}
                                        />
                                        <button className="btn btn-sm btn-primary rounded-xl" onClick={saveTemplate}>
                                            {t('modal_btn_save', 'Kaydet')}
                                        </button>
                                        <button className="btn btn-sm btn-ghost rounded-xl" onClick={() => setShowTemplateSave(false)}>
                                            {t('modal_btn_cancel', 'İptal')}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        className="btn btn-ghost btn-sm text-base-content/50 mt-2"
                                        onClick={() => setShowTemplateSave(true)}
                                    >
                                        📋 {t('gym_save_template', 'Şablon Olarak Kaydet')}
                                    </button>
                                )}

                                <div className="modal-action">
                                    <button className="btn btn-ghost rounded-xl" onClick={() => { setShowModal(false); setEditIndex(null); setShowTemplateSave(false); }}>{t('modal_btn_cancel', 'İptal')}</button>
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

                </>)}
        </div>
    );
}
