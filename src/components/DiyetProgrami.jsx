import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';


export default function DiyetProgrami() {
    const { state, dispatch } = useStore();
    const { t } = useTranslation();
    const [selectedDay, setSelectedDay] = useState('pazartesi');
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
        setForm({ name: '', time: '', foods: '', note: '' });
        setEditIndex(null);
        setShowModal(false);
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

            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{currentDayConfig.full}</h3>
                <button className="btn btn-primary btn-sm rounded-xl" onClick={openAdd}>
                    {t('diet_btn_add', '+ Öğün Ekle')}
                </button>
            </div>

            {/* Meals list */}
            {meals.length === 0 ? (
                <div className="card bg-base-200 rounded-xl">
                    <div className="card-body items-center text-center py-12">
                        <p className="text-base-content/50">{t('prog_diyet_empty', 'Bu gün için öğün eklenmemiş.')}</p>
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
                                <div className="flex gap-2 isolate pt-1">
                                    {/* Saat */}
                                    <div className="flex-1 flex flex-col items-center bg-base-200 p-2 rounded-xl">
                                        <button
                                            className="btn btn-ghost btn-xs btn-circle"
                                            onClick={() => {
                                                let h = form.time ? parseInt(form.time.split(':')[0]) : 8;
                                                let m = form.time ? parseInt(form.time.split(':')[1]) : 0;
                                                h = (h + 1) % 24;
                                                setForm({ ...form, time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` });
                                            }}
                                        >▲</button>
                                        <div className="text-xl font-bold my-1">
                                            {form.time ? form.time.split(':')[0] : '08'}
                                        </div>
                                        <button
                                            className="btn btn-ghost btn-xs btn-circle"
                                            onClick={() => {
                                                let h = form.time ? parseInt(form.time.split(':')[0]) : 8;
                                                let m = form.time ? parseInt(form.time.split(':')[1]) : 0;
                                                h = h === 0 ? 23 : h - 1;
                                                setForm({ ...form, time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` });
                                            }}
                                        >▼</button>
                                    </div>
                                    <div className="flex items-center text-xl font-bold pb-1 text-base-content/50">:</div>
                                    {/* Dakika */}
                                    <div className="flex-1 flex flex-col items-center bg-base-200 p-2 rounded-xl">
                                        <button
                                            className="btn btn-ghost btn-xs btn-circle"
                                            onClick={() => {
                                                let h = form.time ? parseInt(form.time.split(':')[0]) : 8;
                                                let m = form.time ? parseInt(form.time.split(':')[1]) : 0;
                                                m = (m + 15) % 60;
                                                setForm({ ...form, time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` });
                                            }}
                                        >▲</button>
                                        <div className="text-xl font-bold my-1">
                                            {form.time ? form.time.split(':')[1] : '00'}
                                        </div>
                                        <button
                                            className="btn btn-ghost btn-xs btn-circle"
                                            onClick={() => {
                                                let h = form.time ? parseInt(form.time.split(':')[0]) : 8;
                                                let m = form.time ? parseInt(form.time.split(':')[1]) : 0;
                                                m = m === 0 ? 45 : m - 15;
                                                setForm({ ...form, time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` });
                                            }}
                                        >▼</button>
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
