import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./Layout.css";

export default function Layout() {
  console.log("📐 [Layout] render");

  return (
    <div className="layout">
      <Navbar />
      <main className="layout__content">
        {/* Outlet = hueco donde React Router renderiza la ruta hija activa */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

