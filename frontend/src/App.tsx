import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Import our new pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Placeholder for the main app page
const HomePage = () => <h1>Home Page (Protected)</h1>;

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* All routes inside here are protected */}
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/track/:id" element={<TrackPage />} /> */}
        {/* <Route path="/playlist/:id" element={<PlaylistPage />} /> */}
      </Route>
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;