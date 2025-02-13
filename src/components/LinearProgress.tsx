import React, { useEffect, useRef } from "react";

const LinearProgress = () => {
  const progressRef = useRef<any>(30); // Asegúrate de tipar correctamente el ref

  useEffect(() => {
    let interval: NodeJS.Timeout; // Mejor tipado para setInterval
    if (progressRef.current) {
      interval = setInterval(() => {
        if (progressRef.current && progressRef.current.value < 100) {
          progressRef.current.value += 10; // Incrementa el progreso
        } else {
          clearInterval(interval); // Limpia el intervalo cuando llegue al 100%
        }
      }, 50);
    }

    return () => {
      clearInterval(interval); // Limpia el intervalo al desmontar el componente
    };
  }, []);

  return (
    <div className="progress-custom" style={{ width: "100%" }}>
      <progress
        style={{ width: "100%", position: "absolute" }}
        ref={progressRef}
        value="30"
        max="100"
      />
    </div>
  );
};

export default LinearProgress;
