import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

const DAYS = [
    { key: 'pazartesi', label: 'Pzt' },
    { key: 'sali', label: 'Sal' },
    { key: 'carsamba', label: 'Çar' },
    { key: 'persembe', label: 'Per' },
    { key: 'cuma', label: 'Cum' },
    { key: 'cumartesi', label: 'Cmt' },
    { key: 'pazar', label: 'Paz' },
];

const FULL_DAYS = {
    pazartesi: 'Pazartesi', sali: 'Salı', carsamba: 'Çarşamba',
    persembe: 'Perşembe', cuma: 'Cuma', cumartesi: 'Cumartesi', pazar: 'Pazar',
};

// Generate half-hour time slots
const TIME_SLOTS = [];
for (let h = 0; h < 24; h++) {
    const hh = String(h).padStart(2, '0');
    TIME_SLOTS.push(`${hh}:00`);
    TIME_SLOTS.push(`${hh}:30`);
}

export default function DiyetProgrami() {
    const { state, dispatch } = useStore();
    const [selectedDay, setSelectedDay] = useState('pazartesi');
    const [showModal, setShowModal] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [form, setForm] = useState({ name: '', time: '', foods: '', note: '' });

    const meals = state.dietProgram[selectedDay] || [];

    const openAdd = () => {
        setEditIndex(null);
        setForm({ name: '', time: '', foods: '', note: '' });
        setShowModal(true);
    };

    const openEdit = (index) => {
        const meal = meals[index];
        setEditIndex(index);
        setForm({
            name: meal.name,
            time: meal.time || '',
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
                {DAYS.map((day) => (
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
                <h3 className="text-lg font-semibold">{FULL_DAYS[selectedDay]}</h3>
                <button className="btn btn-primary btn-sm rounded-xl" onClick={openAdd}>
                    + Öğün Ekle
                </button>
            </div>

            {/* Meals list */}
            {meals.length === 0 ? (
                <div className="card bg-base-200 rounded-xl">
                    <div className="card-body items-center text-center py-12">
                        <p className="text-base-content/50">Bu gün için öğün eklenmemiş.</p>
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
                                            title="Düzenle"
                                        >
                                            ✎
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-xs text-error"
                                            onClick={() => setDeleteIndex(i)}
                                            title="Sil"
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
                            {editIndex !== null ? 'Öğün Düzenle' : 'Öğün Ekle'} – {FULL_DAYS[selectedDay]}
                        </h3>
                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">Öğün Adı</span></label>
                                <input
                                    type="text"
                                    className="input input-bordered rounded-xl w-full"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Kahvaltı, Öğle Yemeği..."
                                />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Saat</span></label>
                                <select
                                    className="select select-bordered rounded-xl w-full"
                                    value={form.time}
                                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                                >
                                    <option value="">Saat seçin</option>
                                    {TIME_SLOTS.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Besinler (virgülle ayırın)</span></label>
                                <textarea
                                    className="textarea textarea-bordered rounded-xl w-full"
                                    value={form.foods}
                                    onChange={(e) => setForm({ ...form, foods: e.target.value })}
                                    placeholder="Yumurta, Peynir, Ekmek, Çay..."
                                    rows={3}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Not (opsiyonel)</span></label>
                                <input
                                    type="text"
                                    className="input input-bordered rounded-xl w-full"
                                    value={form.note}
                                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                                    placeholder="Ekstra bilgi..."
                                />
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

            {/* Delete Confirmation Modal */}
            {deleteIndex !== null && (
                <div className="modal modal-open">
                    <motion.div
                        className="modal-box rounded-2xl max-w-sm"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.15 }}
                    >
                        <h3 className="font-bold text-lg mb-2">Silmeyi Onayla</h3>
                        <p className="text-sm text-base-content/60">
                            "<span className="font-medium text-base-content">{meals[deleteIndex]?.name}</span>" öğününü silmek istediğinize emin misiniz?
                        </p>
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
