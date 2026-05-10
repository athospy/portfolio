/**
 * Blog Posts Renderer
 * Fetches blog-posts.json and dynamically renders embedded LinkedIn posts
 */

$(document).ready(function () {
  loadBlogPosts();
});

let allPosts = [];

async function loadBlogPosts() {
  try {
    const response = await fetch("blog-posts.json");
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    allPosts = await response.json();

    // Sort by date (newest first)
    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    renderBlogPosts(allPosts);
  } catch (error) {
    console.error("Error loading blog posts:", error);
    $("#blog-posts").html(
      '<div class="text-center error"><p>Failed to load blog posts. Please try again later.</p></div>'
    );
  }
}

function renderBlogPosts(posts) {
  const container = $("#blog-posts");

  if (posts.length === 0) {
    container.html(
      '<div class="text-center"><p class="mt-30 mb-30">No posts available.</p></div>'
    );
    return;
  }

  let html = '';

  posts.forEach((post, index) => {
    const dateFormatted = formatDate(post.date);
    const tagsHtml = post.tags
      .map((tag) => `<span class="tech-tag">${tag}</span>`)
      .join('');
    const featuredBadge = post.featured ? '<span class="featured-badge">Featured</span>' : '';

    html += `
      <div class="embedded-post">
        <div class="post-wrapper">
          <div class="post-header">
            <h2 class="post-title">
              ${post.title}
              ${featuredBadge}
            </h2>
            <div class="post-meta">
              <span><i class="zmdi zmdi-calendar"></i>${dateFormatted}</span>
              <span><i class="zmdi zmdi-linkedin"></i>LinkedIn Post</span>
            </div>
            <div class="post-tags">
              ${tagsHtml}
            </div>
          </div>
          <div class="linkedin-embed-container" id="embed-${post.id}">
            <div class="embed-spinner" id="spinner-${post.id}">
              <div class="spinner"></div>
              <div class="spinner-text">Loading post...</div>
            </div>
            <iframe 
              src="${post.embedUrl}"
              frameborder="0" 
              allowfullscreen="" 
              title="Embedded post from ${post.title}"
              onload="hideSpinner('${post.id}')"
              onerror="handleEmbedError('${post.id}')"
            ></iframe>
          </div>
        </div>
      </div>
    `;
  });

  container.html(html);
  
  // Track page view
  if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
      page_title: 'Blog',
      page_location: window.location.href
    });
  }
}

function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

function hideSpinner(postId) {
  const spinner = document.getElementById(`spinner-${postId}`);
  if (spinner) {
    spinner.style.opacity = '0';
    setTimeout(() => {
      spinner.style.display = 'none';
    }, 300);
  }
}

function handleEmbedError(postId) {
  const container = document.getElementById(`embed-${postId}`);
  if (container) {
    container.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #888;">
        <i class="zmdi zmdi-alert-circle" style="font-size: 48px; margin-bottom: 10px;"></i>
        <p>Unable to load this post. <a href="https://www.linkedin.com/in/santiagomorel/" target="_blank" rel="noopener noreferrer">View on LinkedIn</a></p>
      </div>
    `;
  }
}

// Add smooth fade transition for spinner
const style = document.createElement('style');
style.textContent = `
  .embed-spinner {
    transition: opacity 0.3s ease;
  }
`;
document.head.appendChild(style);
