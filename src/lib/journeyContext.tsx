"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface JourneyContextValue {
  /** Whether the interactive journey overlay is open */
  isActive: boolean;
  startJourney: () => void;
  exitJourney: () => void;
}

const JourneyContext = createContext<JourneyContextValue>({
  isActive: false,
  startJourney: () => {},
  exitJourney: () => {},
});

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);

  const startJourney = useCallback(() => {
    document.body.style.overflow = "hidden";
    setIsActive(true);
  }, []);

  const exitJourney = useCallback(() => {
    document.body.style.overflow = "";
    setIsActive(false);
  }, []);

  return (
    <JourneyContext.Provider value={{ isActive, startJourney, exitJourney }}>
      {children}
    </JourneyContext.Provider>
  );
}

export function useJourney() {
  return useContext(JourneyContext);
}
