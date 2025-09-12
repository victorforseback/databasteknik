// ===== Album Info =====
const albumInfoContainer = document.getElementById("albumInfo");
const reviewsList = document.getElementById("reviewsList");
const reviewForm = document.getElementById("reviewForm");
const reviewText = document.getElementById("reviewText");
const ratingStars = document.getElementById("ratingStars");

// Extract album MBID from URL
const params = new URLSearchParams(window.location.search);
const mbid = params.get("mbid");

// Display placeholder album info (later fetch real data)
if (albumInfoContainer && mbid) {
  albumInfoContainer.innerHTML = `
    <h1 class="text-xl font-bold">Album ID: ${mbid}</h1>
    <p class="text-gray-400">Album details will load here...</p>
  `;
}

// ===== Rating Stars =====
let selectedRating = 0;

if (ratingStars) {
  for (let i = 1; i <= 10; i++) {
    const star = document.createElement("span");
    star.textContent = "★";
    star.className = "cursor-pointer text-gray-500 text-xl";
    star.addEventListener("click", () => {
      selectedRating = i;
      updateStars();
    });
    ratingStars.appendChild(star);
  }
}

function updateStars() {
  const stars = ratingStars.querySelectorAll("span");
  stars.forEach((star, index) => {
    star.className =
      index < selectedRating
        ? "cursor-pointer text-yellow-400 text-xl"
        : "cursor-pointer text-gray-500 text-xl";
  });
}

// ===== Submit Review =====
if (reviewForm) {
  reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!selectedRating) {
      alert("Please select a rating!");
      return;
    }

    const review = reviewText.value.trim();
    if (!review) {
      alert("Please write a review!");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mbid,
          rating: selectedRating,
          review,
        }),
      });

      const data = await res.json();
      if (data.success) {
        loadReviews(); // refresh reviews list
        reviewText.value = "";
        selectedRating = 0;
        updateStars();
      } else {
        alert("Error: " + data.message);
      }
    } catch {
      alert("Server error – could not submit review");
    }
  });
}

// ===== Load Reviews =====
async function loadReviews() {
  if (!mbid) return;
  try {
    const res = await fetch(`http://localhost:3000/reviews/${mbid}`);
    const data = await res.json();
    if (data.success && data.reviews.length > 0) {
      reviewsList.innerHTML = data.reviews.map(r => `
        <div class="bg-gray-800 p-4 rounded mb-2">
          <p class="text-yellow-400">Rating: ${r.rating}/10</p>
          <p>${r.review}</p>
        </div>
      `).join("");
    } else {
      reviewsList.innerHTML = `<p>No reviews yet.</p>`;
    }
  } catch {
    reviewsList.innerHTML = `<p>Error loading reviews.</p>`;
  }
}

// Initial load
if (reviewsList) {
  loadReviews();
}
