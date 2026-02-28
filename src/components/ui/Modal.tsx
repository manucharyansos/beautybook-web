import {type ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type Props = {
    open: boolean;
    title?: string;
    onClose: () => void;
    children: ReactNode;
};

export function Modal({ open, title, onClose, children }: Props) {
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    aria-modal="true"
                    role="dialog"
                >
                    {/* Overlay */}
                    <motion.div
                        className="absolute inset-0 bg-black/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onMouseDown={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="relative w-full max-w-2xl rounded-3xl border bg-white shadow-xl"
                        onMouseDown={(e) => e.stopPropagation()} // ✅ prevents focus loss from overlay
                    >
                        <div className="flex items-center justify-between border-b px-5 py-4">
                            <div className="text-lg font-semibold text-gray-900">
                                {title ?? ""}
                            </div>
                            <button
                                type="button"
                                className="h-10 w-10 grid place-items-center rounded-2xl border bg-white hover:bg-gray-50"
                                onClick={onClose}
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="px-5 py-4">{children}</div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
