import React, { lazy, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./home.scss"
import Login from "../auth/Login";
import Register from "../auth/Register";
import About from "./homeComponents/About";
import Footer from "./homeComponents/Footer";
import Info from "./homeComponents/Info";
import TrendingBar from "./homeComponents/TrandingBar";
import IntroLoader from "../loading/IntroLoading";
const Header = lazy(() => import("./homeComponents/Header"));
const Heroes = lazy(() => import("./homeComponents/Heroes_body"));

const Home = () => {
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [showRegisterPopup, setShowRegisterPopup] = useState(false);
    const [registerEmail, setRegisterEmail] = useState("");
    const [showIntro, setShowIntro] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowIntro(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);


    return(  
    <>
      {/* 🔥 INTRO LOADER */}
      {showIntro && <IntroLoader />}

      {/* HOME CONTENT */}
      {!showIntro && (
        <div className="home-div">
          <Header onLoginClick={() => setShowLoginPopup(true)} />
          <Heroes onRequireLogin={() => setShowLoginPopup(true)} />
          <TrendingBar/>
          <About />
          <Info />
          <Footer />
        </div>
      )}
      {/* LOGIN POPUP */}
      {showLoginPopup && (
        <div
          className="login-modal-overlay"
          onClick={() => setShowLoginPopup(false)}
        >
          <div
            className="login-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <Login onLoginSuccess={() => setShowLoginPopup(false)} 
                onUserNotFound={(email) => {
                setShowLoginPopup(false);
                setRegisterEmail(email);   // 🔥 STORE EMAIL
                setShowRegisterPopup(true);
                }}    
            />
          </div>
        </div>
      )}
      {/* REGISTER POPUP */}
        {showRegisterPopup && (
            <div
            className="login-modal-overlay"
            onClick={() => setShowRegisterPopup(false)}
            >
            <div
                className="login-modal-card"
                onClick={(e) => e.stopPropagation()}
            >
                <Register
                email = {registerEmail}
                onRegisterSuccess={() => {
                    setShowRegisterPopup(false);
                    setShowLoginPopup(true); // 🔥 BACK TO LOGIN
                }}
                />
            </div>
            </div>
        )}
    </>
    );
};

export default Home