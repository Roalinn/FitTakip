import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import { generateDietPDF } from '../utils/pdfExport';

export default function DiyetProgrami() {
    const { state, dispatch } = useStore();
    const { t } = useTranslation();
    const selectedDay = state.settings.activeProgramDay || 'pazartesi';
    const setSelectedDay = (day) => dispatch({ type: 'SET_SETTINGS', payload: { activeProgramDay: day } });
    const [showModal, setShowModal] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [form, setForm] = useState({ name: '', time: '08:00', foods: '', note: '' });

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
    const meals = state.dietProgram[selectedDay] || [];

    const openAdd = () => {
        setEditIndex(null);
        setForm({ name: '', time: '08:00', foods: '', note: '' });
        setShowModal(true);
    };

    const openEdit = (index) => {
        const meal = meals[index];
        setEditIndex(index);
        setForm({
            name: meal.name,
            time: meal.time || '08:00',
            foods: meal.foods.join(', '),
            note: meal.note || '',
        });
        setShowModal(true);
    };

    const handleSave = () => {
        if (!form.name.trim()) return;
        const payload = {
            name: form.name.trim(),
            time: form.time,
            foods: form.foods.split(',').map((f) => f.trim()).filter(Boolean),
            note: form.note.trim(),
        };

        if (editIndex !== null) {
            dispatch({ type: 'EDIT_DIET_MEAL', day: selectedDay, index: editIndex, payload });
        } else {
            dispatch({ type: 'ADD_DIET_MEAL', day: selectedDay, payload });
        }
        setForm({ name: '', time: '08:00', foods: '', note: '' });
        setEditIndex(null);
        setShowModal(false);
    };

    const handleCopy = () => {
        sessionStorage.setItem('fittakip_copied_diet', JSON.stringify(meals));
    };

    const handlePaste = () => {
        const copied = sessionStorage.getItem('fittakip_copied_diet');
        if (copied) {
            dispatch({ type: 'SET_DIET_PROGRAM', day: selectedDay, payload: JSON.parse(copied) });
        }
    };

    const confirmDelete = () => {
        if (deleteIndex !== null) {
            dispatch({ type: 'DELETE_DIET_MEAL', day: selectedDay, index: deleteIndex });
            setDeleteIndex(null);
        }
    };

    return (
        <div>
            {/* Day tabs */}
            <div className="flex flex-wrap gap-2 mb-5">
                {DAYS_CONFIG.map((day) => (
                    <button
                        key={day.key}
                        className={`btn btn-sm rounded-xl font-medium transition-all duration-200 ${selectedDay === day.key
                            ? 'btn-primary'
                            : 'btn-ghost bg-base-200'
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
                            generateDietPDF(state.dietProgram, dayLabels, t);
                        }}
                        title={t('pdf_export')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </button>
                    <button className="btn btn-ghost bg-base-200 btn-sm btn-square rounded-xl hidden sm:flex" onClick={handleCopy} title="Programı Kopyala">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                    {sessionStorage.getItem('fittakip_copied_diet') && (
                        <button className="btn btn-ghost bg-base-200 btn-sm btn-square rounded-xl hidden sm:flex" onClick={handlePaste} title="Yapıştır">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        </button>
                    )}
                    <button className="btn btn-primary btn-sm rounded-xl flex-1 sm:flex-none" onClick={openAdd}>
                        {t('diet_btn_add', '+ Öğün Ekle')}
                    </button>
                </div>
            </div>

            {meals.length === 0 ? (
                <div className="card bg-base-200 rounded-xl">
                    <div className="card-body items-center text-center py-12 text-base-content/40">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        <p>{t('prog_diyet_empty', 'Bu gün için öğün eklenmemiş.')}</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {meals.map((meal, i) => (
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
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold">{meal.name}</h4>
                                            {meal.time && (
                                                <span className="badge badge-sm badge-outline rounded-lg">{meal.time}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {meal.foods.map((food, j) => (
                                                <span key={j} className="badge badge-sm bg-primary/10 text-primary border-0 rounded-lg">
                                                    {food}
                                                </span>
                                            ))}
                                        </div>
                                        {meal.note && (
                                            <p className="text-xs text-base-content/40 mt-2 italic">{meal.note}</p>
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
                            {editIndex !== null ? t('diet_modal_edit', 'Öğün Düzenle') : t('diet_modal_add', 'Öğün Ekle')} – {currentDayConfig.full}
                        </h3>
                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">{t('diet_meal_name', 'Öğün Adı')}</span></label>
                                <input
                                    type="text"
                                    className="input input-bordered rounded-xl w-full"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder={t('diet_meal_name_ph', 'Kahvaltı, Öğle Yemeği...')}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">{t('diet_time', 'Saat')}</span></label>
                                <div className="flex gap-4 items-center">
                                    {/* Saat */}
                                    <div className="flex-1 flex items-center justify-between bg-base-200 p-1.5 rounded-xl">
                                        <button
                                            className="btn btn-ghost btn-xs btn-circle"
                                            onClick={() => {
                                                let h = form.time ? parseInt(form.time.split(':')[0]) : 8;
                                                let m = form.time ? parseInt(form.time.split(':')[1]) : 0;
                                                h = h === 0 ? 23 : h - 1;
                                                setForm({ ...form, time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` });
                                            }}
                                        >◀</button>
                                        <input
                                            type="text"
                                            className="input input-sm input-ghost text-center text-lg font-bold w-12 px-0 focus:outline-none focus:bg-base-100"
                                            value={form.time ? form.time.split(':')[0] : '08'}
                                            onChange={(e) => {
                                                let val = parseInt(e.target.value);
                                                if (isNaN(val)) val = 0;
                                                if (val < 0) val = 0;
                                                if (val > 23) val = 23;
                                                let m = form.time ? form.time.split(':')[1] : '00';
                                                setForm({ ...form, time: `${String(val).padStart(2, '0')}:${m}` });
                                            }}
                                        />
                                        <button
                                            className="btn btn-ghost btn-xs btn-circle"
                                            onClick={() => {
                                                let h = form.time ? parseInt(form.time.split(':')[0]) : 8;
                                                let m = form.time ? parseInt(form.time.split(':')[1]) : 0;
                                                h = (h + 1) % 24;
                                                setForm({ ...form, time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` });
                                            }}
                                        >▶</button>
                                    </div>
                                    <div className="text-xl font-bold text-base-content/50">:</div>
                                    {/* Dakika */}
                                    <div className="flex-1 flex items-center justify-between bg-base-200 p-1.5 rounded-xl">
                                        <button
                                            className="btn btn-ghost btn-xs btn-circle"
                                            onClick={() => {
                                                let h = form.time ? parseInt(form.time.split(':')[0]) : 8;
                                                let m = form.time ? parseInt(form.time.split(':')[1]) : 0;
                                                m = m === 0 ? 45 : m - 15;
                                                setForm({ ...form, time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` });
                                            }}
                                        >◀</button>
                                        <input
                                            type="text"
                                            className="input input-sm input-ghost text-center text-lg font-bold w-12 px-0 focus:outline-none focus:bg-base-100"
                                            value={form.time ? form.time.split(':')[1] : '00'}
                                            onChange={(e) => {
                                                let val = parseInt(e.target.value);
                                                if (isNaN(val)) val = 0;
                                                if (val < 0) val = 0;
                                                if (val > 59) val = 59;
                                                let h = form.time ? form.time.split(':')[0] : '08';
                                                setForm({ ...form, time: `${h}:${String(val).padStart(2, '0')}` });
                                            }}
                                        />
                                        <button
                                            className="btn btn-ghost btn-xs btn-circle"
                                            onClick={() => {
                                                let h = form.time ? parseInt(form.time.split(':')[0]) : 8;
                                                let m = form.time ? parseInt(form.time.split(':')[1]) : 0;
                                                m = (m + 15) % 60;
                                                setForm({ ...form, time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` });
                                            }}
                                        >▶</button>
                                    </div>
                                </div>
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">{t('diet_foods', 'Besinler (virgülle ayırın)')}</span></label>
                                <textarea
                                    className="textarea textarea-bordered rounded-xl w-full"
                                    value={form.foods}
                                    onChange={(e) => setForm({ ...form, foods: e.target.value })}
                                    placeholder={t('diet_foods_ph', 'Yumurta, Peynir, Ekmek, Çay...')}
                                    rows={3}
                                />
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

            {/* Delete Confirmation Modal */}
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
                            "<span className="font-medium text-base-content">{meals[deleteIndex]?.name}</span>" {t('diet_delete_msg', 'öğününü silmek istediğinize emin misiniz?')}
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
