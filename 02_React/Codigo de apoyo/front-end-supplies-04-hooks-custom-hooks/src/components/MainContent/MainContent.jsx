import React, {useContext, useState} from "react";
import "./MainContent.css";
import { useProducts } from "../../hooks/useProducts";
import {GlobalContext} from "../../context/global/GlobalContext.jsx";

export default function MainContent() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const { darkMode } = useContext(GlobalContext);

    // Custom hook que maneja toda la lógica de productos
    const { products, loading, error: fetchError } = useProducts();

    function validateEmail(email) {
        // Expresión regular simple para validar email
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function handleChange(e) {
        const value = e.target.value;
        setEmail(value);
        if (value === "" || validateEmail(value)) {
            setError("");
        } else {
            setError("Introduce un correo electrónico válido.");
        }
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (validateEmail(email)) {
            console.log("Correo enviado:", email);
            setEmail("");
            setError("");
        } else {
            setError("Introduce un correo electrónico válido.");
            alert("El correo no es válido");
        }
    }

    return (
        <div className={`main-content${darkMode ? " dark" : ""}`}>
            <h1>UNIR Supplies</h1>
            <p>Bienvenido a la plataforma de suministros para tiendas UNIR.</p>
            <p>Selecciona una opción en el menú para comenzar.</p>

            {/* Sección de productos */}
            <section className="products-section">
                <h2>Productos Disponibles</h2>

                {loading && <p className="loading-message">Cargando productos...</p>}
                {fetchError && <p className="fetch-error">{fetchError}</p>}
                {!loading && products.length > 0 && (
                    <div className="products-grid">
                        {products.map(product => (
                            <div key={product.id} className="product-card">
                                <div className="product-header">
                                    <h3 className="product-name">{product.name}</h3>
                                    <span className="product-type">{product.type}</span>
                                </div>
                                <p className="product-description">{product.description}</p>
                                <div className="product-footer">
                                    <span className="product-price">€{product.price}</span>
                                    <span className="product-stock">Stock: {product.stock}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Formulario de newsletter */}
            <section className="newsletter-section">
                <h2>Newsletter</h2>
                <form className="newsletter-form" onSubmit={handleSubmit} autoComplete="off">
                    <label htmlFor="newsletter-email">Suscríbete a la newsletter:</label>
                    <input
                        id="newsletter-email"
                        type="email"
                        placeholder="Tu correo electrónico"
                        value={email}
                        onChange={handleChange}
                    />
                    <button type="submit">Enviar</button>
                    <p className="newsletter-error">
                        {error}
                    </p>
                </form>
            </section>
        </div>
    );
}