import React from "react";
import "./Footer.scss"

const Footer = () =>{
    const currentYear = new Date().getFullYear()
    return (
        <div className="container-fluid footer">
            <div className="container">
            <footer className="d-flex flex-wrap justify-content-between align-items-center py-3 footer-theme">

                <div className="col-md-4 d-flex align-items-center">
                    <a
                        href="/"
                        className="mb-3 me-2 mb-md-0 text-decoration-none lh-1"
                        aria-label="NextFlick"
                    >
                        <img
                        src="/img/NectFlick_Logo.png"
                        alt="NextFlick Logo"
                        className="navbar-logo glow-red"
                        height="32"
                        />
                    </a>

                    <span className="mb-3 mb-md-0 footer-text text-nowrap d-inline-block">
                        © {currentYear} 4RA-G5-CS&E-Batch(2022-2026)-FinalYear Project,
                        <a
                            href="https://www.bncoepusad.ac.in/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer-link"
                        >
                            BNCOE-Pusad
                        </a>
                    </span>
                </div>

                <ul className="nav col-md-4 justify-content-end list-unstyled d-flex footer-icons">
                    <li className="ms-3">
                        <a href="https://www.instagram.com/bncoepusadofficial/" target="_blank" rel="noopener noreferrer" className="footer-link"  aria-label="Instagram">
                            <i className="bi bi-instagram"></i>
                        </a>
                    </li>

                    <li className="ms-3">
                        <a href="https://www.facebook.com/BNCEPUSAD/" target="_blank" rel="noopener noreferrer" className="footer-link" aria-label="Facebook">
                            <i className="bi bi-facebook"></i>
                        </a>
                    </li>
                </ul>

            </footer>
        </div>
    </div>
    );
}

export default Footer