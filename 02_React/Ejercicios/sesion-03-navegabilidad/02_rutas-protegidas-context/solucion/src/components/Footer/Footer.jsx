import "./Footer.css";

export default function Footer() {
  console.log("🦶 [Footer] render");

  return (
    <footer className="footer">
      <p>© 2026 <strong>RoutExplorer</strong> – React Router 7</p>
      <p className="footer__sub">Ejercicio de rutas protegidas con Context API</p>
    </footer>
  );
}

