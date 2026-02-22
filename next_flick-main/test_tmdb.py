from services.tmdb_service import TMDBService

tmdb = TMDBService()

movies = tmdb.get_trending_all()
# movies = tmdb.get_trending_hindi()
# movies = tmdb.search_movie_or_tv("Stranger Things")

# for movie in movies:
#     print(movie["title"], "-", movie["rating"])

#trailer url testing

first_item = movies[14]

print("Testing:", first_item["title"], first_item["media_type"])

trailer = tmdb.get_trailer(
    first_item["media_type"],
    first_item["id"]
)

print("Trailer:", trailer)
