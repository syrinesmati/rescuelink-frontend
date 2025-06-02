import { useEffect, useState } from 'react';

export const useMissionUpdates = () => {
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
    const eventSource = new EventSource(`${API_BASE_URL}/sse/missions`);

    eventSource.onmessage = (event) => {
      setUpdates(prev => [...prev, JSON.parse(event.data)]);
    };

    return () => eventSource.close();
  }, []);

  return updates;
};