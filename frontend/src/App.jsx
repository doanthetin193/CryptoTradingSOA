import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Trade from "./pages/Trade";
import History from "./pages/History";
import Settings from "./pages/Settings";

export default function App() {
  // Mock authentication - TẮT để test giao diện dễ hơn
  // const isAuthenticated = true; // Set true để bypass authentication

  return (
    <Router>
      <Routes>
        {/* Auth Route - Có thể truy cập trực tiếp */}
        <Route path="/auth" element={<Auth />} />

        {/* All Routes - Không cần authentication để test */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="trade" element={<Trade />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
