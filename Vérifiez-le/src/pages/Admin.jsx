import { useEffect, useState } from "react";
import { ref, set, get, push } from "firebase/database";
import QRCode from "qrcode";
import { db } from "../firebase";

const paradaVacia = () => ({ nombre: "", lat: "", lng: "" });

export default function Admin() {
  const [rutas, setRutas] = useState({});
  const [nombreRuta, setNombreRuta] = useState("");
  const [paradas, setParadas] = useState([paradaVacia(), paradaVacia()]);
  const [qrUrls, setQrUrls] = useState({}); // { index: dataUrl }
  const [rutaGuardadaId, setRutaGuardadaId] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [nombreCamion, setNombreCamion] = useState("");
  const [rutaSeleccionada, setRutaSeleccionada] = useState("");
  const [creandoCamion, setCreandoCamion] = useState(false);

  const [toast, setToast] = useState(null);

  const mostrarToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const recargarRutas = async () => {
    const snap = await get(ref(db, "rutas"));
    const data = snap.val() || {};
    setRutas(data);
    return data;
  };

  useEffect(() => {
    recargarRutas();
  }, []);

  // Parada handlers
  const actualizarParada = (i, campo, valor) => {
    setParadas((prev) => {
      const nuevas = [...prev];
      nuevas[i] = { ...nuevas[i], [campo]: valor };
      return nuevas;
    });
  };

  const agregarParada = () => setParadas((p) => [...p, paradaVacia()]);

  const eliminarParada = (i) => {
    if (paradas.length <= 2) return;
    setParadas((p) => p.filter((_, idx) => idx !== i));
  };

  // Save route + generate QR
  const guardarRuta = async () => {
    if (!nombreRuta.trim()) {
      mostrarToast("Escribe un nombre para la ruta.", "error");
      return;
    }
    if (paradas.some((p) => !p.nombre.trim() || !p.lat || !p.lng)) {
      mostrarToast("Completa todos los campos de cada parada.", "error");
      return;
    }

    setGuardando(true);
    try {
      const rutaRef = push(ref(db, "rutas"));
      const paradasData = paradas.map((p, i) => ({
        id: `p${i}`,
        nombre: p.nombre.trim(),
        lat: parseFloat(p.lat),
        lng: parseFloat(p.lng),
        orden: i,
      }));

      await set(rutaRef, { nombre: nombreRuta.trim(), paradas: paradasData });

      // Generate QR for each stop
      const urls = {};
      for (let i = 0; i < paradasData.length; i++) {
        const texto = `${rutaRef.key}:${i}`;
        urls[i] = await QRCode.toDataURL(texto, {
          width: 300,
          margin: 2,
          color: { dark: "#000000", light: "#ffffff" },
        });
      }

      setQrUrls(urls);
      setRutaGuardadaId(rutaRef.key);
      await recargarRutas();
      mostrarToast(`Ruta "${nombreRuta}" guardada con ${paradas.length} paradas.`);
    } catch (err) {
      mostrarToast("Error al guardar la ruta.", "error");
    } finally {
      setGuardando(false);
    }
  };

  // Create camion
  const crearCamion = async () => {
    if (!nombreCamion.trim()) {
      mostrarToast("Escribe un nombre para el camión.", "error");
      return;
    }
    if (!rutaSeleccionada) {
      mostrarToast("Selecciona una ruta.", "error");
      return;
    }
    setCreandoCamion(true);
    try {
      const camionRef = push(ref(db, "camiones"));
      await set(camionRef, {
        nombre: nombreCamion.trim(),
        rutaId: rutaSeleccionada,
        paradaActual: 0,
        ultimoScan: null,
        penultimoScan: null,
        velocidadMs: null,
      });
      mostrarToast(`Camión "${nombreCamion}" creado.`);
      setNombreCamion("");
    } catch {
      mostrarToast("Error al crear el camión.", "error");
    } finally {
      setCreandoCamion(false);
    }
  };

  const descargarQR = (url, nombreParada, index) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-parada-${index}-${nombreParada.replace(/\s+/g, "_")}.png`;
    a.click();
  };

  const descargarTodos = () => {
    Object.entries(qrUrls).forEach(([i, url]) => {
      setTimeout(
        () => descargarQR(url, paradas[i]?.nombre || `parada_${i}`, i),
        parseInt(i) * 300
      );
    });
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2 className="page-title">Panel de Administración</h2>
        <p className="page-subtitle">Crea rutas, paradas y camiones</p>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.tipo}`}>
          {toast.tipo === "ok" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      {/* ── Crear Ruta ── */}
      <section className="admin-section">
        <h3 className="section-title">Crear Ruta</h3>

        <div className="form-group">
          <label className="form-label">Nombre de la ruta</label>
          <input
            className="input"
            placeholder="Ej. Ruta Centro — UANL"
            value={nombreRuta}
            onChange={(e) => setNombreRuta(e.target.value)}
          />
        </div>

        <div className="paradas-header">
          <span className="form-label">Paradas</span>
          <span className="form-hint">500m entre cada una</span>
        </div>

        <div className="paradas-list">
          {paradas.map((p, i) => (
            <div key={i} className="parada-row">
              <span className="parada-index">{i + 1}</span>
              <input
                className="input input-sm"
                placeholder="Nombre"
                value={p.nombre}
                onChange={(e) => actualizarParada(i, "nombre", e.target.value)}
              />
              <input
                className="input input-sm"
                placeholder="Latitud"
                value={p.lat}
                onChange={(e) => actualizarParada(i, "lat", e.target.value)}
              />
              <input
                className="input input-sm"
                placeholder="Longitud"
                value={p.lng}
                onChange={(e) => actualizarParada(i, "lng", e.target.value)}
              />
              <button
                className="btn-icon"
                onClick={() => eliminarParada(i)}
                disabled={paradas.length <= 2}
                title="Eliminar parada"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="btn-row">
          <button className="btn-secondary" onClick={agregarParada}>
            + Parada
          </button>
          <button
            className="btn-primary"
            onClick={guardarRuta}
            disabled={guardando}
          >
            {guardando ? "Guardando…" : "Guardar y generar QR"}
          </button>
        </div>

        {/* QR results */}
        {Object.keys(qrUrls).length > 0 && (
          <div className="qr-section">
            <div className="qr-section-header">
              <span className="form-label">Códigos QR generados</span>
              <button className="btn-secondary btn-sm" onClick={descargarTodos}>
                Descargar todos
              </button>
            </div>
            <div className="qr-grid">
              {Object.entries(qrUrls).map(([i, url]) => (
                <div key={i} className="qr-item">
                  <div className="qr-img-wrap">
                    <img src={url} alt={`QR parada ${i}`} />
                  </div>
                  <p className="qr-label">{paradas[i]?.nombre || `Parada ${i}`}</p>
                  <span className="qr-code-text">
                    {rutaGuardadaId}:{i}
                  </span>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => descargarQR(url, paradas[i]?.nombre, i)}
                  >
                    Descargar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Crear Camión ── */}
      <section className="admin-section">
        <h3 className="section-title">Crear Camión</h3>

        <div className="form-group">
          <label className="form-label">Nombre del camión</label>
          <input
            className="input"
            placeholder="Ej. Camión 42"
            value={nombreCamion}
            onChange={(e) => setNombreCamion(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Ruta asignada</label>
          <select
            className="input"
            value={rutaSeleccionada}
            onChange={(e) => setRutaSeleccionada(e.target.value)}
          >
            <option value="">Seleccionar ruta…</option>
            {Object.entries(rutas).map(([id, r]) => (
              <option key={id} value={id}>
                {r.nombre}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn-primary"
          onClick={crearCamion}
          disabled={creandoCamion}
        >
          {creandoCamion ? "Creando…" : "Crear Camión"}
        </button>
      </section>
    </div>
  );
}
