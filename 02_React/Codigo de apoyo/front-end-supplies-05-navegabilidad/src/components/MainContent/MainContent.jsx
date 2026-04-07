import React, {useContext} from "react";
import { Outlet } from "react-router-dom";
import "./MainContent.css";
import {GlobalContext} from "../../context/global/GlobalContext";

export default function MainContent() {
    const { darkMode } = useContext(GlobalContext);
    return (
        <div className={`main-content${darkMode ? " dark" : ""}`}>
            <Outlet />
        </div>
    );
}