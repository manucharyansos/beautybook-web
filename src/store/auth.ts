// src/store/auth.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
    id: number;
    name: string;
    email: string;
    role: 'owner' | 'manager' | 'staff' | 'super_admin';
    business_id: number; // փոխել salon_id-ից business_id
    business_slug?: string;
    business_type?: 'beauty' | 'dental';
    needs_onboarding: boolean;
}

interface AuthState {
    user: User | null;
    token: string | null;
    bootstrapped: boolean;
    setAuth: (token: string, user: User) => void;
    logout: () => void;
    setBootstrapped: (value: boolean) => void;
}

export const useAuth = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            bootstrapped: true,
            setAuth: (token, user) => set({ token, user, bootstrapped: true }),
            logout: () => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                set({ token: null, user: null, bootstrapped: true });
            },
            setBootstrapped: (value) => set({ bootstrapped: value }),
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({
                token: state.token,
                user: state.user
            }),
        }
    )
);