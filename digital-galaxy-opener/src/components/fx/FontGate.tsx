import React, { useEffect, useState } from 'react';
import { continueRender, delayRender } from 'remotion';
import { loadBrandFonts } from '../../brand/fonts';

/** Renders children only after every brand font is loaded, so text metrics are exact. */
export const FontGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('Loading brand fonts'));
  useEffect(() => {
    loadBrandFonts().then(() => { setReady(true); continueRender(handle); });
  }, [handle]);
  return ready ? <>{children}</> : null;
};
