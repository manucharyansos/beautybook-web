export type BusinessType = 'salon' | 'clinic' | null;

export interface PricingPlan {
    name: string;
    price: {
        salon: string;
        clinic: string;
    };
    period: string;
    description: string;
    perks: string[];
    featured?: boolean;
    popularFor?: string;
    businessTypes: ('salon' | 'clinic')[];
}

export interface Feature {
    icon: any;
    title: string;
    description: string;
    gradient?: string;
    businessTypes?: ('salon' | 'clinic')[];
}

export interface BusinessTypeCardProps {
    type: BusinessType;
    title: string;
    description: string;
    icon: any;
    features: string[];
    price?: string;
    isSelected: boolean;
    onSelect: () => void;
}

export interface Testimonial {
    quote: string;
    author: string;
    role: string;
    rating: number;
    type: BusinessType;
    businessName: string;
    image?: string;
}