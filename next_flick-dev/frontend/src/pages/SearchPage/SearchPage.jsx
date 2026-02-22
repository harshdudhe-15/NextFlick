import { useEffect, useState } from "react";
import { useSearchParams, Link} from "react-router-dom";
import { apiBaseUrl } from "../../constants/constant";
//import Header from "../home/homeComponents/Header";
import "./SearchPage.scss";
import MoviePage from "../movie/MoviePage";


export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);


  useEffect(() => {
    if (!query) return;

    setLoading(true);

    fetch(`${apiBaseUrl}movies/search?title=${query}`)
      .then(res => res.json())
      .then(data => setResults(data.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

  }, [query]);

  return (
    <>
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
        </div>
        <div className="search-page">
            {query && (
            <div className="search-header">
                <h2>
                    {loading
                        ? `Searching for "${query}"...`
                        : `Results found for "${query}"`
                    }
                </h2>
                {!loading && (
                <p className="results-count">
                    {results.length} result{results.length !== 1 && "s"} found
                </p>
                )}
            </div>
            )}

            {/* {loading && <p>Loading...</p>} */}
            {loading && (
                <div className="loader-container">
                    <div className="loader"></div>
                </div>
            )}
            {!loading && results.length === 0 && (
                <p className="no-results">No results found.</p>
            )}

            <div className="results-grid">
            {results.map(item => (
                <div 
                key={item.id} 
                className="result-card"
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
                />
                <h6>{item.title}</h6>
                <p>⭐ {item.rating?.toFixed(1) || "N/A"}/10</p>
                </div>
            ))}
            </div>
            {selectedMovie && (
                <MoviePage
                    mediaType={selectedMovie.mediaType}
                    id={selectedMovie.id}
                    onClose={() => setSelectedMovie(null)}
                />
            )}
        </div>
    </>
  );
}
