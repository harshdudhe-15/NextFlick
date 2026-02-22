import React, { useState } from "react";
import { Link , useNavigate} from "react-router-dom";
import { removeUser, getVariable } from "../../../utils/localStorage";
import ApiService from "../../../services/Api.service";
import "./Header.scss"

const Header = ({ onLoginClick }) => {
    const navigate = useNavigate();
    const token = getVariable("km_user_token");
    const isLoggedIn = Boolean(token);
    const username = getVariable("km_user_name");
    console.log("USERNAME:", username);

    const [searchQuery, setSearchQuery] = useState("");
    
    const initials = username
        ? username
            .trim()
            .split(/\s+/)
            .map(w => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : "👤";
    
    const handleLogout = () => {
    removeUser();
    navigate("/", { replace: true });
    };

    const botRout = async () =>{
        try {
            const { data, error } = await ApiService.getAllChatBots();

            if (error || !data?.result?.length) {
            toast.error("No default chatbot found for your account");
            return;
            }

            const bot = data.result[0];

            navigate(`/default/chat?id=${bot._id["$oid"]}&namespace_id=${bot.namespace_id}`);
        } catch (error) {
            console.error(err);
            toast.error("Unable to open chat");
        };
    }

    const handleSearch = (e) => {
        e.preventDefault();

        if (!searchQuery.trim()) return;

        navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
        setSearchQuery("");
    };


    return (
        <header className="header">
            <div className=" header-inner">
                {/* LOGO */}
                <Link
                to="/"
                className="navbar-brand d-flex align-items-center"
                >
                <img
                    src="/img/NectFlick_Logo.png"
                    alt="NextFlick Logo"
                    className="navbar-logo glow-red"
                />
                </Link>

                {/* 🔎 CENTER SEARCH BAR (Only when logged in) */}
                {isLoggedIn && (
                    <form className="header-search" onSubmit={handleSearch}>
                        <div className="search-wrapper">
                            <input
                                type="text"
                                placeholder="Search movies or TV shows..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="search-icon-btn">
                                🔍
                            </button>
                        </div>
                    </form>
                )}

                {/* RIGHT SIDE */}
                <div className="header-right">
                    {!isLoggedIn ? (
                        <button
                        className="btn nextflick-login-btn"
                        onClick={onLoginClick}
                        >
                        Login
                        </button>
                    ) : (
                        <>
                        <div className="user-avatar">
                            {initials || "👤"}
                        </div>

                        <button
                        className="btn chats-btn"
                        onClick={botRout}
                        >
                            Chats
                        </button>

                        <button
                            className="btn signout-btn"
                            onClick={handleLogout}
                        >
                            Sign out
                        </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
