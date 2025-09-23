from flask import Flask, request, jsonify
import requests
import os
from utils import load_pickle, save_pickle
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Paths to our pickle files
USERS_FILE = os.path.join("backend", "db", "users.pkl")
REVIEWS_FILE = os.path.join("backend", "db", "reviews.pkl")

# Load data
users = load_pickle(USERS_FILE, [])
reviews = load_pickle(REVIEWS_FILE, [])

# ---------------- AUTH ----------------
@app.route("/auth/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("user_name")
    password = data.get("password")

    if any(u["username"] == username for u in users):
        return jsonify({"success": False, "message": "Username already exists"})

    new_user = {"id": len(users) + 1, "username": username, "password": password}
    users.append(new_user)
    save_pickle(USERS_FILE, users)

    return jsonify({"success": True, "user": new_user})

@app.route("/auth/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("user_name")
    password = data.get("password")

    user = next((u for u in users if u["username"] == username and u["password"] == password), None)
    if not user:
        return jsonify({"success": False, "message": "Invalid credentials"})

    return jsonify({"success": True, "user": user})

# ---------------- ALBUMS ----------------
@app.route("/albums/<mbid>")
def album_details(mbid):
    # MusicBrainz API
    mb_url = f"https://musicbrainz.org/ws/2/release-group/{mbid}?fmt=json&inc=artist-credits"
    mb_data = requests.get(mb_url, headers={"User-Agent": "SoundVault/1.0"}).json()

    if "error" in mb_data:
        return jsonify({"success": False, "message": "Album not found"})

    # CoverArtArchive
    cover_url = f"https://coverartarchive.org/release-group/{mbid}/front"
    try:
        requests.get(cover_url).raise_for_status()
    except:
        cover_url = None

    album = {
        "mbid": mbid,
        "title": mb_data.get("title", "Unknown Album"),
        "artist": mb_data.get("artist-credit", [{}])[0].get("name", "Unknown Artist"),
        "cover_url": cover_url,
    }

    return jsonify({"success": True, "album": album})

# ---------------- REVIEWS ----------------
@app.route("/reviews/<mbid>")
def get_reviews(mbid):
    album_reviews = [r for r in reviews if r["mbid"] == mbid]
    return jsonify({"success": True, "reviews": album_reviews})

@app.route("/reviews", methods=["POST"])
def add_review():
    data = request.json
    user_id = data.get("user_id")
    mbid = data.get("song_mbid")
    rating = data.get("rating")
    review_text = data.get("review_text")

    new_review = {
        "user_id": user_id,
        "mbid": mbid,
        "rating": rating,
        "review_text": review_text,
    }
    reviews.append(new_review)
    save_pickle(REVIEWS_FILE, reviews)

    return jsonify({"success": True, "review": new_review})

# ---------------- CHARTS ----------------
@app.route("/charts")
def charts():
    if not reviews:
        return jsonify({"success": True, "songs": []})

    chart = {}
    for r in reviews:
        if r["mbid"] not in chart:
            chart[r["mbid"]] = {"ratings": [], "mbid": r["mbid"]}
        chart[r["mbid"]]["ratings"].append(int(r["rating"]))

    # Sort by average rating
    sorted_chart = sorted(
        chart.values(),
        key=lambda x: sum(x["ratings"]) / len(x["ratings"]),
        reverse=True
    )[:100]

    return jsonify({"success": True, "songs": sorted_chart})

# ---------------- SEARCH ----------------
@app.route("/search")
def search():
    q = request.args.get("q")
    if not q:
        return jsonify({"success": True, "results": []})

    url = f"https://musicbrainz.org/ws/2/release-group?query={q}&limit=12&fmt=json"
    res = requests.get(url, headers={"User-Agent": "SoundVault/1.0"})
    data = res.json()

    results = []
    for r in data.get("release-groups", []):
        results.append({
            "mbid": r["id"],
            "title": r["title"],
            "artist": r.get("artist-credit", [{}])[0].get("name", "Unknown Artist"),
            "cover_url": f"https://coverartarchive.org/release-group/{r['id']}/front"
        })

    return jsonify({"success": True, "results": results})

# ---------------- MAIN ----------------
if __name__ == "__main__":
    app.run(debug=True, port=3000)
