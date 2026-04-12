import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserProfile from "./pages/UserProfile";
import Products from "./pages/Products";

export default function App() {
  console.log("🔄 [App] render");

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas – envueltas con PrivateRoute */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/users/:userId"
          element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/products"
          element={
            <PrivateRoute>
              <Products />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
}

