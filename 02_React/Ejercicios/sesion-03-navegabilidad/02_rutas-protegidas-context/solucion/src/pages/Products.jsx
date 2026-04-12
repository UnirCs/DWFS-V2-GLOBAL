import { useSearchParams } from "react-router-dom";
import { products, categories } from "../data/products";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category");

  console.log("📦 [Products] render – category:", activeCategory ?? "(todas)");

  const filtered = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  const handleCategoryClick = (category) => {
    console.log("📦 [Products] setSearchParams – category:", category ?? "(limpiar)");
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="page">
      <h1>📦 Catálogo de productos</h1>
      <p className="page__intro">
        Filtra por categoría con <strong>query params</strong>. Esta ruta está
        protegida por <code>&lt;PrivateRoute&gt;</code>.
      </p>

      <div className="products__filters">
        <button
          className={`products__filter-btn ${!activeCategory ? "products__filter-btn--active" : ""}`}
          onClick={() => handleCategoryClick(null)}
        >
          Todas ({products.length})
        </button>
        {categories.map((cat) => {
          const count = products.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              className={`products__filter-btn ${activeCategory === cat ? "products__filter-btn--active" : ""}`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {activeCategory && (
        <p className="products__active-filter">
          Filtro activo: <strong>{activeCategory}</strong> – Mostrando{" "}
          {filtered.length} producto{filtered.length !== 1 && "s"}
        </p>
      )}

      <div className="products__grid">
        {filtered.map((product) => (
          <div key={product.id} className="products__card">
            <h3 className="products__card-name">{product.name}</h3>
            <span className="products__card-category">{product.category}</span>
            <span className="products__card-price">{product.price} €</span>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="products__empty">No hay productos en esta categoría.</p>
      )}
    </div>
  );
}

