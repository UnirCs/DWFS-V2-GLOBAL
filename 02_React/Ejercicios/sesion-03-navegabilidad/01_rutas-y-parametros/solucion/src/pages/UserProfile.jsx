import { useParams, Link } from "react-router-dom";
import { users } from "../data/users";

export default function UserProfile() {
  const { userId } = useParams();
  console.log("👤 [UserProfile] render – userId:", userId);

  const user = users.find((u) => u.id === Number(userId));

  if (!user) {
    return (
      <div className="page">
        <h1>❌ Usuario no encontrado</h1>
        <p>
          No existe ningún usuario con id <code>{userId}</code>.
        </p>
        <p>
          <Link to="/">← Volver al inicio</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="user-profile">
        <span className="user-profile__avatar">{user.avatar}</span>
        <div>
          <h1>{user.name}</h1>
          <p className="user-profile__email">{user.email}</p>
        </div>
      </div>

      <section className="page__section">
        <h2>Biografía</h2>
        <p>{user.bio}</p>
      </section>

      <section className="page__section">
        <h2>🔧 ¿Cómo funciona esta vista?</h2>
        <p>
          La ruta está definida como <code>/users/:userId</code>. El hook{" "}
          <code>useParams()</code> devuelve{" "}
          <code>{`{ userId: "${userId}" }`}</code>.
        </p>
        <p>
          Nota que el valor siempre es un <strong>string</strong>. Por eso usamos{" "}
          <code>Number(userId)</code> para compararlo con el <code>id</code> numérico
          del array de usuarios.
        </p>
      </section>

      <section className="page__section">
        <h2>Prueba otros usuarios</h2>
        <ul className="page__list">
          {users
            .filter((u) => u.id !== user.id)
            .map((u) => (
              <li key={u.id}>
                <Link to={`/users/${u.id}`}>
                  {u.avatar} {u.name}
                </Link>
              </li>
            ))}
          <li>
            <Link to="/users/999">❓ Usuario que no existe (id 999)</Link>
          </li>
        </ul>
      </section>
    </div>
  );
}

