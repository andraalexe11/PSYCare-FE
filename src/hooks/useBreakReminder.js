import { useState, useEffect } from 'react';

export function useBreakReminder(intervalMinutes) {
  const [showBreak, setShowBreak] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    let activityInterval;
    
    activityInterval = setInterval(() => {
      setShowBreak(true);
      setCountdown(10);
    }, intervalMinutes * 60 * 1000); 

    return () => clearInterval(activityInterval);
  }, [intervalMinutes]);

  useEffect(() => {
    if (!showBreak) return;

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setTimeout(() => setShowBreak(false), 100); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [showBreak]);

  return { showBreak, countdown };
}