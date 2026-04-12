import "./PageLayout.css";
import Sidebar from "../Sidebar/Sidebar.jsx";

export default function PageLayout({ genres, featuredMovie, children }) {
  return (
    <div className="page-layout">
      <Sidebar genres={genres} featuredMovie={featuredMovie} />
      <main className="page-layout__main">{children}</main>
    </div>
  );
}
