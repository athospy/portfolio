/**
 * Blog Posts Renderer
 * Fetches blog-posts.json, renders a featured card + preview card grid.
 * Embeds load on-demand (click "Show post") except for the featured post.
 */

$(document).ready(function () {
  loadBlogPosts();
});

async function loadBlogPosts() {
  try {
    const response = await fetch("blog-posts.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    let posts = await response.json();
    // Sort newest first
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    const featured = posts.find(p => p.featured) || posts[0];
    const rest     = posts.filter(p => p.id !== featured.id);

    renderFeatured(featured);
    renderCards(rest);

    // Track page view
    if (typeof gtag !== "undefined") {
      gtag("event", "page_view", { page_title: "Blog", page_location: window.location.href });
    }
  } catch (err) {
    console.error("Failed to load blog posts:", err);
    $("#featured-post").html(errorHtml());
    $("#blog-posts").html(errorHtml());
  }
}

/* ── Featured post (embed shown by default) ── */
function renderFeatured(post) {
  const tagsHtml = buildTags(post.tags);
  const html = `
    <div class="featured-card">
      <div class="post-title">
        ${esc(post.title)}
        <span class="featured-badge-inline">Featured</span>
      </div>
      <div class="post-meta">
        <span><i class="zmdi zmdi-calendar"></i>${formatDate(post.date)}</span>
        <span><i class="zmdi zmdi-linkedin"></i>LinkedIn</span>
      </div>
      <p class="post-summary">${esc(post.summary || "")}</p>
      <div class="post-tags">${tagsHtml}</div>
      <div class="post-actions">
        <a href="${post.postUrl}" target="_blank" rel="noopener noreferrer" class="btn-read-linkedin">
          <i class="zmdi zmdi-open-in-new"></i> Read on LinkedIn
        </a>
        <button class="btn-toggle-embed" onclick="toggleEmbed('featured', this)">
          <i class="zmdi zmdi-eye"></i> Hide post
        </button>
      </div>
      <div class="embed-wrapper open" id="embed-featured">
        ${buildEmbed(post, post.id + "-embed")}
      </div>
    </div>
  `;
  $("#featured-post").html(html);
  initEmbedLoader("featured");
}

/* ── Preview cards grid ── */
function renderCards(posts) {
  if (!posts.length) {
    $("#blog-posts").html('<p class="text-center mt-30">No additional posts yet.</p>');
    return;
  }

  const html = posts.map(post => {
    const tagsHtml = buildTags(post.tags);
    return `
      <div class="post-card">
        <div class="post-title">${esc(post.title)}</div>
        <div class="post-meta">
          <span><i class="zmdi zmdi-calendar"></i>${formatDate(post.date)}</span>
        </div>
        <p class="post-summary">${esc(post.summary || "")}</p>
        <div class="post-tags">${tagsHtml}</div>
        <div class="post-actions">
          <a href="${post.postUrl}" target="_blank" rel="noopener noreferrer" class="btn-read-linkedin">
            <i class="zmdi zmdi-open-in-new"></i> Read on LinkedIn
          </a>
          <button class="btn-toggle-embed" onclick="toggleEmbed('${post.id}', this)">
            <i class="zmdi zmdi-eye"></i> Show post
          </button>
        </div>
        <div class="embed-wrapper" id="embed-${post.id}">
          <!-- Embed injected on first expand -->
        </div>
      </div>
    `;
  }).join("");

  $("#blog-posts").html(html);
}

/* ── Toggle embed visibility (lazy-load on first open) ── */
function toggleEmbed(id, btn) {
  const wrapper = document.getElementById("embed-" + id);
  if (!wrapper) return;

  const isOpen = wrapper.classList.contains("open");

  if (isOpen) {
    wrapper.classList.remove("open");
    btn.innerHTML = '<i class="zmdi zmdi-eye"></i> Show post';
  } else {
    // Lazy inject iframe on first open
    if (!wrapper.dataset.loaded) {
      // Grab embedUrl from the rendered button's closest card
      const card  = btn.closest(".post-card, .featured-card");
      const aLink = card && card.querySelector(".btn-read-linkedin");
      if (aLink) {
        // Convert post URL → embed URL
        const postUrl  = aLink.getAttribute("href");
        const embedUrl = postUrl.replace("/feed/update/", "/embed/feed/update/");
        wrapper.innerHTML = buildEmbedHtml(embedUrl, id + "-li");
        initEmbedLoader(id);
      }
      wrapper.dataset.loaded = "1";
    }
    wrapper.classList.add("open");
    btn.innerHTML = '<i class="zmdi zmdi-eye-off"></i> Hide post';
    // Smooth scroll to embed
    setTimeout(() => wrapper.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
  }
}

/* ── Helpers ── */

function buildEmbed(post, wrapperId) {
  return `
    <div class="li-embed" id="${wrapperId}">
      <div class="li-embed__loader"><div class="li-spinner"></div></div>
      <iframe
        src="${post.embedUrl}"
        frameborder="0"
        allowfullscreen
        title="Embedded post: ${esc(post.title)}"
        loading="lazy"
      ></iframe>
    </div>
  `;
}

function buildEmbedHtml(embedUrl, wrapperId) {
  return `
    <div class="li-embed" id="${wrapperId}">
      <div class="li-embed__loader"><div class="li-spinner"></div></div>
      <iframe
        src="${embedUrl}"
        frameborder="0"
        allowfullscreen
        title="Embedded LinkedIn post"
        loading="lazy"
      ></iframe>
    </div>
  `;
}

function initEmbedLoader(id) {
  // Hide spinner after iframe loads (or after 8s fallback)
  setTimeout(() => {
    const allEmbeds = document.querySelectorAll(`#embed-${id} .li-embed, #embed-${id}-li.li-embed`);
    allEmbeds.forEach(wrap => {
      const iframe = wrap.querySelector("iframe");
      if (!iframe) return;
      const markLoaded = () => wrap.classList.add("is-loaded");
      iframe.addEventListener("load", markLoaded, { once: true });
      setTimeout(markLoaded, 8000);
    });
  }, 50);
}

function buildTags(tags) {
  return (tags || []).map(t => `<span class="skill-tag">${esc(t)}</span>`).join("");
}

function formatDate(dateStr) {
  const opts = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateStr).toLocaleDateString("en-US", opts);
}

function esc(str) {
  return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function errorHtml() {
  return `<div class="text-center" style="padding:60px 0; color:#94a3b8;">
    <p>Could not load posts. <a href="https://www.linkedin.com/in/santiagomorel/" target="_blank" rel="noopener noreferrer">View on LinkedIn →</a></p>
  </div>`;
}
