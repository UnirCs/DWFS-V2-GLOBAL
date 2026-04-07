import React, {useContext, useEffect, useState} from "react";
import "./MainContent.css";
import {GlobalContext} from "../../context/global/GlobalContext.jsx";
import {mockProducts} from "../../utils/mockData";

export default function MainContent() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");

    const { darkMode } = useContext(GlobalContext);

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

    // useEffect para simular petición HTTP
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setFetchError("");
            try {
                // Simular petición HTTP que siempre falla
                const response = await fetch('https://api.unir-supplies-fake.com/products');
                if (!response.ok) {
                    throw new Error('Error al cargar productos del servidor');
                }
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                console.log("Error en petición HTTP:", err.message);
                console.log("Cargando datos de respaldo...");

                // Cargar datos de respaldo con un pequeño delay para simular carga de datos
                setTimeout(() => {
                    setProducts(mockProducts);
                    setFetchError("Datos cargados desde caché local");
                    setLoading(false);
                }, 1000);
                return;
            }
            setLoading(false);
        };
        fetchProducts();
    }, []); // Array vacío significa que solo se ejecuta al montar el componente

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