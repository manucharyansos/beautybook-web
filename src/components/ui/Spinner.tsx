export function Spinner({ size = 18 }: { size?: number }) {
    return (
        <span
            className="inline-block animate-spin rounded-full border-2 border-gray-300 border-t-gray-800"
            style={{ width: size, height: size }}
            aria-label="loading"
        />
    );
}