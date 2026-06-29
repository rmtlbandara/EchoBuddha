(() => {
  const popularSearches = ["Mindfulness", "Metta", "Karma", "Anicca", "Meditation", "Dhammapada", "Patience", "Compassion", "Anger", "Four Noble Truths"];
  let indexPromise;

  const normalize = (value) => (value || "").toString().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  const escapeHtml = (value) => (value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);

  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch("/search-index.json")
        .then((response) => (response.ok ? response.json() : []))
        .catch(() => []);
    }

    return indexPromise;
  }

  function scoreItem(item, rawQuery) {
    const query = normalize(rawQuery).trim();
    if (!query) return 0;

    const words = query.split(/\s+/).filter(Boolean);
    const title = normalize(item.title);
    const type = normalize(item.type);
    const category = normalize(item.category);
    const keywords = normalize((item.keywords || []).join(" "));
    const excerpt = normalize(item.excerpt);
    const content = normalize(item.content);
    let score = 0;

    if (title === query) score += 160;
    if (item.type === "Buddhist Term" && title === query) score += 140;
    if (title.startsWith(query)) score += 95;
    if (title.includes(query)) score += 75;
    if (keywords.includes(query)) score += 45;
    if (category.includes(query) || type.includes(query)) score += 30;
    if (excerpt.includes(query)) score += 22;
    if (content.includes(query)) score += 12;

    for (const word of words) {
      if (title === word) score += 36;
      if (title.includes(word)) score += 22;
      if (keywords.includes(word)) score += 12;
      if (category.includes(word) || type.includes(word)) score += 10;
      if (excerpt.includes(word)) score += 8;
      if (content.includes(word)) score += 3;
    }

    return score;
  }

  function searchItems(items, query) {
    return items
      .map((item) => ({ item, score: scoreItem(item, query) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || (b.item.date || "").localeCompare(a.item.date || ""))
      .slice(0, 24)
      .map((entry) => entry.item);
  }

  function resultMarkup(result) {
    const meta = [result.type, result.category, result.date].filter(Boolean).join(" / ");

    return `
      <li>
        <a class="search-result" href="${escapeHtml(result.url)}">
          <span class="search-result__label">${escapeHtml(meta)}</span>
          <strong>${escapeHtml(result.title)}</strong>
          <span>${escapeHtml(result.excerpt)}</span>
          <small>${escapeHtml(result.url)}</small>
        </a>
      </li>
    `;
  }

  function setVisible(element, visible) {
    if (element) element.hidden = !visible;
  }

  function setupSearchRoot(root) {
    const input = root.querySelector("[data-search-input]");
    const results = root.querySelector("[data-search-results]");
    const empty = root.querySelector("[data-search-empty]");
    const noResults = root.querySelector("[data-search-no-results]");
    const clear = root.querySelector("[data-search-clear]");
    const count = root.querySelector("[data-search-count]");
    const form = root.querySelector("[data-search-form]");
    const mode = root.dataset.searchMode || "page";
    let debounceTimer;

    if (!input || !results) return;

    function render(query, updateUrl = false) {
      const trimmed = query.trim();
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(async () => {
        if (!trimmed) {
          results.innerHTML = "";
          setVisible(empty, true);
          setVisible(noResults, false);
          if (count) count.textContent = "";
          if (updateUrl && mode === "page") history.replaceState(null, "", "/search/");
          return;
        }

        const items = await loadIndex();
        const matches = searchItems(items, trimmed);
        results.innerHTML = matches.map(resultMarkup).join("");
        setVisible(empty, false);
        setVisible(noResults, matches.length === 0);
        if (count) count.textContent = matches.length ? `${matches.length} result${matches.length === 1 ? "" : "s"}` : "";
        if (updateUrl && mode === "page") history.replaceState(null, "", `/search/?q=${encodeURIComponent(trimmed)}`);
      }, 140);
    }

    input.addEventListener("input", () => render(input.value, mode === "page"));

    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = input.value.trim();
      if (mode === "overlay" && query) {
        window.location.href = `/search/?q=${encodeURIComponent(query)}`;
      } else {
        render(query, true);
      }
    });

    clear?.addEventListener("click", () => {
      input.value = "";
      input.focus();
      render("", true);
    });

    root.querySelectorAll("[data-popular-search]").forEach((button) => {
      button.addEventListener("click", () => {
        input.value = button.dataset.popularSearch || button.textContent.trim();
        input.focus();
        render(input.value, mode === "page");
      });
    });

    const initialQuery = new URLSearchParams(window.location.search).get("q");
    if (mode === "page" && initialQuery) {
      input.value = initialQuery;
      render(initialQuery, false);
    } else {
      render(input.value, false);
    }
  }

  function setupOverlay(root) {
    const button = root.querySelector("[data-search-open]");
    const panel = root.querySelector("[data-search-panel]");
    const backdrop = root.querySelector("[data-search-backdrop]");
    const closeButtons = root.querySelectorAll("[data-search-close]");
    const input = root.querySelector("[data-search-input]");
    let previousFocus;

    if (!button || !panel) return;

    function getFocusableElements() {
      return [...panel.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])")]
        .filter((item) => item.offsetParent !== null || item === input);
    }

    function open() {
      previousFocus = document.activeElement;
      root.dataset.open = "true";
      button.setAttribute("aria-expanded", "true");
      panel.removeAttribute("hidden");
      backdrop?.removeAttribute("hidden");
      document.body.classList.add("search-modal-open");
      window.setTimeout(() => input?.focus(), 0);
    }

    function close() {
      root.dataset.open = "false";
      button.setAttribute("aria-expanded", "false");
      panel.setAttribute("hidden", "");
      backdrop?.setAttribute("hidden", "");
      document.body.classList.remove("search-modal-open");
      if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
    }

    button.addEventListener("click", open);
    backdrop?.addEventListener("click", close);
    closeButtons.forEach((item) => item.addEventListener("click", close));
    document.addEventListener("keydown", (event) => {
      if (root.dataset.open !== "true") return;
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function setupFilter(root) {
    const input = root.querySelector("[data-filter-input]");
    const items = [...root.querySelectorAll("[data-filter-item]")];
    const empty = root.querySelector("[data-filter-empty]");
    const clear = root.querySelector("[data-filter-clear]");
    if (!input || !items.length) return;

    function filter() {
      const query = normalize(input.value).trim();
      let visibleCount = 0;
      for (const item of items) {
        const haystack = normalize(item.dataset.filterText || item.textContent);
        const visible = !query || haystack.includes(query);
        item.hidden = !visible;
        if (visible) visibleCount += 1;
      }
      setVisible(empty, visibleCount === 0);
    }

    input.addEventListener("input", filter);
    clear?.addEventListener("click", () => {
      input.value = "";
      input.focus();
      filter();
    });
    filter();
  }

  window.EchoBuddhaSearch = {
    popularSearches,
    setupSearchRoot,
    setupOverlay,
    setupFilter
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-search-root]").forEach(setupSearchRoot);
    document.querySelectorAll("[data-search-overlay]").forEach(setupOverlay);
    document.querySelectorAll("[data-filter-root]").forEach(setupFilter);
  });
})();
