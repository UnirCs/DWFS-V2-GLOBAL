import "./Footer.css";

export default function Footer({ year }) {
  return (
    <footer className="footer">
      <p>© {year} <strong>CineReact</strong> · Todos los derechos reservados</p>
      <p className="footer__sub">Hecho con ❤️ y React</p>
    </footer>
  );
}
