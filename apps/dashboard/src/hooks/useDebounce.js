import { useState, useEffect } from 'react';

/**
 * Trả về giá trị debounced sau khi user ngừng thay đổi `value` trong `delay` ms.
 * @param {*} value - Giá trị cần debounce
 * @param {number} delay - Thời gian chờ (ms), mặc định 300ms
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
