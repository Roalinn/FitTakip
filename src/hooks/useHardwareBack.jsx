import { useEffect, useRef } from 'react';

export function useHardwareBack(isOpen, closeFn) {
    const closeFnRef = useRef(closeFn);
    const poppedRef = useRef(false);

    // Keep closeFnRef updated without triggering useEffect
    useEffect(() => {
        closeFnRef.current = closeFn;
    }, [closeFn]);

    useEffect(() => {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
        if (!isOpen || !isMobile) return;

        poppedRef.current = false;

        // Push a dummy state to history
        window.history.pushState({ isModal: true }, '');

        const handlePopState = (e) => {
            poppedRef.current = true;
            closeFnRef.current();
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            if (!poppedRef.current) {
                if (window.history.state && window.history.state.isModal) {
                    window.history.back();
                }
            }
        };
    }, [isOpen]);
}
