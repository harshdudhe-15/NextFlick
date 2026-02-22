import os
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from datetime import datetime, timedelta
from dotenv import load_dotenv
load_dotenv()


class TMDBService:

    BASE_URL = "https://api.themoviedb.org/3"
    IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"
    BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280"

    def __init__(self):
        self.api_key = os.getenv("TMDB_API_KEY")
        if not self.api_key:
            raise ValueError("TMDB_API_KEY not found in environment variables")
        
        # ✅ Create persistent session
        self.session = requests.Session()

        # ✅ Retry strategy
        retries = Retry(
            total=3,
            backoff_factor=0.5,
            status_forcelist=[500, 502, 503, 504]
        )

        adapter = HTTPAdapter(max_retries=retries)

        self.session.mount("https://", adapter)

        self.headers = {
            "User-Agent": "NextFlickApp/1.0"
        }

    # --------------------------------------------
    # 🔥 Get Weekly Trending Movies + TV
    # --------------------------------------------
    def get_trending_all(self):
        url = f"{self.BASE_URL}/trending/all/week"

        params = {
            "api_key": self.api_key
        }

        response = self.session.get(
            url,
            params=params,
            headers={"User-Agent": "NextFlick/1.0"},
            timeout=10
        )
        data = response.json()

        results = []

        for item in data.get("results", []):
            # Ignore people (actors)
            if item.get("media_type") not in ["movie", "tv"]:
                continue

            item_id = item.get("id")
            media_type = item.get("media_type")

            results.append({
                "id": item_id,
                "title": item.get("title") or item.get("name"),
                "media_type": media_type,  # movie or tv
                "overview": item.get("overview"),
                "rating": item.get("vote_average"),
                "release_date": item.get("release_date") or item.get("first_air_date"),
                "poster": f"{self.IMAGE_BASE_URL}{item.get('poster_path')}"
                        if item.get("poster_path") else None,
                "backdrop": f"{self.BACKDROP_BASE_URL}{item.get('backdrop_path')}"
                        if item.get("backdrop_path") else None,  
            })

        return results[:15]  # top 15 trending



    # --------------------------------------------
    # 🔥 Get Trending Hindi Movies + TV
    # --------------------------------------------
    def get_trending_hindi(self):

        def fetch_hindi_content(days_back):
            results = []

            date_limit = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")

            # 🎬 Hindi Movies
            movie_url = f"{self.BASE_URL}/discover/movie"
            movie_params = {
                "api_key": self.api_key,
                "with_original_language": "hi",
                "sort_by": "popularity.desc",
                "vote_count.gte": 20,
                "primary_release_date.gte": date_limit
            }

            movie_response = self.session.get(movie_url, params=movie_params)
            movie_data = movie_response.json()

            for movie in movie_data.get("results", []):
                results.append({
                    "id": movie.get("id"),
                    "title": movie.get("title"),
                    "media_type": "movie",
                    "overview": movie.get("overview"),
                    "rating": movie.get("vote_average"),
                    "release_date": movie.get("release_date"),
                    "poster": f"{self.IMAGE_BASE_URL}{movie.get('poster_path')}"
                            if movie.get("poster_path") else None,
                    "backdrop": f"{self.BACKDROP_BASE_URL}{movie.get('backdrop_path')}"
                            if movie.get("backdrop_path") else None
                })

            # 📺 Hindi TV
            tv_url = f"{self.BASE_URL}/discover/tv"
            tv_params = {
                "api_key": self.api_key,
                "with_original_language": "hi",
                "sort_by": "popularity.desc",
                "vote_count.gte": 10,
                "first_air_date.gte": date_limit
            }

            tv_response = self.session.get(tv_url, params=tv_params)
            tv_data = tv_response.json()

            for tv in tv_data.get("results", []):
                results.append({
                    "id": tv.get("id"),
                    "title": tv.get("name"),
                    "media_type": "tv",
                    "overview": tv.get("overview"),
                    "rating": tv.get("vote_average"),
                    "release_date": tv.get("first_air_date"),
                    "poster": f"{self.IMAGE_BASE_URL}{tv.get('poster_path')}"
                            if tv.get("poster_path") else None,
                    "backdrop": f"{self.BACKDROP_BASE_URL}{tv.get('backdrop_path')}"
                            if tv.get("backdrop_path") else None
                })

            def safe_date(date_str):
                try:
                    return datetime.strptime(date_str, "%Y-%m-%d")
                except:
                    return datetime.min

            # Sort by most recent release date
            results.sort(
                key=lambda x: safe_date(x["release_date"]),
                reverse=True
            )

            return results

        # 🔥 Step 1: Try 90 days
        results = fetch_hindi_content(90)

        # 🔥 Step 2: Expand to 180 days if too few
        if len(results) < 15:
            results = fetch_hindi_content(180)

        # # 🔥 Step 3: Expand to 365 days if still too few
        if len(results) < 15:
            results = fetch_hindi_content(365)

        return results[:15]




    # --------------------------------------------
    # 🔎 Search Movie or TV Series by Title
    # --------------------------------------------
    def search_movie_or_tv(self, title: str):
        url = f"{self.BASE_URL}/search/multi"

        params = {
            "api_key": self.api_key,
            "query": title,
            "include_adult": False
        }
        response = self.session.get(url, params=params)
        data = response.json()

        results = []

        for item in data.get("results", []):
            id = item.get("id")
            media_type = item.get("media_type")
            # We only care about movies and tv
            if media_type not in ["movie", "tv"]:
                continue

            results.append({
                "id": id,
                "title": item.get("title") or item.get("name"),
                "media_type": media_type,  # movie or tv
                "overview": item.get("overview"),
                "rating": item.get("vote_average"),
                "release_date": item.get("release_date") or item.get("first_air_date"),
                "poster": f"{self.IMAGE_BASE_URL}{item.get('poster_path')}"
                        if item.get("poster_path") else None,
                "backdrop": f"{self.BACKDROP_BASE_URL}{item.get('backdrop_path')}"
                        if item.get("backdrop_path") else None ,
                "trailer": self.get_trailer(media_type, id)
            })

        return results[:10]  # limit to top 10

    # --------------------------------------------
    # 🎥 Get Trailer for a Movie or TV
    # --------------------------------------------
    def get_trailer(self, media_type: str, movie_id: int):
        if media_type not in ["movie", "tv"]:
            return None

        url = f"{self.BASE_URL}/{media_type}/{movie_id}/videos"

        params = {
            "api_key": self.api_key
        }

        try:
            response = self.session.get(
                url,
                params=params,
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
        except requests.exceptions.RequestException as e:
            print("Trailer fetch failed:", e)
            return None

        videos = data.get("results", [])

        # Prefer official trailer
        for video in videos:
            if video.get("site") == "YouTube" and video.get("type") == "Trailer":
                return f"https://www.youtube.com/watch?v={video.get('key')}"

        # Fallback to any YouTube video
        for video in videos:
            if video.get("site") == "YouTube":
                return f"https://www.youtube.com/watch?v={video.get('key')}"

        return None

    def get_movie_details(self, media_type: str, content_id: int):

        if media_type not in ["movie", "tv"]:
            return None

        url = f"{self.BASE_URL}/{media_type}/{content_id}"

        params = {
            "api_key": self.api_key
        }

        try:
            response = self.session.get(
                url,
                params=params,
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
        except requests.exceptions.RequestException as e:
            print("Details fetch failed:", e)
            return None

        # Fetch trailer separately
        trailer_url = self.get_trailer(media_type, content_id)

        return {
            "id": data.get("id"),
            "media_type": media_type,
            "title": data.get("title") or data.get("name"),
            "overview": data.get("overview"),
            "rating": data.get("vote_average"),
            "release_date": data.get("release_date") or data.get("first_air_date"),
            "poster": f"{self.IMAGE_BASE_URL}{data.get('poster_path')}"
                    if data.get("poster_path") else None,
            "backdrop": f"{self.BACKDROP_BASE_URL}{data.get('backdrop_path')}"
                        if data.get("backdrop_path") else None,
            "trailer": trailer_url
        }


    # --------------------------------------------
    # 🎯 Format Movie Data
    # --------------------------------------------
    def _format_movies(self, movies):
        formatted_movies = []

        for movie in movies[:10]:  # limit to top 10
            movie_id = movie.get("id")
            media_type = movie.get("media_type", "movie")  # default if missing

            formatted_movies.append({
                "id": movie_id,
                "media_type": media_type,
                "title": movie.get("title") or movie.get("name"),
                "overview": movie.get("overview"),
                "rating": movie.get("vote_average"),
                "release_date": movie.get("release_date") or movie.get("first_air_date"),
                "poster": f"{self.IMAGE_BASE_URL}{movie.get('poster_path')}" 
                          if movie.get("poster_path") else None,
                "backdrop": f"{self.IMAGE_BASE_URL}{movie.get('backdrop_path')}"
                        if movie.get("backdrop_path") else None,
                "trailer": self.get_trailer(media_type, movie_id)
            })

        return formatted_movies
    
    