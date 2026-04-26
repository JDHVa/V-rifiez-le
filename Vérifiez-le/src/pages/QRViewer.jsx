import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import QRCode from "qrcode";
import { db } from "../firebase";

export default function QRViewer() {
  const [rutas, setRutas] = useState({});
  const [qrMap, setQrMap] = useState({}); // { "rutaId:index": dataUrl }
  const [rutaAbierta, setRutaAbierta] = useState(null);

  useEffect(() => {
    return onValue(ref(db, "rutas"), (snap) => {
      setRutas(snap.val() || {});
    });
  }, []);

  // Generate QRs when a ruta is opened
  const abrirRuta = async (rutaId) => {
    if (rutaAbierta === rutaId) {
      setRutaAbierta(null);
      return;
    }
    setRutaAbierta(rutaId);

    const ruta = rutas[rutaId];
    const paradas = Object.values(ruta.paradas || {}).sort((a, b) => a.orden - b.orden);
    const nuevos = {};

    for (let i = 0; i < paradas.length; i++) {
      const key = `${rutaId}:${i}`;
      if (!qrMap[key]) {
        nuevos[key] = await QRCode.toDataURL(`${rutaId}:${i}`, {
          width: 280,
          margin: 2,
          color: { dark: "#000000", light: "#ffffff" },
        });
      }
    }

    setQrMap((prev) => ({ ...prev, ...nuevos }));
  };

  const descargar = (url, nombre, index) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${index}-${nombre.replace(/\s+/g, "_")}.png`;
    a.click();
  };

  const rutasList = Object.entries(rutas);

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2 className="page-title">Códigos QR</h2>
        <p className="page-subtitle">Selecciona una ruta para ver sus QR</p>
      </div>

      {rutasList.length === 0 && (
        <p style={{ color: "var(--text-muted)", fontFamily: "IBM Plex Mono", fontSize: "0.85rem", padding: "0 28px" }}>
          No hay rutas. Crea una en /admin.
        </p>
      )}

      {rutasList.map(([rutaId, ruta]) => {
        const paradas = Object.values(ruta.paradas || {}).sort((a, b) => a.orden - b.orden);
        const abierta = rutaAbierta === rutaId;

        return (
          <section key={rutaId} className="admin-section" style={{ gap: 12 }}>
            <button
              onClick={() => abrirRuta(rutaId)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "none",
                border: "none",
                color: "var(--text)",
                cursor: "pointer",
                padding: 0,
                width: "100%",
                textAlign: "left",
              }}
            >
              <div>
                <p style={{ fontWeight: 800, fontSize: "1rem", fontFamily: "Syne, sans-serif" }}>
                  {ruta.nombre}
                </p>
                <p className="form-label" style={{ marginTop: 2 }}>
                  {paradas.length} paradas
                </p>
              </div>
              <span style={{ color: "var(--amber)", fontSize: "1.2rem" }}>
                {abierta ? "▲" : "▼"}
              </span>
            </button>

            {abierta && (
              <div className="qr-grid" style={{ marginTop: 8 }}>
                {paradas.map((p, i) => {
                  const key = `${rutaId}:${i}`;
                  const url = qrMap[key];
                  return (
                    <div key={i} className="qr-item">
                      <div className="qr-img-wrap">
                        {url ? (
                          <img src={url} alt={`QR ${p.nombre}`} />
                        ) : (
                          <div style={{ width: 110, height: 110, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", fontSize: "0.7rem" }}>
                            Cargando…
                          </div>
                        )}
                      </div>
                      <p className="qr-label">{p.nombre}</p>
                      <span className="qr-code-text">{rutaId}:{i}</span>
                      {url && (
                        <button className="btn-secondary btn-sm" onClick={() => descargar(url, p.nombre, i)}>
                          Descargar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}