import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import UserProfile from "./pages/UserProfile";
import Products from "./pages/Products";

export default function App() {
  console.log("🔄 [App] render");

  return (
    <Routes>
      {/* Route padre sin path → siempre coincide → renderiza el Layout común */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/users/:userId" element={<UserProfile />} />
        <Route path="/products" element={<Products />} />
      </Route>
    </Routes>
  );
}

