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
          <Link to="/dashboard">← Volver al panel</Link>
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
        <h2>🔒 Nota sobre la protección</h2>
        <p>
          Esta ruta está protegida por <code>&lt;PrivateRoute&gt;</code>. Si
          intentas acceder a <code>/users/{userId}</code> sin sesión, serás
          redirigido a <code>/login</code> y, tras autenticarte, volverás
          automáticamente aquí.
        </p>
      </section>

      <section className="page__section">
        <h2>Otros usuarios</h2>
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
        </ul>
      </section>
    </div>
  );
}

