import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import { showToast } from '../utils/toast';

export default function GymProgrami() {
    const { state, dispatch } = useStore();
    const { t } = useTranslation();
    const [selectedDay, setSelectedDay] = useState('pazartesi');
    const [showModal, setShowModal] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [form, setForm] = useState({ name: '', sets: '', reps: '', duration: '', note: '' });

    const DAYS_CONFIG = [
        { key: 'pazartesi', label: t('day_short_pzt', 'Pzt'), full: t('day_full_pzt', 'Pazartesi') },
        { key: 'sali', label: t('day_short_sal', 'Sal'), full: t('day_full_sal', 'Salı') },
        { key: 'carsamba', label: t('day_short_car', 'Çar'), full: t('day_full_car', 'Çarşamba') },
        { key: 'persembe', label: t('day_short_per', 'Per'), full: t('day_full_per', 'Perşembe') },
        { key: 'cuma', label: t('day_short_cum', 'Cum'), full: t('day_full_cum', 'Cuma') },
        { key: 'cumartesi', label: t('day_short_cmt', 'Cmt'), full: t('day_full_cmt', 'Cumartesi') },
        { key: 'pazar', label: t('day_short_paz', 'Paz'), full: t('day_full_paz', 'Pazar') },
    ];

    const currentDayConfig = DAYS_CONFIG.find(d => d.key === selectedDay);
    const exercises = state.gymProgram[selectedDay] || [];

    const openAdd = () => {
        setEditIndex(null);
        setForm({ name: '', sets: '', reps: '', duration: '', note: '' });
        setShowModal(true);
    };

    const openEdit = (index) => {
        const ex = exercises[index];
        setEditIndex(index);
        setForm({
            name: ex.name,
            sets: ex.sets ? String(ex.sets) : '',
            reps: ex.reps ? String(ex.reps) : '',
            duration: ex.duration ? String(ex.duration) : '',
            note: ex.note || '',
        });
        setShowModal(true);
    };

    const handleSave = () => {
        if (!form.name.trim()) return;
        const payload = {
            name: form.name.trim(),
            sets: parseInt(form.sets) || 0,
            reps: parseInt(form.reps) || 0,
            duration: parseInt(form.duration) || 0,
            note: form.note.trim(),
        };

        if (editIndex !== null) {
            dispatch({ type: 'EDIT_GYM_EXERCISE', day: selectedDay, index: editIndex, payload });
        } else {
            dispatch({ type: 'ADD_GYM_EXERCISE', day: selectedDay, payload });
        }
        setForm({ name: '', sets: '', reps: '', duration: '', note: '' });
        setEditIndex(null);
        setShowModal(false);
        showToast(editIndex !== null ? t('toast_updated', 'Kayıt güncellendi') : t('toast_added', 'Kayıt başarıyla eklendi'), 'success');
    };

    const handleCopy = () => {
        sessionStorage.setItem('fittakip_copied_gym', JSON.stringify(exercises));
        showToast(t('toast_copied', 'Program başarıyla kopyalandı'), 'success');
    };

    const handlePaste = () => {
        const copied = sessionStorage.getItem('fittakip_copied_gym');
        if (copied) {
            dispatch({ type: 'SET_GYM_PROGRAM', day: selectedDay, payload: JSON.parse(copied) });
            showToast(t('toast_updated', 'Kayıt güncellendi'), 'success');
        }
    };

    const confirmDelete = () => {
        if (deleteIndex !== null) {
            dispatch({ type: 'DELETE_GYM_EXERCISE', day: selectedDay, index: deleteIndex });
            setDeleteIndex(null);
            showToast(t('toast_deleted', 'Kayıt silindi'), 'success');
        }
    };

    // Only allow numeric input
    const handleNumericInput = (field) => (e) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        setForm({ ...form, [field]: val });
    };

    return (
        <div>
            {/* Day tabs */}
            <div className="flex flex-wrap gap-2 mb-5">
                {DAYS_CONFIG.map((day) => (
                    <button
                        key={day.key}
                        className={`btn btn-sm rounded-xl font-medium transition-all duration-200 ${selectedDay === day.key ? 'btn-primary' : 'btn-ghost bg-base-200'
                            }`}
                        onClick={() => setSelectedDay(day.key)}
                    >
                        {day.label}
                    </button>
                ))}
            </div>

            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    {currentDayConfig.full}
                </h3>
                <div className="flex items-center gap-2">
                    <button className="btn btn-ghost bg-base-200 btn-sm btn-square rounded-xl" onClick={handleCopy} title="Programı Kopyala">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                    {sessionStorage.getItem('fittakip_copied_gym') && (
                        <button className="btn btn-ghost bg-base-200 btn-sm btn-square rounded-xl" onClick={handlePaste} title="Yapıştır">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        </button>
                    )}
                    <button className="btn btn-primary btn-sm rounded-xl" onClick={openAdd}>
                        {t('gym_btn_add', '+ Hareket Ekle')}
                    </button>
                </div>
            </div>

            {exercises.length === 0 ? (
                <div className="card bg-base-200 rounded-xl">
                    <div className="card-body items-center text-center py-12 text-base-content/40">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                        <p>{t('prog_gym_empty', 'Bu gün için hareket eklenmemiş.')}</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {exercises.map((ex, i) => (
                        <motion.div
                            key={i}
                            className="card bg-base-200 rounded-xl"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <div className="card-body p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold mb-2">{ex.name}</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {ex.sets > 0 && (
                                                <span className="badge badge-sm bg-primary/10 text-primary border-0 rounded-lg">
                                                    {ex.sets} {t('gym_sets', 'Set')}
                                                </span>
                                            )}
                                            {ex.reps > 0 && (
                                                <span className="badge badge-sm bg-info/10 text-info border-0 rounded-lg">
                                                    {ex.reps} {t('gym_reps', 'Tekrar')}
                                                </span>
                                            )}
                                            {ex.duration > 0 && (
                                                <span className="badge badge-sm bg-warning/10 text-warning border-0 rounded-lg">
                                                    {ex.duration} {t('gym_min', 'Dakika')}
                                                </span>
                                            )}
                                        </div>
                                        {ex.note && (
                                            <p className="text-xs text-base-content/40 mt-2 italic">{ex.note}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 ml-2">
                                        <button
                                            className="btn btn-ghost btn-xs text-info"
                                            style={{ transform: 'scaleX(-1)' }}
                                            onClick={() => openEdit(i)}
                                            title={t('modal_btn_edit', 'Düzenle')}
                                        >
                                            ✎
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-xs text-error"
                                            onClick={() => setDeleteIndex(i)}
                                            title={t('modal_btn_delete', 'Sil')}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal modal-open">
                    <motion.div
                        className="modal-box rounded-2xl"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h3 className="font-bold text-lg mb-4">
                            {editIndex !== null ? t('gym_modal_edit', 'Hareket Düzenle') : t('gym_modal_add', 'Hareket Ekle')} – {currentDayConfig.full}
                        </h3>
                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">{t('gym_move_name', 'Hareket Adı')}</span></label>
                                <input
                                    type="text"
                                    className="input input-bordered rounded-xl w-full"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Bench Press, Squat..."
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="form-control">
                                    <label className="label"><span className="label-text">{t('gym_sets', 'Set')}</span></label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        className="input input-bordered rounded-xl w-full"
                                        value={form.sets}
                                        onChange={handleNumericInput('sets')}
                                        placeholder="4"
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text">{t('gym_reps', 'Tekrar')}</span></label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        className="input input-bordered rounded-xl w-full"
                                        value={form.reps}
                                        onChange={handleNumericInput('reps')}
                                        placeholder="12"
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text">{t('gym_duration_min', 'Süre (dk)')}</span></label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        className="input input-bordered rounded-xl w-full"
                                        value={form.duration}
                                        onChange={handleNumericInput('duration')}
                                        placeholder="5"
                                    />
                                </div>
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">{t('foto_note', 'Not (opsiyonel)')}</span></label>
                                <input
                                    type="text"
                                    className="input input-bordered rounded-xl w-full"
                                    value={form.note}
                                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                                    placeholder={t('diet_note_ph', 'Ekstra bilgi...')}
                                />
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
                        <p className="text-sm text-base-content/60">
                            "<span className="font-medium text-base-content">{exercises[deleteIndex]?.name}</span>" {t('gym_prog_delete_msg', 'hareketini silmek istediğinize emin misiniz?')}
                        </p>
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
