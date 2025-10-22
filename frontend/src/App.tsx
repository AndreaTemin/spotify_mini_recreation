import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout'; // Import the layout

// Import our pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage'; // Import the real home page

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}> {/* Wrap protected routes in the Layout */}
          
          <Route path="/" element={<HomePage />} />
          {/* <Route path="/track/:id" element={<TrackPage />} /> */}
          {/* <Route path="/playlist/:id" element={<PlaylistPage />} /> */}
        
        </Route>
      </Route>
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;