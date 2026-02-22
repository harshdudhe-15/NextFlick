import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TrandingBar.scss";
import { apiBaseUrl } from "../../../constants/constant";
import { getVariable } from "../../../utils/localStorage";
import MoviePage from "../../movie/MoviePage";



export default function TrendingBar() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = getVariable("km_user_token"); // check login
  const [selectedMovie, setSelectedMovie] = useState(null);

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("trending_language") || "english";
  });
  useEffect(() => {
    localStorage.setItem("trending_language", language);
  }, [language]);


    useEffect(() => {
      const endpoint =
        language === "hindi"
          ? "movies/trending/hindi"
          : "movies/trending";

      setLoading(true);

      fetch(`${apiBaseUrl}${endpoint}`)
          .then(res => res.json())
          .then(data => {
              setItems(data.data || []);
              })
              .catch(err => {
                  console.error(err);
                  setItems([]);
              })
              .finally(() => {
                setLoading(false); // 🔥 stop loading
              });
    }, [language, token]);// 🔥 refetch when language changes

  return (
    <div className="trending-section">
      
      <div className="trending-header">
        <h2 className="section-title">🔥 Trending Now</h2>

        {token && (
          <div className="filter-toggle">
            <button
              className={language === "english" ? "active" : ""}
              onClick={() => setLanguage("english")}
              disabled={loading}
            >
              English
            </button>

            <button
              className={language === "hindi" ? "active" : ""}
              onClick={() => setLanguage("hindi")}
              disabled={loading}
            >
              Hindi
            </button>
          </div>
        )}
      </div>

      <div className="trending-wrapper">

        {/* 🔥 Movies Row */}
        <div className={`trending-row ${!token ? "blurred" : ""}`}>
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="movie-card skeleton" />
              ))
            : items.map((item) => (
                <div 
                  key={item.id} 
                  className="movie-card"
                  // onClick={() =>
                  //   navigate(`/movie/${item.media_type}/${item.id}`)
                  // }
                  onClick={() =>
                    setSelectedMovie({
                      mediaType: item.media_type,
                      id: item.id
                    })
                  }
                >
                  <img
                    src={
                      item.poster ||
                      "https://via.placeholder.com/160x240?text=No+Image"
                    }
                    alt={item.title}
                    className="movie-poster"
                  />
                  <div className="movie-info">
                    <h6>{item.title}</h6>
                    <p>
                      ⭐ {item.rating ? item.rating.toFixed(1) : "N/A"}/10
                    </p>
                  </div>
                </div>
              ))}
        </div>

        {/* 🔒 Overlay */}
        {!token && (
          <div className="login-overlay">
            <div className="overlay-content">
              <h2>🔒 Login to unlock Trending</h2>
              <p>Discover what's hot right now!</p>
            </div>
          </div>
        )}

        {selectedMovie && (
          <MoviePage
            mediaType={selectedMovie.mediaType}
            id={selectedMovie.id}
            onClose={() => setSelectedMovie(null)}
          />
        )}

      </div>
    </div>
  );
}
