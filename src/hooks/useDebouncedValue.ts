import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delay = 450) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const h = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(h);
    }, [value, delay]);
    return debounced;
}
