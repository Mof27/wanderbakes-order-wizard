
import React, { useState, useEffect } from "react";

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const formattedTime = time.toLocaleTimeString(undefined, { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return (
    <div className="text-sm font-medium">
      {formattedTime}
    </div>
  );
};

export default Clock;
