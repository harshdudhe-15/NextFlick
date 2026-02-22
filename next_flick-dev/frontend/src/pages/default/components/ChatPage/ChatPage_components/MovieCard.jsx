import React from "react";
import "./MovieCard.scss";

const MovieCard = ({ movie }) => {
  return (
    <div
      className="movie-card"
      style={{
        backgroundImage: `url(${movie.backdrop})`,
      }}
    >
      <div className="movie-overlay" />

      <div className="movie-content">
        {/* Poster */}
        <div className="poster-container">
          <img
            src={movie.poster}
            alt={movie.title}
            className="movie-poster"
          />
        </div>

        {/* Info Section */}
        <div className="movie-info">
          <h3 className="movie-title">{movie.title}</h3>

          <div className="movie-meta">
            <span className="rating">⭐ {movie.rating?.toFixed(1)}</span>
            <span className="type">{movie.media_type?.toUpperCase()}</span>
            {movie.release_date && (
              <span className="release">
                {new Date(movie.release_date).getFullYear()}
              </span>
            )}
          </div>

          <p className="movie-overview">
            {movie.overview?.length > 220
              ? movie.overview.slice(0, 220) + "..."
              : movie.overview}
          </p>

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
  );
};

export default MovieCard;