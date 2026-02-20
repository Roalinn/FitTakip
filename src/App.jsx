import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import AnaHedef from './pages/AnaHedef';
import Programlar from './pages/Programlar';
import Takip from './pages/Takip';
import Gunluk from './pages/Gunluk';
import Ayarlar from './pages/Ayarlar';
import { useHardwareBack } from './hooks/useHardwareBack';
const pages = {
    anaHedef: AnaHedef,
    programlar: Programlar,
    takip: Takip,
    gunluk: Gunluk,
    ayarlar: Ayarlar,
};

const pageTransition = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.25, ease: 'easeOut' },
};

export default function App() {
    const [activePage, setActivePage] = useState('anaHedef');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [exitToast, setExitToast] = useState(false);
    const exitToastRef = useRef(false);
    const exitTimerRef = useRef(null);

    useEffect(() => {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
        if (!isMobile) return;

        // Ensure history has a safe baseline to trap back events without causing blank screens
        if (!window.history.state || window.history.state.page !== 'app') {
            window.history.replaceState({ page: 'base' }, '');
            window.history.pushState({ page: 'app' }, '');
        }

        const handlePopState = (e) => {
            // Only trap the popstate if the user reached our 'base' dummy history.
            // If returning from modals, the state will be 'app' or something else, harmless.
            if (e.state && e.state.page === 'base') {
                if (exitToastRef.current) {
                    // User confirmed exit with double back
                    window.history.back();
                    return;
                }

                // First back press: Warn and prevent
                exitToastRef.current = true;
                setExitToast(true);

                // Immediately push state forward to trap again!
                window.history.pushState({ page: 'app' }, '');

                if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
                exitTimerRef.current = setTimeout(() => {
                    exitToastRef.current = false;
                    setExitToast(false);
                }, 2000);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Swipe to open/close sidebar
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 50;

    // Hardware back closes sidebar too
    useHardwareBack(sidebarOpen, () => setSidebarOpen(false));

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        // Allow opening sidebar by swiping right from anywhere
        if (isRightSwipe) {
            setSidebarOpen(true);
        }
        // Allow close sidebar by swiping left
        if (isLeftSwipe && sidebarOpen) {
            setSidebarOpen(false);
        }
    };

    const PageComponent = pages[activePage];

    return (
        <div
            className="flex h-screen bg-gradient-to-br from-base-100 via-base-200/50 to-base-300/80 text-base-content overflow-hidden select-none sm:select-auto"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* Mobile overlay */}
            {sidebarOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <Sidebar
                activePage={activePage}
                setActivePage={(p) => {
                    setActivePage(p);
                    setSidebarOpen(false);
                }}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main content */}
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Mobile header */}
                <div className="lg:hidden flex items-center gap-3 p-3 border-b border-base-300">
                    <button
                        className="btn btn-ghost btn-square btn-sm"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="text-lg font-bold tracking-tight">
                        <span className="text-primary">Fit</span>Takip
                    </h1>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32 md:pb-40 relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activePage}
                            {...pageTransition}
                            className="max-w-5xl mx-auto"
                        >
                            <PageComponent />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
            {/* Double Back Exit Toast */}
            {exitToast && (
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 w-max pointer-events-none">
                    <div className="alert py-2 px-6 shadow-xl border border-white/10 bg-base-300 text-base-content rounded-full text-sm font-medium">
                        <span>{t('toast_double_back', 'Çıkmak için tekrar dokunun')}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
