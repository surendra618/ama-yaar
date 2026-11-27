import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { subscribeLoading } from '../utils/networkLoader';

export default function TopProgressBar() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const netBusyRef = useRef(false);
  const navTimerRef = useRef(null);
  const incTimerRef = useRef(null);
  const hideTimerRef = useRef(null);

  const beginBar = () => {
    clearTimeout(hideTimerRef.current);
    setVisible(true);
    setProgress((p) => (p > 15 && p < 85 ? p : 20));
    clearInterval(incTimerRef.current);
    incTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 88) return prev;
        return Math.min(88, prev + (90 - prev) * 0.18);
      });
    }, 180);
  };

  const finishBar = () => {
    clearInterval(incTimerRef.current);
    setProgress(100);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 260);
  };

  useEffect(() => {
    const unsub = subscribeLoading((isLoading) => {
      netBusyRef.current = isLoading;
      if (isLoading) {
        beginBar();
      } else {
        finishBar();
      }
    });
    return () => {
      unsub();
      clearInterval(incTimerRef.current);
      clearTimeout(hideTimerRef.current);
    };
  }, []);

  useEffect(() => {
    beginBar();
    clearTimeout(navTimerRef.current);
    navTimerRef.current = setTimeout(() => {
      if (!netBusyRef.current) {
        finishBar();
      }
    }, 280);
    return () => clearTimeout(navTimerRef.current);
  }, [location.pathname, location.search]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9998] h-[3px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-indigo-600 via-amber-500 to-black transition-all duration-200 ease-out shadow-[0_0_8px_rgba(79,70,229,0.5)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
