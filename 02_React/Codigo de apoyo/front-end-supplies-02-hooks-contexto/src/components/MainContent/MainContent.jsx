import React, {useContext, useState} from "react";
import "./MainContent.css";
import {GlobalContext} from "../../context/global/GlobalContext.jsx";

export default function MainContent() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
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

    return (
        <div className={`main-content${darkMode ? " dark" : ""}`}>
            <h1>UNIR Supplies</h1>
            <p>Bienvenido a la plataforma de suministros para tiendas UNIR.</p>
            <p>Selecciona una opción en el menú para comenzar.</p>

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
        </div>
    );
}