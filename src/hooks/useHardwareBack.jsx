import { useEffect, useRef } from 'react';

export function useHardwareBack(isOpen, closeFn) {
    const poppedRef = useRef(false);

    useEffect(() => {
        if (!isOpen) return;

        poppedRef.current = false;
        
        // Push a dummy state to history so we can intercept the back button
        window.history.pushState({ isModal: true }, '');

        const handlePopState = (e) => {
            poppedRef.current = true;
            closeFn();
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            // If the modal was closed manually (not by back button), pop the state to keep history clean
            if (!poppedRef.current) {
                if (window.history.state && window.history.state.isModal) {
                    window.history.back();
                }
            }
        };
    }, [isOpen, closeFn]);
}
