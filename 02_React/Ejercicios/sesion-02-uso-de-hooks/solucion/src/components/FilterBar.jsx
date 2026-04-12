import "./FilterBar.css";

const SPECIES = [
  { value: "all",    label: "🐾 Todos" },
  { value: "dog",    label: "🐶 Perros" },
  { value: "cat",    label: "🐱 Gatos" },
  { value: "rabbit", label: "🐰 Conejos" },
];

export default function FilterBar({ activeSpecies, onSpeciesChange }) {
  return (
    <div className="filter-bar">
      <span className="filter-bar__label">Filtrar por:</span>
      <div className="filter-bar__buttons">
        {SPECIES.map(({ value, label }) => (
          <button
            key={value}
            className={`filter-bar__btn ${activeSpecies === value ? "filter-bar__btn--active" : ""}`}
            onClick={() => onSpeciesChange(value)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
