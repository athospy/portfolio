$(document).ready(function () {
  // Handle loading screen
  setTimeout(() => {
    $("#loading-screen").addClass("fade-out");
    // Remove loading screen from DOM after fade out completes
    setTimeout(() => {
      $("#loading-screen").remove();
    }, 800);
  }, 1500);

  // Load components
  $("#header").load("header.html");
  $("#drawer").load("drawer.html");
  $("#section_intro").load("section_intro.html");
  $("#experience_sec").load("section_experience.html");
  $("#portfolio_sec").load("section_porfolio.html");
  $("#interest_sec").load("section_interest.html");
  $("#project_sec").load("section_project.html");
  $("#contact_sec").load("section_contact.html");
  $("#project_artemisa").load("project_artemisa.html");
  $("#project_ardu").load("project_ardu.html");
  $("#project_sorteador").load("project_sorteador.html");

  // 🚀 Modern Interactive Effects
  setTimeout(initModernEffects, 3000); // Wait for loading screen and content to load
});

function initModernEffects() {
  // Add modern classes to existing elements
  addModernTouches();

  // Create custom cursor (disabled for readability)
  // createCustomCursor();

  // Create particle background
  createParticleBackground();

  // Add intersection observer for animations
  setupScrollAnimations();

  // Add magnetic hover effects
  setupMagneticEffects();

  // Add typewriter effect to main title
  setupTypewriterEffect();

  // Setup smooth scrolling with easing
  setupSmoothScrolling();

  // Setup floating action button
  setupFloatingActionButton();
}

function addModernTouches() {
  // Add morphing effects to cards
  $(".mdl-card").addClass("morphing-card");

  // Add floating animation to profile image
  $(".candidate-img").addClass("floating");

  // Add pulse effect to download button
  $("#download_cv").addClass("pulse");

  // Add magnetic effect to tech tags
  $(".tech-tag, .skill-tag").addClass("magnetic-tag");

  // Add gradient buttons class to existing buttons
  $(".mdl-button--raised").addClass("gradient-btn");

  // Add glassmorphism to cards
  $(".mdl-card").addClass("glass-card");
}

function createCustomCursor() {
  // Create cursor elements
  const cursor = $('<div class="cursor"></div>');
  const cursorTrail = $('<div class="cursor-trail"></div>');

  $("body").append(cursor).append(cursorTrail);

  // Mouse move handler
  $(document).mousemove(function (e) {
    cursor.css({
      left: e.clientX - 10,
      top: e.clientY - 10,
    });

    cursorTrail.css({
      left: e.clientX - 20,
      top: e.clientY - 20,
    });
  });

  // Hover effects
  $("a, button, .mdl-button").hover(
    function () {
      cursor.css({
        transform: "scale(1.5)",
        background: "var(--neon-purple)",
      });
      cursorTrail.css({
        transform: "scale(1.5)",
        borderColor: "var(--neon-blue)",
      });
    },
    function () {
      cursor.css({
        transform: "scale(1)",
        background: "var(--neon-blue)",
      });
      cursorTrail.css({
        transform: "scale(1)",
        borderColor: "var(--neon-purple)",
      });
    }
  );
}

function createParticleBackground() {
  const particleCount = 15;
  const body = $("body");

  for (let i = 0; i < particleCount; i++) {
    const particle = $('<div class="particle"></div>');
    particle.css({
      left: Math.random() * 100 + "%",
      animationDelay: Math.random() * 6 + "s",
      animationDuration: Math.random() * 4 + 6 + "s",
    });
    body.append(particle);
  }
}

function setupScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animation = "slideInUp 0.6s ease-out";
          entry.target.style.opacity = "1";
          entry.target.classList.add("revealed");
        }
      });
    },
    { threshold: 0.1 }
  );

  // Observe all sections and titles
  $("section").each(function () {
    this.style.opacity = "0";
    this.classList.add("reveal-animation");
    observer.observe(this);
  });

  // Observe section titles
  $("h2, .section-title").each(function () {
    observer.observe(this);
  });
}

function setupMagneticEffects() {
  $(".magnetic-tag")
    .on("mouseenter", function () {
      $(this).css(
        "transform",
        "scale(1.1) rotate(" + (Math.random() * 6 - 3) + "deg)"
      );
    })
    .on("mouseleave", function () {
      $(this).css("transform", "scale(1) rotate(0deg)");
    });

  // Enhanced card hover effects
  $(".mdl-card")
    .on("mouseenter", function () {
      $(this).css("transform", "translateY(-5px) scale(1.02)");
    })
    .on("mouseleave", function () {
      $(this).css("transform", "translateY(0) scale(1)");
    });
}

function setupTypewriterEffect() {
  const mainTitle = $("h1").first();
  if (mainTitle.length) {
    const text = mainTitle.text();
    mainTitle.empty().addClass("typewriter");

    let i = 0;
    const typeInterval = setInterval(() => {
      mainTitle.text(text.slice(0, ++i));
      if (i === text.length) {
        clearInterval(typeInterval);
        setTimeout(() => {
          mainTitle.removeClass("typewriter");
        }, 1000);
      }
    }, 100);
  }
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

function setupFloatingActionButton() {
  const fabMain = $("#fab-main");
  const fabMenu = $("#fab-menu");

  // Toggle FAB menu
  fabMain.on("click", function () {
    fabMain.toggleClass("active");
    fabMenu.toggleClass("active");
  });

  // FAB item click handlers
  $(".fab-item").on("click", function (e) {
    e.preventDefault();
    const targetSection = $(this).attr("data-scroll");
    const target = $(targetSection);

    if (target.length) {
      $("html, body").animate(
        {
          scrollTop: target.offset().top - 80,
        },
        800,
        "easeInOutCubic"
      );

      // Close FAB menu
      fabMain.removeClass("active");
      fabMenu.removeClass("active");
    }
  });

  // Close FAB menu when clicking outside
  $(document).on("click", function (e) {
    if (!$(e.target).closest(".fab-container").length) {
      fabMain.removeClass("active");
      fabMenu.removeClass("active");
    }
  });
}

// Add CSS keyframe for slide in animation
const slideInAnimation = `
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Add easing function for jQuery
$.extend($.easing, {
  easeInOutCubic: function (x, t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t * t + b;
    t -= 2;
    return (c / 2) * (t * t * t + 2) + b;
  },
});

// Inject keyframes
$("<style>").prop("type", "text/css").html(slideInAnimation).appendTo("head");
