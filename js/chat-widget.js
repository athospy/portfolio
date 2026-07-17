/**
 * Floating "chat with my resume" widget.
 * Vanilla JS, no jQuery dependency, so it works the same on index.html,
 * blog/index.html, and books/index.html without relying on load order.
 */
(function () {
  "use strict";

  const API_URL =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:8000/api/chat"
      : "https://santiagomorel.dev/api/chat";

  // blog/ and books/ are one level deep, so the report link needs a
  // relative "../" prefix there but not from the site root.
  const REPORT_URL = /\/(blog|books)\//.test(window.location.pathname)
    ? "../chat-report/index.html"
    : "chat-report/index.html";

  const HISTORY_LIMIT = 6;

  const STARTER_QUESTIONS = [
    "What AI projects has he built?",
    "Does he have full-stack experience?",
    "What is he doing at LimeLight Marketing?",
    "What's his educational background?",
  ];

  // In-memory only, per plan section 5: no localStorage, no cookies.
  let conversation = [];
  let panelOpened = false;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function buildWidget() {
    const root = el("div", "chat-widget");

    const button = el("button", "chat-widget__button");
    button.setAttribute("aria-label", "Chat with my resume");
    button.setAttribute("type", "button");
    button.innerHTML =
      '<i class="zmdi zmdi-comment-outline"></i>';

    const panel = el("div", "chat-widget__panel");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Chat with my resume");
    panel.hidden = true;

    const header = el("div", "chat-widget__header");
    header.appendChild(el("span", "chat-widget__title", "Chat with my resume"));
    const closeBtn = el("button", "chat-widget__close");
    closeBtn.setAttribute("type", "button");
    closeBtn.setAttribute("aria-label", "Close chat");
    closeBtn.innerHTML = '<i class="zmdi zmdi-close"></i>';
    header.appendChild(closeBtn);
    panel.appendChild(header);

    const messages = el("div", "chat-widget__messages");
    panel.appendChild(messages);

    const starters = el("div", "chat-widget__starters");
    STARTER_QUESTIONS.forEach((q) => {
      const chip = el("button", "chat-widget__starter", q);
      chip.setAttribute("type", "button");
      chip.addEventListener("click", () => sendMessage(q));
      starters.appendChild(chip);
    });
    panel.appendChild(starters);

    const form = el("form", "chat-widget__form");
    const input = el("input", "chat-widget__input");
    input.type = "text";
    input.placeholder = "Ask about his experience...";
    input.maxLength = 500;
    input.setAttribute("aria-label", "Your question");
    const sendBtn = el("button", "chat-widget__send");
    sendBtn.type = "submit";
    sendBtn.innerHTML = '<i class="zmdi zmdi-mail-send"></i>';
    form.appendChild(input);
    form.appendChild(sendBtn);
    panel.appendChild(form);

    const disclaimer = el("p", "chat-widget__disclaimer");
    disclaimer.innerHTML =
      "AI assistant trained on this site's content, may not know everything. " +
      '<a href="' + REPORT_URL + '">See how it was built &rarr;</a>';
    panel.appendChild(disclaimer);

    root.appendChild(panel);
    root.appendChild(button);
    document.body.appendChild(root);

    function openPanel() {
      panel.hidden = false;
      button.classList.add("is-open");
      if (!panelOpened) {
        panelOpened = true;
        starters.hidden = false;
      }
      input.focus();
    }

    function closePanel() {
      panel.hidden = true;
      button.classList.remove("is-open");
    }

    button.addEventListener("click", () => {
      if (panel.hidden) openPanel();
      else closePanel();
    });
    closeBtn.addEventListener("click", closePanel);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = input.value.trim();
      if (!value) return;
      input.value = "";
      sendMessage(value);
    });

    function addBubble(role, text) {
      const bubble = el("div", "chat-widget__bubble chat-widget__bubble--" + role);
      bubble.textContent = text;
      messages.appendChild(bubble);
      messages.scrollTop = messages.scrollHeight;
      return bubble;
    }

    function addLoadingBubble() {
      const bubble = el("div", "chat-widget__bubble chat-widget__bubble--assistant chat-widget__bubble--loading");
      bubble.textContent = "Thinking...";
      messages.appendChild(bubble);
      messages.scrollTop = messages.scrollHeight;
      return bubble;
    }

    async function sendMessage(text) {
      starters.hidden = true;
      addBubble("user", text);
      const historyToSend = conversation.slice(-HISTORY_LIMIT);
      conversation.push({ role: "user", content: text });

      const loadingBubble = addLoadingBubble();
      sendBtn.disabled = true;

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            history: historyToSend,
          }),
        });

        if (response.status === 429) {
          loadingBubble.remove();
          addBubble("error", "This chat has hit its usage limit for now. Try again later, or reach out directly.");
          return;
        }

        if (!response.ok) {
          loadingBubble.remove();
          addBubble("error", "Something went wrong on my end. Try again in a moment.");
          return;
        }

        const data = await response.json();
        loadingBubble.remove();

        const bubble = addBubble("assistant", data.answer);
        if (data.in_scope === false) {
          bubble.classList.add("chat-widget__bubble--out-of-scope");
        }
        if (data.source_excerpt) {
          const footnote = el("div", "chat-widget__footnote");
          footnote.innerHTML = '<em>from his background:</em> "' + data.source_excerpt + '"';
          messages.appendChild(footnote);
          messages.scrollTop = messages.scrollHeight;
        }

        conversation.push({ role: "assistant", content: data.answer });
        conversation = conversation.slice(-HISTORY_LIMIT);
      } catch (err) {
        loadingBubble.remove();
        addBubble("error", "Couldn't reach the chat service. Check your connection and try again.");
      } finally {
        sendBtn.disabled = false;
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildWidget);
  } else {
    buildWidget();
  }
})();
