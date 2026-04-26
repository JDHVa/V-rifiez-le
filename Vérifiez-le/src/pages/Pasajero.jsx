import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

const DARK_TILES =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

const busIcon = L.divIcon({
  className: "",
  html: `<div class="bus-marker">🚌</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const stopIcon = L.divIcon({
  className: "",
  html: `<div class="stop-dot"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

// Pan map when position changes
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.panTo(center, { animate: true, duration: 1.2 });
  }, [center, map]);
  return null;
}

export default function Pasajero() {
  const [camiones, setCamiones] = useState({});
  const [camionId, setCamionId] = useState(null);
  const [camion, setCamion] = useState(null);
  const [ruta, setRuta] = useState(null);

  // Load all camiones, auto-select first
  useEffect(() => {
    return onValue(ref(db, "camiones"), (snap) => {
      const data = snap.val() || {};
      setCamiones(data);
      if (!camionId) {
        const ids = Object.keys(data);
        if (ids.length > 0) setCamionId(ids[0]);
      }
    });
  }, []);

  // Listen to selected camion
  useEffect(() => {
    if (!camionId) return;
    return onValue(ref(db, `camiones/${camionId}`), (snap) => {
      setCamion(snap.val());
    });
  }, [camionId]);

  // Listen to ruta when camion.rutaId changes
  useEffect(() => {
    if (!camion?.rutaId) return;
    return onValue(ref(db, `rutas/${camion.rutaId}`), (snap) => {
      setRuta(snap.val());
    });
  }, [camion?.rutaId]);

  const paradas = ruta?.paradas
    ? Object.values(ruta.paradas).sort((a, b) => a.orden - b.orden)
    : [];

  const paradaActual = camion?.paradaActual ?? 0;
  const paradaObj = paradas[paradaActual];
  const center = paradaObj
    ? [paradaObj.lat, paradaObj.lng]
    : [25.6866, -100.3161]; // Monterrey default

  // ETA calculation
  let etaTexto = "Sin datos";
  let velocidadTexto = "—";
  let progreso = 0;

  if (camion?.velocidadMs && camion.velocidadMs > 0 && paradas.length > 0) {
    const paradasRestantes = paradas.length - 1 - paradaActual;
    const etaSeg = (paradasRestantes * 500) / camion.velocidadMs;
    const etaMin = Math.round(etaSeg / 60);
    etaTexto = paradasRestantes <= 0 ? "Llegando" : `${etaMin} min`;
    velocidadTexto = `${(camion.velocidadMs * 3.6).toFixed(1)} km/h`;
    progreso = paradas.length > 1 ? (paradaActual / (paradas.length - 1)) * 100 : 100;
  }

  const sinDatos = Object.keys(camiones).length === 0;

  return (
    <div className="pasajero-page">
      {/* Selector de camión */}
      {Object.keys(camiones).length > 1 && (
        <div className="camion-selector">
          {Object.entries(camiones).map(([id, c]) => (
            <button
              key={id}
              className={`selector-btn ${camionId === id ? "active" : ""}`}
              onClick={() => setCamionId(id)}
            >
              {c.nombre || id}
            </button>
          ))}
        </div>
      )}

      {/* Info bar */}
      <div className="info-bar">
        {sinDatos ? (
          <span className="info-empty">
            No hay camiones registrados. Ve a /admin para crear uno.
          </span>
        ) : (
          <>
            <div className="info-chip">
              <span className="chip-label">Ruta</span>
              <span className="chip-value">{ruta?.nombre || "—"}</span>
            </div>
            <div className="info-divider" />
            <div className="info-chip">
              <span className="chip-label">Parada actual</span>
              <span className="chip-value">{paradaObj?.nombre || "—"}</span>
            </div>
            <div className="info-divider" />
            <div className="info-chip">
              <span className="chip-label">ETA</span>
              <span className="chip-value eta-highlight">{etaTexto}</span>
            </div>
            <div className="info-divider" />
            <div className="info-chip">
              <span className="chip-label">Velocidad</span>
              <span className="chip-value mono">{velocidadTexto}</span>
            </div>
            <div className="info-chip progress-chip">
              <span className="chip-label">
                Progreso {paradaActual + 1}/{paradas.length}
              </span>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progreso}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Map */}
      <MapContainer center={center} zoom={14} className="mapa">
        <TileLayer url={DARK_TILES} attribution={ATTRIBUTION} />
        {paradaObj && <MapUpdater center={center} />}

        {/* Route polyline */}
        {paradas.length > 1 && (
          <Polyline
            positions={paradas.map((p) => [p.lat, p.lng])}
            color="#f59e0b"
            opacity={0.35}
            weight={4}
            dashArray="8 6"
          />
        )}

        {/* Stops */}
        {paradas.map((p, i) => (
          <Marker key={i} position={[p.lat, p.lng]} icon={stopIcon}>
            <Popup className="custom-popup">
              <strong>{p.nombre}</strong>
              <br />
              Parada {i + 1}
            </Popup>
          </Marker>
        ))}

        {/* Bus */}
        {paradaObj && (
          <Marker position={[paradaObj.lat, paradaObj.lng]} icon={busIcon}>
            <Popup className="custom-popup">
              <strong>{camion?.nombre || "Camión"}</strong>
              <br />
              {paradaObj.nombre}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
