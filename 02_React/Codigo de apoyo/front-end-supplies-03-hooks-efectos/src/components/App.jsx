import React from "react";
import MainContent from "./MainContent/MainContent.jsx";
import Footer from "./Footer/Footer.jsx";
import Menu from "./Menu/Menu.jsx";
import {GlobalProvider} from "../context/global/GlobalProvider.jsx";

export default function App() {

    return (
        <GlobalProvider>
            <div className="app-layout">
                <Menu/>
                <MainContent/>
                <Footer/>
            </div>
        </GlobalProvider>
    );
}