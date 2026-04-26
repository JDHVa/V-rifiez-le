import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ref, get, update } from "firebase/database";
import { db } from "../firebase";

export default function Conductor() {
  const [camiones, setCamiones] = useState({});
  const [camionId, setCamionId] = useState("");
  const [escaneando, setEscaneando] = useState(false);
  const [resultado, setResultado] = useState(null); // { tipo: 'ok'|'error', msg }
  const [ultimaScan, setUltimaScan] = useState(null);
  const scannerRef = useRef(null);

  // Load camiones
  useEffect(() => {
    get(ref(db, "camiones")).then((snap) => {
      const data = snap.val() || {};
      setCamiones(data);
      const ids = Object.keys(data);
      if (ids.length > 0) setCamionId(ids[0]);
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    if (!camionId) return;

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 240, height: 240 } },
      async (decoded) => {
        await scanner.stop();
        scannerRef.current = null;
        await procesarScan(decoded);
        // Re-inicia después de escanear
        setTimeout(() => reiniciarScanner(scanner), 2000);
      },
      () => {}
    ).then(() => setEscaneando(true)).catch(() => {
      setResultado({ tipo: "error", msg: "No se pudo acceder a la cámara." });
    });

    return () => {
      if (scannerRef.current) scannerRef.current.stop().catch(() => {});
    };
  }, [camionId]);
  const reiniciarScanner = async (scanner) => {
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decoded) => {
          await scanner.stop();
          await procesarScan(decoded);
          setTimeout(() => reiniciarScanner(scanner), 2000);
        },
        () => {}
      );
      setEscaneando(true);
    } catch {}
  };

  const procesarScan = async (texto) => {
    // Expected format: "rutaId:paradaIndex"
    const partes = texto.trim().split(":");
    if (partes.length < 2) {
      setResultado({
        tipo: "error",
        msg: `QR inválido. Formato esperado: rutaId:paradaIndex`,
      });
      return;
    }

    const rutaId = partes[0];
    const paradaIndex = parseInt(partes[1]);

    if (isNaN(paradaIndex)) {
      setResultado({ tipo: "error", msg: "Índice de parada inválido en el QR." });
      return;
    }

    try {
      const snap = await get(ref(db, `camiones/${camionId}`));
      const camionData = snap.val() || {};

      const ahora = Date.now();
      const anterior = camionData.ultimoScan || null;

      // Calculate speed: 500m between stops
      let velocidad = camionData.velocidadMs || 8.33; // default ~30 km/h
      if (anterior && ahora > anterior) {
        const dt = (ahora - anterior) / 1000; // seconds
        velocidad = 500 / dt; // m/s
      }

      // Get stop name for UI
      const rutaSnap = await get(ref(db, `rutas/${rutaId}/paradas/${paradaIndex}`));
      const paradaNombre = rutaSnap.val()?.nombre || `Parada ${paradaIndex}`;

      await update(ref(db, `camiones/${camionId}`), {
        rutaId,
        paradaActual: paradaIndex,
        penultimoScan: anterior,
        ultimoScan: ahora,
        velocidadMs: parseFloat(velocidad.toFixed(4)),
      });

      const tiempo = new Date(ahora).toLocaleTimeString("es-MX");
      setUltimaScan({ paradaNombre, tiempo, velocidad });
      setResultado({
        tipo: "ok",
        msg: `Registrado en "${paradaNombre}" a las ${tiempo}`,
      });
    } catch (err) {
      setResultado({ tipo: "error", msg: "Error al actualizar Firebase." });
    }
  };

  return (
    <div className="conductor-page">
      <div className="page-header">
        <h2 className="page-title">Panel del Conductor</h2>
        <p className="page-subtitle">Escanea el QR de cada parada para actualizar tu posición</p>
      </div>

      {/* Camión selector */}
      <div className="form-group">
        <label className="form-label">Camión activo</label>
        <select
          className="input"
          value={camionId}
          onChange={(e) => setCamionId(e.target.value)}
        >
          {Object.keys(camiones).length === 0 && (
            <option value="">No hay camiones — crea uno en /admin</option>
          )}
          {Object.entries(camiones).map(([id, c]) => (
            <option key={id} value={id}>
              {c.nombre || id}
            </option>
          ))}
        </select>
      </div>

      {/* Scanner area */}
      <div className={`scanner-wrap ${escaneando ? "scanning" : ""}`}>
        <div id="qr-reader" className="qr-reader-area" />
        {!escaneando && (
          <div className="scanner-placeholder">
            <div className="scanner-icon">⬛</div>
            <p>Cámara inactiva</p>
          </div>
        )}
      </div>

      {/* Controls */}

      {/* Last scan info */}
      {ultimaScan && (
        <div className="last-scan-card">
          <span className="last-scan-label">Último registro</span>
          <span className="last-scan-parada">{ultimaScan.paradaNombre}</span>
          <div className="last-scan-meta">
            <span>{ultimaScan.tiempo}</span>
            <span className="dot-sep">·</span>
            <span>{(ultimaScan.velocidad * 3.6).toFixed(1)} km/h</span>
          </div>
        </div>
      )}

      {/* Result message */}
      {resultado && (
        <div className={`scan-resultado ${resultado.tipo}`} key={Date.now()}>
          <span className="resultado-icon">
            {resultado.tipo === "ok" ? "✓" : "✕"}
          </span>
          {resultado.msg}
        </div>
      )}
    </div>
  );
}
