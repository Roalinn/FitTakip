import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

export default function FotoTakip() {
    const { state, dispatch } = useStore();
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ date: '', note: '' });
    const [preview, setPreview] = useState(null);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const fileRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleAdd = () => {
        if (!form.date || !preview) return;
        dispatch({
            type: 'ADD_PHOTO',
            payload: {
                date: form.date,
                note: form.note.trim(),
                src: preview,
            },
        });
        setForm({ date: '', note: '' });
        setPreview(null);
        setShowModal(false);
    };

    const handleDelete = (index) => {
        dispatch({ type: 'DELETE_PHOTO', index });
    };

    // Group by month
    const grouped = {};
    state.photos.forEach((photo) => {
        const d = new Date(photo.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(photo);
    });

    const months = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    const formatMonth = (key) => {
        const [year, month] = key.split('-');
        const d = new Date(parseInt(year), parseInt(month) - 1);
        return d.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Foto Takip</h3>
                <button className="btn btn-primary btn-sm rounded-xl" onClick={() => setShowModal(true)}>
                    + Fotoğraf Ekle
                </button>
            </div>

            {/* Photo grid by month */}
            {months.length > 0 ? (
                months.map((monthKey) => (
                    <motion.div
                        key={monthKey}
                        className="card bg-base-200 rounded-xl"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="card-body p-4">
                            <h3 className="font-semibold capitalize mb-3">{formatMonth(monthKey)}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {grouped[monthKey].map((photo, i) => {
                                    const globalIndex = state.photos.indexOf(photo);
                                    return (
                                        <div key={i} className="relative group">
                                            <img
                                                src={photo.src}
                                                alt={photo.note || 'Fotoğraf'}
                                                className="w-full aspect-square object-cover rounded-xl cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
                                                onClick={() => setSelectedPhoto(photo)}
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent rounded-b-xl p-2">
                                                <p className="text-xs text-white/80">
                                                    {new Date(photo.date).toLocaleDateString('tr-TR')}
                                                </p>
                                                {photo.note && (
                                                    <p className="text-xs text-white/60 truncate mt-0.5">{photo.note}</p>
                                                )}
                                            </div>
                                            <button
                                                className="absolute top-2 right-2 btn btn-circle btn-xs bg-black/50 border-0 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(globalIndex);
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                ))
            ) : (
                <div className="card bg-base-200 rounded-xl">
                    <div className="card-body items-center text-center py-12">
                        <p className="text-base-content/50">Henüz fotoğraf eklenmemiş.</p>
                        <p className="text-sm text-base-content/30">Aylık ilerleme fotoğraflarınızı buraya ekleyin.</p>
                    </div>
                </div>
            )}

            {/* Photo Viewer Modal */}
            {selectedPhoto && (
                <div className="modal modal-open">
                    <motion.div
                        className="modal-box rounded-2xl max-w-xl p-0 overflow-hidden"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <img src={selectedPhoto.src} alt="" className="w-full" />
                        <div className="p-4">
                            <p className="text-sm text-base-content/50">
                                {new Date(selectedPhoto.date).toLocaleDateString('tr-TR', {
                                    day: 'numeric', month: 'long', year: 'numeric',
                                })}
                            </p>
                            {selectedPhoto.note && (
                                <p className="text-sm mt-1">{selectedPhoto.note}</p>
                            )}
                        </div>
                    </motion.div>
                    <div className="modal-backdrop" onClick={() => setSelectedPhoto(null)} />
                </div>
            )}

            {/* Add Modal */}
            {showModal && (
                <div className="modal modal-open">
                    <motion.div
                        className="modal-box rounded-2xl"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h3 className="font-bold text-lg mb-4">Fotoğraf Ekle</h3>
                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">Tarih</span></label>
                                <input
                                    type="date"
                                    className="input input-bordered rounded-xl w-full"
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Not (opsiyonel)</span></label>
                                <input
                                    type="text"
                                    className="input input-bordered rounded-xl w-full"
                                    value={form.note}
                                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                                    placeholder="Ön, yan, arka..."
                                />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Fotoğraf</span></label>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    className="file-input file-input-bordered rounded-xl w-full"
                                    onChange={handleFileChange}
                                />
                            </div>
                            {preview && (
                                <img
                                    src={preview}
                                    alt="Önizleme"
                                    className="w-full max-h-64 object-contain rounded-xl"
                                />
                            )}
                        </div>
                        <div className="modal-action">
                            <button className="btn btn-ghost rounded-xl" onClick={() => { setShowModal(false); setPreview(null); }}>İptal</button>
                            <button className="btn btn-primary rounded-xl" onClick={handleAdd}>Ekle</button>
                        </div>
                    </motion.div>
                    <div className="modal-backdrop" onClick={() => { setShowModal(false); setPreview(null); }} />
                </div>
            )}
        </div>
    );
}
