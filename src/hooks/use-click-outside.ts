import { useEffect, type RefObject } from "react";

/** Closes a floating layer when a click lands outside it. Shared by SelectField
 *  and the rich-text toolbar's popovers, which had the same listener twice. */
export function useClickOutside(
  containerRef: RefObject<HTMLElement | null>,
  onClose: () => void,
): void {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [containerRef, onClose]);
}
