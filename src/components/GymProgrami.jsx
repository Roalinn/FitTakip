import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import { generateGymPDF } from '../utils/pdfExport';
import { useHardwareBack } from '../hooks/useHardwareBack';

export default function GymProgrami() {
    const { state, dispatch } = useStore();
    const { t } = useTranslation();
    const selectedDay = state.settings.activeProgramDay || 'pazartesi';
    const setSelectedDay = (day) => dispatch({ type: 'SET_SETTINGS', payload: { activeProgramDay: day } });
    const [showModal, setShowModal] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [form, setForm] = useState({ type: 'weight', name: '', sets: '', reps: '', duration: '', distance: '', speed: '', note: '' });

    useHardwareBack(showModal, () => setShowModal(false));
    useHardwareBack(deleteIndex !== null, () => setDeleteIndex(null));

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

    const openAdd = (type = 'weight') => {
        setEditIndex(null);
        setForm({ type, name: '', sets: '', reps: '', duration: '', distance: '', speed: '', note: '' });
        setShowModal(true);
    };

    const openEdit = (index) => {
        const ex = exercises[index];
        setEditIndex(index);
        setForm({
            type: ex.type || 'weight',
            name: ex.name,
            sets: ex.sets ? String(ex.sets) : '',
            reps: ex.reps ? String(ex.reps) : '',
            duration: ex.duration ? String(ex.duration) : '',
            distance: ex.distance ? String(ex.distance) : '',
            speed: ex.speed ? String(ex.speed) : '',
            note: ex.note || '',
        });
        setShowModal(true);
    };

    const handleSave = () => {
        if (!form.name.trim()) return;
        const payload = {
            type: form.type,
            name: form.name.trim(),
            sets: parseInt(form.sets) || 0,
            reps: parseInt(form.reps) || 0,
            duration: parseInt(form.duration) || 0,
            distance: parseFloat(form.distance) || 0,
            speed: parseFloat(form.speed) || 0,
            note: form.note.trim(),
        };

        if (editIndex !== null) {
            dispatch({ type: 'EDIT_GYM_EXERCISE', day: selectedDay, index: editIndex, payload });
        } else {
            dispatch({ type: 'ADD_GYM_EXERCISE', day: selectedDay, payload });
        }
        setForm({ type: 'weight', name: '', sets: '', reps: '', duration: '', distance: '', speed: '', note: '' });
        setEditIndex(null);
        setShowModal(false);
    };

    const handleCopy = () => {
        sessionStorage.setItem('fittakip_copied_gym', JSON.stringify(exercises));
    };

    const handlePaste = () => {
        const copied = sessionStorage.getItem('fittakip_copied_gym');
        if (copied) {
            dispatch({ type: 'SET_GYM_PROGRAM', day: selectedDay, payload: JSON.parse(copied) });
        } else {
            alert(t('common_no_copied', 'Kopyalanmış program bulunamadı. Lütfen önce başka bir günü kopyalayın.'));
        }
    };

    const confirmDelete = () => {
        if (deleteIndex !== null) {
            dispatch({ type: 'DELETE_GYM_EXERCISE', day: selectedDay, index: deleteIndex });
            setDeleteIndex(null);
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

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    {currentDayConfig.full}
                </h3>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button
                        className="btn btn-ghost bg-base-200 btn-sm btn-square rounded-xl"
                        onClick={() => {
                            const dayLabels = {};
                            DAYS_CONFIG.forEach(d => dayLabels[d.key] = d.full);
                            generateGymPDF(state.gymProgram, dayLabels, t);
                        }}
                        title={t('pdf_export')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </button>
                    <button className="btn btn-ghost bg-base-200 btn-sm btn-square rounded-xl" onClick={handleCopy} title="Programı Kopyala">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                    <button className="btn btn-ghost bg-base-200 btn-sm btn-square rounded-xl" onClick={handlePaste} title="Yapıştır">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </button>
                    <button className="btn btn-secondary btn-sm rounded-xl flex-1 sm:flex-none" onClick={() => openAdd('cardio')}>
                        + {t('gym_btn_cardio_add', 'Kardiyo')}
                    </button>
                    <button className="btn btn-primary btn-sm rounded-xl flex-1 sm:flex-none" onClick={() => openAdd('weight')}>
                        + {t('gym_btn_add_ext', 'Antrenman')}
                    </button>
                </div>
            </div>

            {exercises.length === 0 ? (
                <div className="card bg-base-200 rounded-xl">
                    <div className="card-body items-center text-center py-12 text-base-content/40">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h4v4H3v-4zm14 0h4v4h-4v-4zM7 11h10v2H7v-2zM4 6h2v12H4V6zm14 0h2v12h-2V6z" />
                        </svg>
                        <p>{t('prog_gym_empty', 'Bu gün için hareket eklenmemiş.')}</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {exercises.map((ex, i) => {
                        const isCardio = ex.type === 'cardio';
                        return (
                            <motion.div
                                key={i}
                                className="card bg-base-200 rounded-xl overflow-hidden relative"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${isCardio ? 'bg-secondary' : 'bg-primary'}`}></div>
                                <div className="card-body p-4 pl-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold mb-2">
                                                {ex.name}
                                            </h4>
                                            <div className="flex flex-wrap gap-2 mt-1 mb-2">
                                                {isCardio ? (
                                                    <div className="flex flex-wrap gap-2 text-sm text-base-content/80">
                                                        {ex.distance > 0 && <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded-lg">{ex.distance} km</span>}
                                                        {ex.duration > 0 && <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded-lg">{ex.duration} dk</span>}
                                                        {ex.speed > 0 && <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded-lg">{ex.speed} km/s</span>}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2 text-sm text-base-content/80">
                                                        {ex.sets > 0 && <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-lg">{ex.sets} {t('gym_sets', 'Set')}</span>}
                                                        {ex.reps > 0 && <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-lg">{ex.reps} {t('gym_reps', 'Tekrar')}</span>}
                                                    </div>
                                                )}
                                            </div>
                                            {ex.note && (
                                                <p className="text-xs text-base-content/50 mt-1 italic">{ex.note}</p>
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
                        );
                    })}
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
                            {editIndex !== null
                                ? (form.type === 'cardio' ? t('gym_modal_edit_cardio', 'Kardiyo Düzenle') : t('gym_modal_edit', 'Hareket Düzenle'))
                                : (form.type === 'cardio' ? t('gym_modal_add_cardio', 'Kardiyo Ekle') : t('gym_modal_add', 'Hareket Ekle'))
                            } – {currentDayConfig.full}
                        </h3>
                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">{t('gym_move_name', 'Hareket Adı')}</span></label>
                                <input
                                    type="text"
                                    className="input input-bordered rounded-xl w-full"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder={form.type === 'cardio' ? "Koşu, Yüzme..." : "Bench Press, Squat..."}
                                />
                            </div>

                            {form.type === 'cardio' ? (
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="form-control">
                                        <label className="label"><span className="label-text">{t('gym_dist', 'Mesafe')}</span></label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="input input-bordered rounded-xl w-full"
                                            value={form.distance}
                                            onChange={(e) => setForm({ ...form, distance: e.target.value })}
                                            placeholder="km"
                                        />
                                    </div>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text">{t('gym_duration_min', 'Süre')}</span></label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            className="input input-bordered rounded-xl w-full"
                                            value={form.duration}
                                            onChange={handleNumericInput('duration')}
                                            placeholder="dk"
                                        />
                                    </div>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text">{t('gym_spd', 'Ort Hız')}</span></label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="input input-bordered rounded-xl w-full"
                                            value={form.speed}
                                            onChange={(e) => setForm({ ...form, speed: e.target.value })}
                                            placeholder="km/s"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
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
                                </div>
                            )}

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
