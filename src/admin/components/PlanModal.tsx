import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Sparkles, Award } from "lucide-react";

type BusinessType = "beauty" | "dental" | null;

type SmsReminders = number | "unlimited";

interface Plan {
    id?: number;
    name: string;
    code: string;
    business_type: BusinessType;
    description: string | null;

    price_beauty: number;
    price_dental: number;

    currency: string;
    seats: number;
    duration_days: number;
    locations: number | null;

    features: {
        staff_limit: number;
        sms_reminders: SmsReminders;
        api_access: boolean;
        priority_support: boolean;
        dedicated_manager: boolean;
        [k: string]: any;
    };

    is_active?: boolean;
    is_visible?: boolean;
}

interface PlanModalProps {
    open: boolean;
    plan: Plan | null;
    onClose: () => void;
    onSave: (plan: any) => void;
    saving?: boolean;
    error?: string | null;
}

const emptyForm = {
    name: "",
    code: "",
    business_type: null as BusinessType,
    description: "",
    price_beauty: 0,
    price_dental: 0,
    currency: "AMD",
    duration_days: 30,
    locations: 1,
    features: {
        staff_limit: 1,
        sms_reminders: 50 as SmsReminders,
        api_access: false,
        priority_support: false,
        dedicated_manager: false,
    },
    is_active: true,
    is_visible: true,
};

