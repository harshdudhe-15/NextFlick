import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { apiBaseUrl } from "../../constants/constant";
import "./MoviePage.scss";

export default function MoviePage({ mediaType, id, onClose }) {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${apiBaseUrl}movies/details/${mediaType}/${id}`)
      .then(res => res.json())
      .then(data => setMovie(data.data || data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [mediaType, id]);

  if (loading) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      
      <button className="close-btn" onClick={onClose}>✖</button>

      <div
        className="modal-hero"
        style={{
          backgroundImage: `url(${movie.backdrop})`
        }}
      >
        <div className="modal-dark-overlay">
          
          <div className="modal-content-wrapper">
            
            <img
              src={movie.poster}
              alt={movie.title}
              className="modal-poster"
            />

            <div className="modal-info">
              <h2>{movie.title}</h2>
              <p>⭐ {movie.rating?.toFixed(1) || "N/A"}/10</p>
              <p>Media Type: {movie.media_type}</p>
              <p>{movie.overview}</p>

              {movie.trailer && (
                <a
                  href={movie.trailer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="trailer-btn"
                >
                  ▶ Watch Trailer
                </a>
              )}
            </div>

          </div>

        </div>
      </div>

    </div>
  </div>,
  document.body
    );
}
