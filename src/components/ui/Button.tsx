import { cn } from "../../lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md";
};

export function Button({ className, variant = "primary", size = "md", ...props }: Props) {
    const base = "inline-flex items-center justify-center rounded-xl font-medium transition disabled:opacity-60 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-black text-white hover:bg-gray-900",
        secondary: "border bg-white hover:bg-gray-50",
        ghost: "hover:bg-gray-50",
    };
    const sizes = {
        sm: "px-3 py-2 text-sm",
        md: "px-4 py-2 text-sm",
    };
    return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
