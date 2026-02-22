from fastapi import APIRouter, HTTPException, Query
from services.tmdb_service import TMDBService

router = APIRouter()

tmdb_service = TMDBService()


# --------------------------------------------
# 🔥 1️⃣ Get Weekly Trending (Movies + TV)
# --------------------------------------------
@router.get("/trending")
def get_trending():
    try:
        results = tmdb_service.get_trending_all()
        return {
            "success": True,
            "count": len(results),
            "data": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------------------------
# 🔥 2️⃣ Get Trending Hindi Movies + TV
# --------------------------------------------
@router.get("/trending/hindi")
def get_trending_hindi():
    try:
        results = tmdb_service.get_trending_hindi()
        return {
            "success": True,
            "count": len(results),
            "data": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------------------------
# 🔎 3️⃣ Search Movie or TV
# --------------------------------------------
@router.get("/search")
def search(title: str = Query(..., min_length=1)):
    try:
        results = tmdb_service.search_movie_or_tv(title)
        return {
            "success": True,
            "count": len(results),
            "data": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------------------------
# 🎥 4️⃣ Get Trailer
# --------------------------------------------
@router.get("/{media_type}/{movie_id}/trailer")
def get_trailer(media_type: str, movie_id: int):
    try:
        trailer_url = tmdb_service.get_trailer(media_type, movie_id)

        if not trailer_url:
            raise HTTPException(status_code=404, detail="Trailer not found")

        return {
            "success": True,
            "trailer_url": trailer_url
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/details/{media_type}/{content_id}")
def get_movie_details(media_type: str, content_id: int):

    data = tmdb_service.get_movie_details(media_type, content_id)

    if not data:
        return {"success": False, "message": "Content not found"}

    return data