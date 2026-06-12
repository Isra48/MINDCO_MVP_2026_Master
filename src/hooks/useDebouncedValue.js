import { useEffect, useState } from "react";

/**
 * Devuelve `value` con un retraso de `delay` ms. Úsalo para entradas de búsqueda
 * o filtros que disparan fetchs: evita pedir a Strapi en cada tecla y solo
 * consulta cuando el usuario deja de escribir.
 *
 * @example
 * const [term, setTerm] = useState("");
 * const debouncedTerm = useDebouncedValue(term, 400);
 * const { data } = useQuery({
 *   queryKey: ["search", debouncedTerm],
 *   queryFn: () => searchClasses(debouncedTerm),
 *   enabled: debouncedTerm.length >= 2, // no consultar con términos muy cortos
 * });
 */
export function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

export default useDebouncedValue;
