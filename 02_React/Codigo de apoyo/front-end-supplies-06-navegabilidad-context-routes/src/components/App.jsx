import React from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import {GlobalProvider} from "../context/global/GlobalProvider.jsx";
import Menu from "./Menu/Menu.jsx";
import MainContent from "./MainContent/MainContent.jsx";
import Footer from "./Footer/Footer.jsx";
import Home from "./Home/Home.jsx";
import Products from "./Products/Products.jsx";
import Stores from "./Stores/Stores.jsx";
import Contact from "./Contact/Contact.jsx";
import ProductDetail from "./ProductDetail/ProductDetail.jsx";
import Login from "./Login/Login.jsx";
import Profile from "./Profile/Profile.jsx";
import PrivateRoute from "./PrivateRoute/PrivateRoute.jsx";
import {AuthProvider} from "../context/auth/AuthProvider.jsx";

export default function App() {
    return (
        <GlobalProvider>
            <AuthProvider>
                <BrowserRouter>
                    <div className="app-layout">
                        <Menu/>
                        <Routes>
                            <Route path="/login" element={<Login/>}/>
                            <Route path="/" element={<MainContent/>}>
                                <Route index element={<Home/>}/>
                                <Route path="products" element={<Products/>}/>
                                <Route path="products/:productId" element={<ProductDetail/>}/>
                                <Route path="stores" element={<Stores/>}/>
                                <Route path="contact" element={<Contact/>}/>
                                <Route path="profile" element={
                                    <PrivateRoute>
                                        <Profile/>
                                    </PrivateRoute>
                                }/>
                            </Route>
                        </Routes>
                        <Footer/>
                    </div>
                </BrowserRouter>
            </AuthProvider>
        </GlobalProvider>
    );
}