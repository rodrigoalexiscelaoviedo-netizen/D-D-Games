import { useAuth } from '../hooks/useAuth';

export const Dashboard = () => {
  const auth = useAuth();

  const handleLogout = async () => {
    await auth.logout();
    // Router will redirect to / due to ProtectedRoute
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Mis Campañas</h1>
        <div className="user-menu">
          <span>{auth.user?.email}</span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="campaigns-grid">
          <p>No tienes campañas aún.</p>
          <button className="btn-primary">+ Crear campaña</button>
        </section>
      </main>
    </div>
  );
};
