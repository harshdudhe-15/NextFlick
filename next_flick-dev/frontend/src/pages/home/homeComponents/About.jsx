import React, { useEffect, useRef, useState } from "react";
import "./About.scss";

const About = () => {
    const aboutRef = useRef(null);
    const [active, setActive] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
        ([entry]) => {
            if (entry.isIntersecting) {
            setActive(true);
            }
        },
        { threshold: 0.4 } // triggers when 40% visible
        );

        if (aboutRef.current) {
        observer.observe(aboutRef.current);
        }

        return () => observer.disconnect();
    }, []);
    return(
        <div  ref={aboutRef} className="container-fluid nextflick-about py-5">
            <div className="container px-4">
                <h2 className="pb-2 border-bottom about-title">About NEXTFLICK</h2>
                <div className="row g-5 py-5 align-items-center">
                    <div className="col-lg-4 col-xl-3 d-flex justify-content-center">
                        <video
                            className={`about-video ${active ? "video-active" : ""}`}
                            autoPlay
                            muted
                            loop
                            playsInline
                        >
                            <source src="/img/about_vid.mp4" type="video/mp4" />
                        </video>
                    </div>
                    <div className="col-lg-8 col-xl-9">
                        <div className={`d-flex align-items-start about-card ${active ? "active-hover" : ""}`}>
                            <div className="icon-square about-icon">
                                <svg className="bi" width="1em" height="1em" aria-hidden="true">
                                    <use xlinkHref="#tools"></use>
                                </svg>
                            </div>

                            <div>
                                <h3 className="fs-2 about-subtitle">What is NEXTFLICK? </h3>
                                <p className="about-text">
                                It is an intelligent LLM-based movie recommendation system designed to
                                transform the way people discover films. Instead of generic lists, it will
                                interprets user queries, moods, or preferences with contextual understanding,
                                delivering highly personalized suggestions. By blending Al, natural language
                                processing, and user intent, NextFlick will creates a seamless journey from
                                curiosity to the perfect movie choice.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default About;