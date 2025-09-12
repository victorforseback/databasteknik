// Search Results Page
const searchResultsContainer = document.getElementById("searchResults");
if (searchResultsContainer) {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("query");

  if (query) {
    fetch(`https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&fmt=json&limit=20`)
      .then(res => res.json())
      .then(data => {
        if (data.releases && data.releases.length > 0) {
          searchResultsContainer.innerHTML = data.releases.map(album => {
            const title = album.title || "Unknown Album";
            const id = album.id;
            return `
              <div class="bg-gray-800 p-4 rounded shadow cursor-pointer hover:bg-gray-700"
                   onclick="window.location.href='review.html?mbid=${id}'">
                <p class="font-bold">${title}</p>
              </div>
            `;
          }).join("");
        } else {
          searchResultsContainer.innerHTML = `<p>No albums found for "${query}"</p>`;
        }
      })
      .catch(() => {
        searchResultsContainer.innerHTML = `<p>Error loading results</p>`;
      });
  }
}
