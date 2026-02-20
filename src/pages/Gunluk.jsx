import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import { useHardwareBack } from '../hooks/useHardwareBack';

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
    const [showModal, setShowModal] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);

    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() };
    });
    const [selectedDate, setSelectedDate] = useState(null);
    const [form, setForm] = useState({
        date: '',
        mood: 3,
        energy: 2,
        note: '',
    });

    useHardwareBack(showModal, () => setShowModal(false));
    useHardwareBack(deleteIndex !== null, () => setDeleteIndex(null));

    const journal = state.journal || [];

    // Build a map: dateString -> journal entries
    const logMap = useMemo(() => {
        const map = {};
        journal.forEach((log, idx) => {
            const key = log.date;
            // Overwrite if exists, we only want 1 per day
            map[key] = { ...log, _index: idx };
        });
        return map;
    }, [journal]);

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
    const selectedEntry = selectedDateKey ? logMap[selectedDateKey] : null;

    const openAddOrEdit = () => {
        const dateStr = selectedDateKey || new Date().toISOString().split('T')[0];

        let existingIndex = null;
        let existingEntry = null;

        // If trying to add/edit on a specific date, find if it exists regardless of logMap just to be safe
        const match = journal.findIndex(j => j.date === dateStr);
        if (match !== -1) {
            existingIndex = match;
            existingEntry = journal[match];
        }

        if (existingEntry) {
            setForm({
                date: existingEntry.date,
                mood: existingEntry.mood,
                energy: existingEntry.energy,
                note: existingEntry.note || '',
                _editIndex: existingIndex
            });
        } else {
            setForm({
                date: dateStr,
                mood: 3,
                energy: 2,
                note: '',
                _editIndex: null
            });
        }
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

        if (form._editIndex !== null && form._editIndex !== undefined) {
            dispatch({ type: 'EDIT_JOURNAL', index: form._editIndex, payload });
        } else {
            dispatch({ type: 'ADD_JOURNAL', payload });
        }
        setShowModal(false);
    };

    const confirmDelete = () => {
        if (deleteIndex !== null) {
            dispatch({ type: 'DELETE_JOURNAL', index: deleteIndex });
            setDeleteIndex(null);
        }
    };

    const getMood = (val) => MOOD_OPTIONS.find(m => m.value === val) || MOOD_OPTIONS[2];
    const getEnergy = (val) => ENERGY_OPTIONS.find(e => e.value === val) || ENERGY_OPTIONS[1];

    const DOW_LABELS = [
        t('day_short_pzt', 'Pzt'), t('day_short_sal', 'Sal'), t('day_short_car', 'Çar'),
        t('day_short_per', 'Per'), t('day_short_cum', 'Cum'), t('day_short_cmt', 'Cmt'), t('day_short_paz', 'Paz')
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">{t('gunluk_title', 'Günlük')}</h2>
                    <p className="text-sm text-base-content/50 mt-1">{t('gunluk_desc', 'Günlük notlarını ve ruh halini kaydet')}</p>
                </div>
                <button className="btn btn-primary rounded-xl" onClick={() => { setSelectedDate(null); openAddOrEdit(); }}>
                    {t('gunluk_add', '+ Yeni Kayıt')}
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

                    {/* Days grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((d, i) => {
                            if (!d) return <div key={`empty-${i}`} className="p-1" />;

                            const dateKey = makeDateKey(d);
                            const logEntry = logMap[dateKey];
                            const hasLog = !!logEntry;
                            const isSelected = selectedDate === d;

                            const todayObj = new Date();
                            const todayDateKey = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
                            const isToday = dateKey === todayDateKey;

                            const moodObj = hasLog ? getMood(logEntry.mood) : null;

                            return (
                                <button
                                    key={d}
                                    onClick={() => setSelectedDate(d)}
                                    className={`
                                        h-14 flex flex-col items-center justify-start rounded-xl p-1 relative
                                        transition-all duration-200
                                        ${isSelected ? 'bg-primary text-primary-content shadow-lg shadow-primary/20 scale-105 z-10' : 'hover:bg-base-300'}
                                    `}
                                >
                                    <span className={`text-xs font-medium mb-0.5 ${isToday && !isSelected ? 'text-primary' : ''}`}>
                                        {d}
                                    </span>
                                    {hasLog && (
                                        <div className="text-xl leading-none" title={moodObj.label}>
                                            {moodObj.emoji}
                                        </div>
                                    )}
                                    {isToday && !isSelected && (
                                        <div className="w-1 absolute bottom-1 h-1 rounded-full bg-primary" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </motion.div>

            {/* Selected Date Entry */}
            <AnimatePresence mode="popLayout">
                {selectedDate && (
                    <motion.div
                        key={selectedDate}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between px-1">
                            <h4 className="font-semibold text-lg">
                                {new Date(selectedDateKey).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
                            </h4>
                            {selectedEntry && (
                                <div className="flex gap-2">
                                    <button className="btn btn-ghost btn-sm text-info rounded-xl" onClick={openAddOrEdit}>
                                        ✎ {t('modal_btn_edit', 'Düzenle')}
                                    </button>
                                    <button className="btn btn-ghost btn-sm text-error rounded-xl" onClick={() => setDeleteIndex(selectedEntry._index)}>
                                        ✕ {t('modal_btn_delete', 'Sil')}
                                    </button>
                                </div>
                            )}
                        </div>

                        {selectedEntry ? (
                            <div className="card bg-base-200 rounded-xl">
                                <div className="card-body p-5">
                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-base-300">
                                        <div className="flex flex-col items-center flex-1">
                                            <span className="text-3xl mb-1">{getMood(selectedEntry.mood).emoji}</span>
                                            <span className="text-sm font-medium">{getMood(selectedEntry.mood).label}</span>
                                            <span className="text-xs text-base-content/50">{t('gunluk_mood', 'Ruh Hali')}</span>
                                        </div>
                                        <div className="w-px h-12 bg-base-300"></div>
                                        <div className="flex flex-col items-center flex-1">
                                            <span className="text-3xl mb-1">{getEnergy(selectedEntry.energy).emoji}</span>
                                            <span className="text-sm font-medium">{getEnergy(selectedEntry.energy).label}</span>
                                            <span className="text-xs text-base-content/50">{t('gunluk_energy', 'Enerji')}</span>
                                        </div>
                                    </div>
                                    {selectedEntry.note ? (
                                        <p className="text-sm text-base-content/70 italic leading-relaxed whitespace-pre-wrap px-2">
                                            "{selectedEntry.note}"
                                        </p>
                                    ) : (
                                        <p className="text-sm text-base-content/40 italic text-center">Not eklenmemiş.</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="card bg-base-200 rounded-xl border border-dashed border-base-300 hover:border-primary/50 transition-colors cursor-pointer" onClick={openAddOrEdit}>
                                <div className="card-body items-center text-center py-8 text-base-content/50">
                                    <span className="text-4xl mb-3 opacity-50">📝</span>
                                    <p className="font-medium text-sm">{t('gunluk_no_entry', 'Bu tarihte kayıt yok')}</p>
                                    <p className="text-xs opacity-70 mt-1">{t('gunluk_no_entry_desc', 'Kayıt eklemek için tıklayın')}</p>
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
                        className="modal-box rounded-2xl max-w-md"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h3 className="font-bold text-lg mb-4">
                            {form._editIndex !== null ? t('gunluk_edit', 'Kaydı Düzenle') : t('gunluk_new', 'Yeni Günlük Kaydı')}
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
                            <button className="btn btn-ghost rounded-xl" onClick={() => setShowModal(false)}>
                                {t('modal_btn_cancel', 'İptal')}
                            </button>
                            <button className="btn btn-primary rounded-xl" onClick={handleSave}>
                                {form._editIndex !== null ? t('modal_btn_save', 'Kaydet') : t('modal_btn_add', 'Ekle')}
                            </button>
                        </div>
                    </motion.div>
                    <div className="modal-backdrop" onClick={() => setShowModal(false)} />
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
