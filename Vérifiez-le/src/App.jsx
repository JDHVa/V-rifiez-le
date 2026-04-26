import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Pasajero from "./pages/Pasajero";
import Conductor from "./pages/Conductor";
import Admin from "./pages/Admin";
import QRViewer from "./pages/QRViewer";

// dentro de <Routes>:

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Pasajero />} />
        <Route path="/conductor" element={<Conductor />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/qr" element={<QRViewer />} />
      </Routes>
    </>
  );
}