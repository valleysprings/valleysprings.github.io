let allPublications = [];
let allPreprints = [];
let showingSelected = true;
let showingAllNews = false;

document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggle-publications");
  if (toggleButton) {
    toggleButton.addEventListener("click", togglePublications);
  }

  const toggleNewsButton = document.getElementById("toggle-news");
  if (toggleNewsButton) {
    toggleNewsButton.addEventListener("click", toggleNews);
  }

  renderNews(false);
  loadPublications();
  loadPreprints();
});

function loadPublications() {
  const source = document.getElementById("publications-data");
  const data = source ? JSON.parse(source.textContent) : { publications: [] };
  allPublications = (data.publications || []).sort(comparePublications);
  renderPublications(true);
}

function loadPreprints() {
  const source = document.getElementById("preprints-data");
  const data = source ? JSON.parse(source.textContent) : { publications: [] };
  allPreprints = (data.publications || []).sort(comparePublications);
  renderPublicationList("preprints-container", allPreprints);
}

function toggleNews() {
  showingAllNews = !showingAllNews;
  renderNews(showingAllNews);
}

function renderNews(showAll) {
  const container = document.getElementById("news-container");
  const button = document.getElementById("toggle-news");
  if (!container) return;

  const items = [...container.querySelectorAll(".news-list li")];
  items.forEach((item, index) => {
    item.hidden = showAll ? index >= 10 : index >= 3;
  });

  container.classList.toggle("is-expanded", showAll);
  if (button) {
    button.textContent = showAll ? "Show Recent" : "Show All";
  }
}

function comparePublications(a, b) {
  const yearDiff = Number(b.year || 0) - Number(a.year || 0);
  if (yearDiff !== 0) return yearDiff;
  return Number(b.order || 0) - Number(a.order || 0);
}

function togglePublications() {
  showingSelected = !showingSelected;
  renderPublications(showingSelected);

  const toggleButton = document.getElementById("toggle-publications");
  const title = document.getElementById("publication-title");
  if (toggleButton) {
    toggleButton.textContent = showingSelected ? "Show All" : "Show Selected";
  }
  if (title) {
    title.textContent = showingSelected ? "Selected Publications" : "All Publications";
  }
}

function renderPublications(selectedOnly) {
  const container = document.getElementById("publications-container");
  if (!container) return;

  const publications = selectedOnly
    ? allPublications.filter((publication) => publication.selected)
    : allPublications;
  renderPublicationList("publications-container", publications);
}

function renderPublicationList(containerId, publications) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let lastYear = "";

  container.replaceChildren(...publications.map((publication) => {
    const shouldShowYear = publication.year !== lastYear;
    lastYear = publication.year;
    return createPublicationElement(publication, shouldShowYear);
  }));
}

function createPublicationElement(publication, shouldShowYear) {
  const item = document.createElement("article");
  item.className = "publication-item";
  if (publication.id) {
    item.id = `pub-${publication.id}`;
  }

  const year = document.createElement("div");
  year.className = "pub-year";
  year.textContent = shouldShowYear ? publication.year || "" : "";

  const content = document.createElement("div");
  content.className = "pub-content";

  const titleLine = document.createElement("div");
  titleLine.className = "pub-title-line";

  const title = document.createElement("div");
  title.className = "pub-title";
  title.textContent = publication.title;
  titleLine.appendChild(title);

  const titleLinks = createTitleLinks(publication.links || {});
  if (titleLinks) {
    titleLine.appendChild(titleLinks);
  }

  content.appendChild(titleLine);

  const authors = document.createElement("div");
  authors.className = "pub-authors";
  authors.innerHTML = (publication.authors || [])
    .map((author) => author.includes("Jiawei Zhou") ? `<span class="highlight-name">${escapeHTML(author)}</span>` : escapeHTML(author))
    .join(", ");
  content.appendChild(authors);

  const venue = document.createElement("div");
  venue.className = "pub-venue";
  venue.textContent = publication.venue || "";
  content.appendChild(venue);

  if (publication.description) {
    const description = document.createElement("div");
    description.className = "pub-description";
    description.textContent = publication.description;
    content.appendChild(description);
  }

  item.appendChild(year);
  item.appendChild(content);
  return item;
}

function createTitleLinks(links) {
  const entries = [
    ["paper", links.paper],
    ["repo", links.repo]
  ].filter(([, href]) => href);

  if (entries.length === 0) return null;

  const wrap = document.createElement("div");
  wrap.className = "pub-title-links";

  entries.forEach(([label, href]) => {
    const link = document.createElement("a");
    link.href = href;
    link.className = "pub-icon-link";
    link.title = label === "repo" ? "Repository" : "Paper";
    link.setAttribute("aria-label", link.title);
    link.innerHTML = label === "repo" ? githubIcon() : paperIcon();
    wrap.appendChild(link);
  });

  return wrap;
}

function paperIcon() {
  return "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M6 2h8l5 5v15H6V2Zm7 1.8V8h4.2L13 3.8ZM8 11v1.5h8V11H8Zm0 4v1.5h8V15H8Zm0 4v1.5h5V19H8Z\"/></svg>";
}

function githubIcon() {
  return "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.93.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.99c.85 0 1.71.12 2.51.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.95.68 1.91 0 1.38-.01 2.49-.01 2.83 0 .27.18.59.69.49A10.15 10.15 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z\"/></svg>";
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
