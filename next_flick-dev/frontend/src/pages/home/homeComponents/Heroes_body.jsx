import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVariable } from "../../../utils/localStorage";
import ApiService from "../../../services/Api.service";
import "./Heroes_body.scss"

const Heroes = ({ onRequireLogin }) => {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState("");
    const [showLoginPopup, setShowLoginPopup] = useState(false);

    const isLoggedIn = () => {
        return !!getVariable("km_user_token");
    };

    const handleSearch = async () => {
        if (!prompt.trim()) return;

        if (!isLoggedIn()) {
        onRequireLogin();
        return;
        }

        try {
        const { data, error } = await ApiService.getAllChatBots();

        if (error || !data?.result?.length) {
        toast.error("No default chatbot found for your account");
        return;
        }

        const bot = data.result[0];

        navigate(`/default/chat?id=${bot._id["$oid"]}&namespace_id=${bot.namespace_id}&prompt=${encodeURIComponent(prompt)}`);
        } catch (err) {
            console.error(err);
            toast.error("Unable to open chat");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
        }
    };
    return (
        <div className="hero-section">
            <div className="hero-bg">
                <div className="hero-bg-track">
                    <img src="/img/Background_for_heroes_homePage.png" alt="bg" />
                    <img src="/img/Background_for_heroes_homePage.png" alt="bg" />
                </div>
            </div>
            <div className="hero-content d-flex align-items-end text-center text-white">
                <div className="container pb-5">                    
                    {/* Optional Heading */}
                    <h1 className="display-4 fw-bold mb-4">
                        Confuse..!What to watch<br/> Try me 👇
                    </h1>
                    {/* Search Bar */}
                    <div className="row justify-content-center">
                        <div className="col-md-8 col-lg-6">
                            <div className="input-group input-group-lg shadow hero-search shadow-lg">
                                <input
                                    type="text"
                                    className="form-control border-0 hero-search-input"
                                    placeholder="Bridge between your confusion to your entertainment"
                                    aria-label="Search"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <button className="hero-search-btn" type="button" onClick={handleSearch}>
                                    <i className="bi bi-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* 🔐 Login Required Popup
            {showLoginPopup && (
                <div className="login-popup-overlay">
                    <div className="login-popup">
                        <h5 className="fw-bold mb-2">Login Required</h5>
                        <p>You will need to login first to use this feature.</p>

                        <div className="d-flex gap-2 justify-content-center">
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate("/login")}
                            >
                                Login
                            </button>
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => setShowLoginPopup(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )} */}
        </div>
    );
}

export default Heroes