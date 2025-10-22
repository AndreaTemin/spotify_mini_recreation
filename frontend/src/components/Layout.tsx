import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="layout">
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '1rem', 
        borderBottom: '1px solid #ccc' 
      }}>
        <div>
          <Link to="/">Home</Link>
          {/* We can add more links here later */}
        </div>
        <div>
          {user && (
            <>
              <span style={{ marginRight: '1rem' }}>{user.email}</span>
              <button onClick={logout}>Logout</button>
            </>
          )}
        </div>
      </nav>
      
      {/* This Outlet renders the active child route (e.g., HomePage) */}
      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;