/*
"Talk is cheap. Show me the code."
—Linus Torvalds
*/

// Palabas · WS1 TV Show Search code-along (TVmaze API, no key needed)
// Open DevTools (F12): keep the Console AND the Network tab open.
// Sample or live mode: see config.js.

// ---------- Given: page elements ----------
const form = document.getElementById("searchForm");
const input = document.getElementById("query");
const statusText = document.getElementById("status");
const results = document.getElementById("results");
const dialog = document.getElementById("details");
const detailsBody = document.getElementById("detailsBody");
const closeBtn = document.getElementById("closeDetails");
const modeBadge = document.getElementById("modeBadge");

// ---------- Given: the API's URLs ----------
const API = "https://api.tvmaze.com";

// Turns "Breaking Bad" into "breaking-bad" (used for the sample-data file names)
function slug(text) {
  return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// e.g. https://api.tvmaze.com/search/shows?q=breaking%20bad
function searchURL(query) {
  if (USE_SAMPLE_DATA) return `data/search/${slug(query)}.json`;
  return `${API}/search/shows?q=${encodeURIComponent(query)}`;
}

// e.g. https://api.tvmaze.com/shows/169
function showURL(id) {
  return USE_SAMPLE_DATA ? `data/shows/${id}.json` : `${API}/shows/${id}`;
}

// e.g. https://api.tvmaze.com/shows/169/cast
function castURL(id) {
  return USE_SAMPLE_DATA ? `data/cast/${id}.json` : `${API}/shows/${id}/cast`;
}

// e.g. https://api.tvmaze.com/shows/169/seasons
function seasonsURL(id) {
  return USE_SAMPLE_DATA ? `data/seasons/${id}.json` : `${API}/shows/${id}/seasons`;
}

// ---------- Given: helpers (no need to change) ----------

// Shows a message under the search box. type: "info", "loading" or "error"
function setStatus(message, type = "info") {
  statusText.textContent = message;
  statusText.className = "status " + type;
}

// Makes an element with an optional class and text: el("span", "year", "2008")
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// A poster <img>, or a placeholder when the show has no image (image is null)
function createPoster(show, size = "medium") {
  if (!show.image) {
    return el("span", "poster none", "No poster");
  }
  const img = el("img", "poster");
  img.src = show.image[size] || show.image.medium;
  img.alt = `Poster: ${show.name}`;
  img.loading = "lazy";
  img.addEventListener("error", () => img.replaceWith(el("span", "poster none", "No poster")));
  return img;
}

// "2008–2013", or "2016–" for a show that is still running
function yearRange(show) {
  const start = show.premiered ? show.premiered.slice(0, 4) : "?";
  const end = show.ended ? show.ended.slice(0, 4) : "";
  return `${start}–${end}`;
}

// TVmaze summaries contain HTML like "<p><b>Friends</b> follows…</p>".
// This keeps only the text. (Never put text from an API into innerHTML:
// if it contained a <script> or an onerror, it could run on your page.)
function stripTags(html) {
  if (!html) return "No summary yet.";
  return new DOMParser().parseFromString(html, "text/html").body.textContent;
}

// Close the details pop-up (Step 4) with the × button or by clicking outside it
closeBtn.addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

// Show which mode we're in
modeBadge.textContent = USE_SAMPLE_DATA ? "Sample data" : "Live · TVmaze";
modeBadge.classList.toggle("live", !USE_SAMPLE_DATA);

// STEP 1 — Your first API request
// TODO: async function testRequest(): fetch searchURL("friends"), log the status and the JSON array





// STEP 2 — Search and show the results
// TODO: renderResults(items), searchShows(query), and a submit listener on the form

const sampleShows = [
    {
        id: 1,
        name: "Friends",
        premiered: "1994-09-22",
        ended: "2004-05-06",
        genres: ["Comedy", "Romance"],
        rating: { average: 8.5 },
        image: null
    },
    {
        id: 2,
        name: "Breaking Bad",
        premiered: "2008-01-20",
        ended: "2013-09-29",
        genres: ["Drama", "Crime"],
        rating: { average: 9.5 },
        image: null
    },
    {
        id: 3,
        name: "The Vampire Diaries",
        premiered: "2009-09-10",
        ended: "2017-03-10",
        genres: ["Drama", "Fantasy"],
        rating: { average: 7.7 },
        image: null
    },
    {
        id: 4,
        name: "Game of Thrones",
        premiered: "2011-04-17",
        ended: "2019-05-19",
        genres: ["Drama", "Fantasy"],
        rating: { average: 9.2 },
        image: null
    },
    {
        id: 5,
        name: "Sherlock",
        premiered: "2010-07-25",
        ended: "2017-01-15",
        genres: ["Crime", "Drama"],
        rating: { average: 9.1 },
        image: null
    },
    {
        id: 6,
        name: "The Office",
        premiered: "2005-03-24",
        ended: "2013-05-16",
        genres: ["Comedy"],
        rating: { average: 9.0 },
        image: null
    }
];

function renderResults(items) {
  results.innerHTML = "";

  items.forEach((item) => {
    const show = item.show;
    const card = el("button", "card");
    card.type = "button";
    card.dataset.id = show.id;

    const rating = show.rating.average;

    card.append(
      createPoster(show),
      el("span", "title", show.name),
      el("span", "year", yearRange(show)),
      el("span", "genres", show.genres.join(", ")),
      el("span", "rating", rating ? `★ ${rating}` : "Not rated yet")
    );

    results.appendChild(card);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = input.value.trim();

  if (query === "") return;

  searchShows(query);
});

async function searchShows(query) {
    setStatus(`⏳ Searching for "${query}"...`, "loading");

    try {
        const data = await getJSON(searchURL(query));

        if (data.length === 0) {
            renderResults([]);
            setStatus(`No shows found for "${query}".`, "error");
            return;
        }

        renderResults(data);

        const count = data.length;
        const showWord = count === 1 ? "show" : "shows";

        setStatus(`${count} ${showWord} found for "${query}".`, "success");

    } catch (error) {
        renderResults([]);
        setStatus(error.message, "error");
    }
}



// STEP 3 — getJSON(): one careful helper for every request
// TODO: catch network errors, check 429 and response.ok; rewrite searchShows with try / catch and an empty-array check


async function getJSON(url) {
    let response;

    try {
        response = await fetch(url);
    } catch (error) {
        throw new Error("Can't reach TVmaze. Please check your internet connection.");
    }

    if (response.status === 429) {
        throw new Error("Too many requests. Please wait 10 seconds and try again.");
    }
    
    if (response.status === 404) {
    throw new Error(
        "Sample not found. Try searching: friends or sample."
    );
}

    if (!response.ok) {
        throw new Error(
            "Something went wrong while loading shows. Please try again."
        );
    }

    return await response.json();
}



// STEP 4 — Click a show to see its details
// TODO: one click listener on #results, showDetails(id), renderDetails(show)

results.addEventListener("click", (event) => {
    const card = event.target.closest(".card");

    if (!card) return;

    showDetails(card.dataset.id);
});



function renderDetails(show, cast, seasons) {
    const detailsBody = document.querySelector("#detailsBody");

    const seasonCount = seasons.length;

    const seasonText = seasonCount === 1
        ? "1 season"
        : `${seasonCount} seasons`;

    const castHTML = cast.slice(0, 6).map(member => {
        const actor = member.name || member.person?.name;
        const character = member.character?.name || member.character || "Unknown";

        return `<li>${actor} as ${character}</li>`;
    }).join("");

    detailsBody.innerHTML = `
        <h2>${show.name || show.title}</h2>

        <p>${show.overview || show.summary || ""}</p>

        <p><strong>${seasonText}</strong></p>

        <h3>Cast</h3>
        <ul>
            ${castHTML || "<li>No cast information available.</li>"}
        </ul>
    `;
}


async function showDetails(id) {
    const dialog = document.querySelector("#details");
    const detailsBody = document.querySelector("#detailsBody");

    if (!dialog || !detailsBody) {
        console.error("Details dialog or details body not found!");
        return;
    }

    detailsBody.textContent = "Loading details...";
    dialog.showModal();

    const startTime = performance.now();

    try {
        const [show, cast, seasons] = await Promise.all([
            getJSON(showURL(id)),
            getJSON(castURL(id)),
            getJSON(seasonsURL(id))
        ]);

        console.log(
            `3 requests in ${(performance.now() - startTime).toFixed(2)} ms`
        );

        renderDetails(show, cast, seasons);

    } catch (error) {
        detailsBody.textContent = "Error loading show details.";
        console.error(error);
    }
}

const sortButton = document.querySelector("#sortRating");

sortButton.addEventListener("click", () => {
    const results = document.querySelector("#results");

    const cards = Array.from(
        results.querySelectorAll(".card")
    );

    cards.sort((a, b) => {
        const ratingA = parseFloat(a.dataset.rating);
        const ratingB = parseFloat(b.dataset.rating);

        const validA = Number.isNaN(ratingA) ? -1 : ratingA;
        const validB = Number.isNaN(ratingB) ? -1 : ratingB;

        return validB - validA;
    });

    cards.forEach(card => results.appendChild(card));
});

// STEP 5 — Promise.all: show + cast + seasons at the same time
// TODO: rewrite showDetails with Promise.all, and renderDetails(show, cast, seasons)
