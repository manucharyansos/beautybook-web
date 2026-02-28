import { api } from "@/lib/api.ts";

export type BusinessType = "salon" | "clinic";

export type PublicPlan = {
    id: number;
    code: string;
    name: string;
    description?: string | null;
    price: number;
    period?: string | null;
    staff_limit?: number;
    features?: Record<string, any> | null;
};

export const plansApi = {
    // Public plans
    list: (businessType: BusinessType, showHidden?: boolean) =>
        api.get<{ data: PublicPlan[] }>("/plans", {
            params: {
                business_type: businessType,
                show_hidden: showHidden,
            },
        }),
};

export const publicPlansApi = {
    list: (businessType: BusinessType) =>
        api.get<{ data: PublicPlan[] }>("/plans", {
            params: { business_type: businessType },
        }),
};
