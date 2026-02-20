import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import KiloTakip from '../components/KiloTakip';
import BedenOlculeri from '../components/BedenOlculeri';
import GymTakip from '../components/GymTakip';
import FotoTakip from '../components/FotoTakip';

const tabs = [
    { key: 'kilo', label: 'Kilo' },
    { key: 'beden', label: 'Beden Ölçüleri' },
    { key: 'gym', label: 'Gym' },
    { key: 'foto', label: 'Foto' },
];

export default function Takip() {
    const [activeTab, setActiveTab] = useState('kilo');

    const components = {
        kilo: KiloTakip,
        beden: BedenOlculeri,
        gym: GymTakip,
        foto: FotoTakip,
    };

    const ActiveComponent = components[activeTab];

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold">Takip</h2>
                <p className="text-sm text-base-content/50 mt-1">İlerlemenizi kaydedin ve grafiklerle takip edin</p>
            </div>

            {/* Tabs */}
            <div role="tablist" className="tabs tabs-boxed bg-base-200 rounded-xl p-1 mb-6 flex flex-wrap gap-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        role="tab"
                        className={`tab rounded-lg font-medium transition-all duration-200 ${activeTab === tab.key ? 'tab-active bg-primary text-primary-content' : ''
                            }`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                >
                    <ActiveComponent />
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
