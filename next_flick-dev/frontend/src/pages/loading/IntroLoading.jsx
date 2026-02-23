import { useEffect, useState } from "react";
import "./IntroLoading.scss";

export default function IntroLoader({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3500); // 3.5 seconds intro

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="intro-loader">
      <div className="intro-content">
        <img 
        src="/img/NectFlick_Logo.png" 
        alt="NextFlick Logo"
        className="logo-image"
        />
        <p className="tagline">
          An LLM-Based Movie Recommendation System
        </p>
      </div>
    </div>
  );
}