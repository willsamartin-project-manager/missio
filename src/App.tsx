import { useEffect } from 'react'; // Added useEffect
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { seedAdminUser } from './lib/adminSeeder'; // Import seeder
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import PendingApproval from './pages/PendingApproval';
import TestPlayground from './pages/TestPlayground'; // Import TestPlayground
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NewEvent from './pages/NewEvent';
import EditEvent from './pages/EditEvent';
import EventReport from './pages/EventReport';
import Collaborators from './pages/Collaborators';
import Settings from './pages/Settings';
import UsersList from './pages/UsersList';
import Reports from './pages/Reports';
import PerformanceIndicators from './pages/PerformanceIndicators';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  useEffect(() => {
    seedAdminUser();
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route path="/test" element={<TestPlayground />} /> {/* Test Route */}

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="reports" element={<Reports />} />
                <Route path="new-event" element={<NewEvent />} />
                <Route path="edit-event/:id" element={<EditEvent />} />
                <Route path="report/:eventId" element={<EventReport />} />
                <Route path="collaborators" element={<Collaborators />} />
                <Route path="users" element={<UsersList />} />
                <Route path="settings" element={<Settings />} />
                <Route path="performance" element={<PerformanceIndicators />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
