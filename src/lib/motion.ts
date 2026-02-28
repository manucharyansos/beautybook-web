import type { Transition, Variants } from "framer-motion";

const t: Transition = { duration: 0.25, ease: "easeOut" };

export const page = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: t,
} as const;

export const card: Variants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
};

export const cardTransition: Transition = { duration: 0.25, ease: "easeOut" };

export const hoverLift = {
    whileHover: { y: -2, transition: { duration: 0.15 } },
    whileTap: { scale: 0.98 },
} as const;