export function PlanModal({
                              open,
                              plan,
                              onClose,
                              onSave,
                              saving,
                              error,
                          }: PlanModalProps) {
    const [formData, setFormData] = useState({ ...emptyForm });

    useEffect(() => {
        if (plan) {
            setFormData({
                name: plan.name || "",
                code: plan.code || "",
                business_type: plan.business_type ?? null,
                description: plan.description || "",
                price_beauty: plan.price_beauty ?? 0,
                price_dental: plan.price_dental ?? 0,
                currency: plan.currency || "AMD",
                duration_days: plan.duration_days || 30,
                locations: plan.locations ?? 1,
                features: {
                    staff_limit: plan.features?.staff_limit ?? plan.seats ?? 1,
                    sms_reminders: plan.features?.sms_reminders ?? 50,
                    api_access: !!plan.features?.api_access,
                    priority_support: !!plan.features?.priority_support,
                    dedicated_manager: !!plan.features?.dedicated_manager,
                },
                is_active: plan.is_active ?? true,
                is_visible: plan.is_visible ?? true,
            });
        } else {
            setFormData({ ...emptyForm });
        }
    }, [plan, open]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        // nested features.xxx
        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            if (parent === "features") {
                setFormData((prev) => {
                    let nextValue: any;

                    if (type === "checkbox") {
                        nextValue = (e.target as HTMLInputElement).checked;
                    } else {
                        // ✅ sms_reminders may be "unlimited"
                        if (child === "sms_reminders") {
                            nextValue = value === "unlimited" ? "unlimited" : parseInt(value) || 0;
                        } else if (type === "number") {
                            nextValue = parseInt(value) || 0;
                        } else {
                            nextValue = value;
                        }
                    }

                    return {
                        ...prev,
                        features: {
                            ...prev.features,
                            [child]: nextValue,
                        },
                    };
                });
            }
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? (e.target as HTMLInputElement).checked
                    : type === "number"
                        ? parseInt(value) || 0
                        : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const submitData = {
            ...formData,
            seats: formData.features.staff_limit, // sync
            features: formData.features,
        };

        onSave(submitData);
    };

    const handleModalClick = (e: React.MouseEvent) => e.stopPropagation();

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50" />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={handleModalClick}
                            className="inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-light text-gray-900">
                                    {plan ? "Խմբագրել փաթեթ" : "Նոր փաթեթ"}
                                </h2>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                                    <AlertCircle size={20} />
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Business Type */}
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">Բիզնեսի տեսակ</h3>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="business_type"
                                                value=""
                                                checked={formData.business_type === null}
                                                onChange={() => setFormData((p) => ({ ...p, business_type: null }))}
                                                className="w-4 h-4 text-[#C5A28A]"
                                            />
                                            <span className="text-sm text-gray-700">Երկուսի համար</span>
                                        </label>

                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="business_type"
                                                value="beauty"
                                                checked={formData.business_type === "beauty"}
                                                onChange={() => setFormData((p) => ({ ...p, business_type: "beauty" }))}
                                                className="w-4 h-4 text-[#C5A28A]"
                                            />
                                            <span className="flex items-center gap-1 text-sm text-gray-700">
                        <Sparkles size={16} className="text-purple-600" />
                        Beauty
                      </span>
                                        </label>

                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="business_type"
                                                value="dental"
                                                checked={formData.business_type === "dental"}
                                                onChange={() => setFormData((p) => ({ ...p, business_type: "dental" }))}
                                                className="w-4 h-4 text-[#C5A28A]"
                                            />
                                            <span className="flex items-center gap-1 text-sm text-gray-700">
                        <Award size={16} className="text-blue-600" />
                        Dental
                      </span>
                                        </label>
                                    </div>
                                </div>

                                {/* Basic */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-2">Անվանում *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C5A28A]"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-700 mb-2">Կոդ *</label>
                                        <input
                                            type="text"
                                            name="code"
                                            value={formData.code}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C5A28A]"
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm text-gray-700 mb-2">Նկարագրություն</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={2}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C5A28A]"
                                        />
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">Գնային տվյալներ</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-2">Գին (Beauty)</label>
                                            <input
                                                type="number"
                                                name="price_beauty"
                                                value={formData.price_beauty}
                                                onChange={handleChange}
                                                min="0"
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C5A28A]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-600 mb-2">Գին (Dental)</label>
                                            <input
                                                type="number"
                                                name="price_dental"
                                                value={formData.price_dental}
                                                onChange={handleChange}
                                                min="0"
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C5A28A]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-600 mb-2">Արժույթ</label>
                                            <select
                                                name="currency"
                                                value={formData.currency}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C5A28A]"
                                            >
                                                <option value="AMD">AMD</option>
                                                <option value="USD">USD</option>
                                                <option value="EUR">EUR</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">Փաթեթի մանրամասներ</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-2">Աշխատակիցների քանակ</label>
                                            <input
                                                type="number"
                                                name="features.staff_limit"
                                                value={formData.features.staff_limit}
                                                onChange={handleChange}
                                                min="1"
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C5A28A]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-600 mb-2">SMS հիշեցումներ</label>
                                            <select
                                                name="features.sms_reminders"
                                                value={String(formData.features.sms_reminders)}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C5A28A]"
                                            >
                                                <option value="50">50</option>
                                                <option value="200">200</option>
                                                <option value="500">500</option>
                                                <option value="1000">1000</option>
                                                <option value="unlimited">Անսահմանափակ</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-600 mb-2">Տևողություն (օր)</label>
                                            <input
                                                type="number"
                                                name="duration_days"
                                                value={formData.duration_days}
                                                onChange={handleChange}
                                                min="1"
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C5A28A]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">Առանձնահատկություններ</h3>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name="features.api_access"
                                                checked={formData.features.api_access}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-[#C5A28A] border-gray-300 rounded"
                                            />
                                            <span className="text-sm text-gray-700">API հասանելիություն</span>
                                        </label>

                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name="features.priority_support"
                                                checked={formData.features.priority_support}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-[#C5A28A] border-gray-300 rounded"
                                            />
                                            <span className="text-sm text-gray-700">Առաջնահերթ աջակցություն</span>
                                        </label>

                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name="features.dedicated_manager"
                                                checked={formData.features.dedicated_manager}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-[#C5A28A] border-gray-300 rounded"
                                            />
                                            <span className="text-sm text-gray-700">Անհատական մենեջեր</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-[#C5A28A] border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-gray-700">Ակտիվ</span>
                                    </label>

                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="is_visible"
                                            checked={formData.is_visible}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-[#C5A28A] border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-gray-700">Ցուցադրել</span>
                                    </label>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        Չեղարկել
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-2 bg-gradient-to-r from-[#C5A28A] to-[#B88E72] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Պահպանում...</span>
                                            </>
                                        ) : (
                                            "Պահպանել"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}