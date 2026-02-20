import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';

export default function FotoTakip() {
    const { state, dispatch } = useStore();
    const { t } = useTranslation();
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ date: '', note: '' });
    const [preview, setPreview] = useState(null);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [deleteIndex, setDeleteIndex] = useState(null);
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
        setDeleteIndex(index);
    };

    const confirmDelete = () => {
        if (deleteIndex !== null) {
            dispatch({ type: 'DELETE_PHOTO', index: deleteIndex });
            setDeleteIndex(null);
        }
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
                <h3 className="text-lg font-semibold">{t('foto_title', 'Fotoğraflar')}</h3>
                <button className="btn btn-primary btn-sm rounded-xl" onClick={() => setShowModal(true)}>
                    {t('foto_btn_add', '+ Fotoğraf Ekle')}
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
                    <div className="card-body items-center text-center py-12 text-base-content/40">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <p>{t('foto_empty', 'Henüz fotoğraf eklenmemiş.')}</p>
                        <p className="text-sm opacity-70 mt-1">{t('foto_empty_desc', 'Aylık ilerleme fotoğraflarınızı buraya ekleyin.')}</p>
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
                        <h3 className="font-bold text-lg mb-4">{t('foto_btn_add', 'Fotoğraf Ekle').replace('+', '').trim()}</h3>
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
                            <div className="form-control">
                                <label className="label"><span className="label-text">{t('foto_note', 'Not (opsiyonel)')}</span></label>
                                <input
                                    type="text"
                                    className="input input-bordered rounded-xl w-full"
                                    value={form.note}
                                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                                    placeholder={t('foto_note_ph', 'Ön, yan, arka...')}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">{t('foto_photo', 'Fotoğraf')}</span></label>
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
                                    alt={t('foto_preview', 'Önizleme')}
                                    className="w-full max-h-64 object-contain rounded-xl"
                                />
                            )}
                        </div>
                        <div className="modal-action">
                            <button className="btn btn-ghost rounded-xl" onClick={() => { setShowModal(false); setPreview(null); }}>{t('modal_btn_cancel', 'İptal')}</button>
                            <button className="btn btn-primary rounded-xl" onClick={handleAdd}>{t('modal_btn_add', 'Ekle')}</button>
                        </div>
                    </motion.div>
                    <div className="modal-backdrop" onClick={() => { setShowModal(false); setPreview(null); }} />
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
                        <p className="text-sm text-base-content/60">Bu fotoğrafı silmek istediğinize emin misiniz?</p>
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
