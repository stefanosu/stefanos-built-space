import { useEffect, useState, useCallback } from "react";

const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function useKonamiCode() {
  const [activated, setActivated] = useState(false);
  const [progress, setProgress] = useState(0);

  const reset = useCallback(() => {
    setActivated(false);
  }, []);

  useEffect(() => {
    let currentIndex = 0;

    const handleKeyDown = (event: KeyboardEvent) => {
      const expectedKey = KONAMI_CODE[currentIndex];
      const pressedKey = event.key.length === 1 ? event.key.toLowerCase() : event.key;

      if (pressedKey === expectedKey) {
        currentIndex++;
        setProgress(currentIndex);

        if (currentIndex === KONAMI_CODE.length) {
          setActivated(true);
          currentIndex = 0;
          setProgress(0);
        }
      } else {
        currentIndex = 0;
        setProgress(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return { activated, progress, reset, total: KONAMI_CODE.length };
}
