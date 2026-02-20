import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';

const MOOD_OPTIONS = [
    { emoji: '😄', label: 'Harika', value: 5 },
    { emoji: '🙂', label: 'İyi', value: 4 },
    { emoji: '😐', label: 'Normal', value: 3 },
    { emoji: '😔', label: 'Kötü', value: 2 },
    { emoji: '😩', label: 'Çok Kötü', value: 1 },
];

const ENERGY_OPTIONS = [
    { emoji: '⚡', label: 'Yüksek', value: 3 },
    { emoji: '🔋', label: 'Normal', value: 2 },
    { emoji: '🪫', label: 'Düşük', value: 1 },
];

export default function Gunluk() {
    const { state, dispatch } = useStore();
    const { t } = useTranslation();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showModal, setShowModal] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [deleteIndex, setDeleteIndex] = useState(null);

    const [form, setForm] = useState({
        date: selectedDate,
        mood: 3,
        energy: 2,
        note: '',
    });

    const journal = state.journal || [];

    // Get entries sorted by date (newest first)
    const sortedEntries = useMemo(() => {
        return [...journal].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [journal]);

    // Today's entry
    const todayKey = new Date().toISOString().split('T')[0];
    const todayEntry = journal.find(j => j.date === todayKey);

    const openAdd = () => {
        setEditIndex(null);
        setForm({
            date: selectedDate,
            mood: 3,
            energy: 2,
            note: '',
        });
        setShowModal(true);
    };

    const openEdit = (index) => {
        const entry = journal[index];
        setEditIndex(index);
        setForm({
            date: entry.date,
            mood: entry.mood,
            energy: entry.energy,
            note: entry.note || '',
        });
        setShowModal(true);
    };

    const handleSave = () => {
        if (!form.date) return;
        const payload = {
            date: form.date,
            mood: form.mood,
            energy: form.energy,
            note: form.note.trim(),
        };

        if (editIndex !== null) {
            dispatch({ type: 'EDIT_JOURNAL', index: editIndex, payload });
        } else {
            dispatch({ type: 'ADD_JOURNAL', payload });
        }
        setShowModal(false);
        setEditIndex(null);
    };

    const confirmDelete = () => {
        if (deleteIndex !== null) {
            dispatch({ type: 'DELETE_JOURNAL', index: deleteIndex });
            setDeleteIndex(null);
        }
    };

    const getMood = (val) => MOOD_OPTIONS.find(m => m.value === val) || MOOD_OPTIONS[2];
    const getEnergy = (val) => ENERGY_OPTIONS.find(e => e.value === val) || ENERGY_OPTIONS[1];

    // Last 7 days mood trend
    const last7Moods = useMemo(() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            const entry = journal.find(j => j.date === key);
            days.push({
                label: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
                mood: entry ? entry.mood : 0,
                isToday: i === 0,
            });
        }
        return days;
    }, [journal]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">{t('gunluk_title', 'Günlük')}</h3>
                    <p className="text-xs text-base-content/40 mt-0.5">{t('gunluk_desc', 'Günlük notlarını ve ruh halini kaydet')}</p>
                </div>
                <button className="btn btn-primary btn-sm rounded-xl" onClick={openAdd}>
                    + {t('gunluk_add', 'Yeni Kayıt')}
                </button>
            </div>

            {/* Today's mood summary */}
            {todayEntry && (
                <motion.div
                    className="card bg-base-200 rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{getMood(todayEntry.mood).emoji}</span>
                                <div>
                                    <p className="text-sm font-medium">{t('gunluk_today', 'Bugün')}: {getMood(todayEntry.mood).label}</p>
                                    <p className="text-xs text-base-content/50">
                                        {t('gunluk_energy', 'Enerji')}: {getEnergy(todayEntry.energy).emoji} {getEnergy(todayEntry.energy).label}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {todayEntry.note && (
                            <p className="text-sm text-base-content/60 mt-2 border-t border-base-300 pt-2 italic">
                                "{todayEntry.note}"
                            </p>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Last 7 days mood dots */}
            <motion.div
                className="card bg-base-200 rounded-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="card-body p-4">
                    <h4 className="font-semibold text-sm mb-3">{t('gunluk_mood_7', 'Son 7 Gün Ruh Hali')}</h4>
                    <div className="flex justify-between gap-2">
                        {last7Moods.map((day, i) => (
                            <div key={i} className="flex-1 text-center">
                                <div className="text-2xl mb-1">
                                    {day.mood > 0 ? getMood(day.mood).emoji : '·'}
                                </div>
                                <p className={`text-xs ${day.isToday ? 'font-bold text-primary' : 'text-base-content/40'}`}>
                                    {day.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Journal Entries */}
            <div className="space-y-3">
                <h4 className="font-semibold text-sm">{t('gunluk_entries', 'Kayıtlar')}</h4>
                {sortedEntries.length > 0 ? (
                    sortedEntries.map((entry, i) => {
                        const globalIndex = journal.indexOf(entry);
                        return (
                            <motion.div
                                key={i}
                                className="card bg-base-200 rounded-xl"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                            >
                                <div className="card-body p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{getMood(entry.mood).emoji}</span>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {new Date(entry.date).toLocaleDateString('tr-TR', {
                                                        day: 'numeric', month: 'long', year: 'numeric', weekday: 'long'
                                                    })}
                                                </p>
                                                <p className="text-xs text-base-content/50">
                                                    {getMood(entry.mood).label} · {getEnergy(entry.energy).emoji} {getEnergy(entry.energy).label}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                className="btn btn-ghost btn-xs text-info"
                                                style={{ transform: 'scaleX(-1)' }}
                                                onClick={() => openEdit(globalIndex)}
                                            >
                                                ✎
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-xs text-error"
                                                onClick={() => setDeleteIndex(globalIndex)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                    {entry.note && (
                                        <p className="text-sm text-base-content/60 mt-2 border-t border-base-300 pt-2">
                                            {entry.note}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="card bg-base-200 rounded-xl">
                        <div className="card-body items-center text-center py-8 text-base-content/40">
                            <span className="text-4xl mb-2">📝</span>
                            <p className="text-sm font-medium">{t('gunluk_empty', 'Henüz günlük kaydı yok.')}</p>
                            <p className="text-xs">{t('gunluk_empty_desc', 'Bugün nasıl hissettiğini kaydet!')}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal modal-open">
                    <motion.div
                        className="modal-box rounded-2xl max-w-md"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h3 className="font-bold text-lg mb-4">
                            {editIndex !== null ? t('gunluk_edit', 'Kaydı Düzenle') : t('gunluk_new', 'Yeni Günlük Kaydı')}
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

                            {/* Mood selector */}
                            <div className="form-control">
                                <label className="label"><span className="label-text">{t('gunluk_mood', 'Ruh Hali')}</span></label>
                                <div className="flex justify-between gap-2">
                                    {MOOD_OPTIONS.map((m) => (
                                        <button
                                            key={m.value}
                                            className={`flex-1 btn btn-sm rounded-xl flex flex-col items-center gap-0.5 h-auto py-2 ${form.mood === m.value ? 'btn-primary' : 'btn-ghost bg-base-200'
                                                }`}
                                            onClick={() => setForm({ ...form, mood: m.value })}
                                        >
                                            <span className="text-xl">{m.emoji}</span>
                                            <span className="text-xs">{m.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Energy selector */}
                            <div className="form-control">
                                <label className="label"><span className="label-text">{t('gunluk_energy', 'Enerji')}</span></label>
                                <div className="flex justify-between gap-2">
                                    {ENERGY_OPTIONS.map((e) => (
                                        <button
                                            key={e.value}
                                            className={`flex-1 btn btn-sm rounded-xl flex flex-col items-center gap-0.5 h-auto py-2 ${form.energy === e.value ? 'btn-primary' : 'btn-ghost bg-base-200'
                                                }`}
                                            onClick={() => setForm({ ...form, energy: e.value })}
                                        >
                                            <span className="text-xl">{e.emoji}</span>
                                            <span className="text-xs">{e.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Note */}
                            <div className="form-control">
                                <label className="label"><span className="label-text">{t('gunluk_note', 'Not')}</span></label>
                                <textarea
                                    className="textarea textarea-bordered rounded-xl w-full h-28 resize-none"
                                    placeholder={t('gunluk_note_placeholder', 'Bugün nasıl hissediyorsun? Ne yaptın?')}
                                    value={form.note}
                                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-action">
                            <button className="btn btn-ghost rounded-xl" onClick={() => { setShowModal(false); setEditIndex(null); }}>
                                {t('modal_btn_cancel', 'İptal')}
                            </button>
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
                        <p className="text-sm text-base-content/60">{t('gunluk_delete_msg', 'Bu günlük kaydını silmek istediğinize emin misiniz?')}</p>
                        <div className="modal-action">
                            <button className="btn btn-ghost btn-sm rounded-xl" onClick={() => setDeleteIndex(null)}>
                                {t('modal_btn_cancel', 'İptal')}
                            </button>
                            <button className="btn btn-error btn-sm rounded-xl" onClick={confirmDelete}>
                                {t('modal_btn_delete', 'Sil')}
                            </button>
                        </div>
                    </motion.div>
                    <div className="modal-backdrop" onClick={() => setDeleteIndex(null)} />
                </div>
            )}
        </div>
    );
}
