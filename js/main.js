$(document).ready(function () {
  // section_intro is inlined in index.html for faster LCP
  $("#experience_sec").load("section_experience.html");
  $("#portfolio_sec").load("section_portfolio.html");
  $("#interest_sec").load("section_interest.html");
  $("#project_sec").load("section_project.html");
  $("#contact_sec").load("section_contact.html");

  setTimeout(initModernEffects, 3000);
});

function initModernEffects() {
  setupScrollAnimations();
  setupSmoothScrolling();
}

function setupScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animation = "slideInUp 0.6s ease-out";
          entry.target.style.opacity = "1";
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  $("section").each(function () {
    // Sections already on screen by the time this runs (3s after load,
    // so AJAX-loaded sections have content) shouldn't be hidden and
    // replayed — that causes a visible flash/blink of already-read content.
    const rect = this.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;

    if (alreadyVisible) {
      this.classList.add("revealed");
      return;
    }

    this.style.opacity = "0";
    observer.observe(this);
  });
}

function setupSmoothScrolling() {
  $("a[data-scroll]").on("click", function (e) {
    e.preventDefault();
    const target = $(this.getAttribute("href"));

    if (target.length) {
      $("html, body").animate(
        {
          scrollTop: target.offset().top - 80,
        },
        800,
        "easeInOutCubic"
      );
    }
  });
}

const slideInAnimation = `
  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

$.extend($.easing, {
  easeInOutCubic: function (x, t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t * t + b;
    t -= 2;
    return (c / 2) * (t * t * t + 2) + b;
  },
});

$("<style>").prop("type", "text/css").html(slideInAnimation).appendTo("head");
