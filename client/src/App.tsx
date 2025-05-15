import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Meters from './pages/Meters';
import CarbonJourney from './pages/CarbonJourney';
import BillingReport from './pages/BillingReport';
import Login from './pages/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ProfilePage from "@/pages/ProfilePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} />
          <Route path="meters" element={<Meters />} />
          <Route path="carbon-journey" element={<CarbonJourney />} />
          <Route path="billing-report" element={<BillingReport />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
