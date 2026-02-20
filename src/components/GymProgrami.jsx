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

export default function GymProgrami() {
    const { state, dispatch } = useStore();
    const [selectedDay, setSelectedDay] = useState('pazartesi');
    const [showModal, setShowModal] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [form, setForm] = useState({ name: '', sets: '', reps: '', duration: '', note: '' });

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
                {DAYS.map((day) => (
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
                <h3 className="text-lg font-semibold">{FULL_DAYS[selectedDay]}</h3>
                <button className="btn btn-primary btn-sm rounded-xl" onClick={openAdd}>
                    + Hareket Ekle
                </button>
            </div>

            {/* Exercises list */}
            {exercises.length === 0 ? (
                <div className="card bg-base-200 rounded-xl">
                    <div className="card-body items-center text-center py-12">
                        <p className="text-base-content/50">Bu gün için hareket eklenmemiş.</p>
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
                                                    {ex.sets} Set
                                                </span>
                                            )}
                                            {ex.reps > 0 && (
                                                <span className="badge badge-sm bg-info/10 text-info border-0 rounded-lg">
                                                    {ex.reps} Tekrar
                                                </span>
                                            )}
                                            {ex.duration > 0 && (
                                                <span className="badge badge-sm bg-warning/10 text-warning border-0 rounded-lg">
                                                    {ex.duration} Dakika
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
                            {editIndex !== null ? 'Hareket Düzenle' : 'Hareket Ekle'} – {FULL_DAYS[selectedDay]}
                        </h3>
                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">Hareket Adı</span></label>
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
                                    <label className="label"><span className="label-text">Set</span></label>
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
                                    <label className="label"><span className="label-text">Tekrar</span></label>
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
                                    <label className="label"><span className="label-text">Süre (dk)</span></label>
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
                            "<span className="font-medium text-base-content">{exercises[deleteIndex]?.name}</span>" hareketini silmek istediğinize emin misiniz?
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
