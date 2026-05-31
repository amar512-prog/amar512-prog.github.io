(function () {
  const mount = document.querySelector("[data-page-chat]");

  if (!mount) {
    return;
  }

  const STORAGE_KEYS = {
    deviceId: "aa_chat_device_id",
    displayName: "aa_chat_display_name",
  };

  const state = {
    apiBase: resolveApiBase(),
    deviceId: getOrCreateDeviceId(),
    messages: [],
    loading: true,
    sending: false,
    fetchError: "",
    submitError: "",
    draftMessage: "",
    nameValue: getStoredDisplayName(),
    editingName: !getStoredDisplayName(),
  };

  const pageKey = getPageKey();
  const pageTitle = getPageTitle();

  render();
  loadMessages();

  function resolveApiBase() {
    const metaValue = document
      .querySelector('meta[name="aa-chat-api-base"]')
      ?.getAttribute("content")
      ?.trim();

    if (metaValue) {
      return metaValue.replace(/\/+$/, "");
    }

    if (typeof window.AA_CHAT_API_BASE === "string" && window.AA_CHAT_API_BASE.trim()) {
      return window.AA_CHAT_API_BASE.trim().replace(/\/+$/, "");
    }

    if (window.location.hostname === "amar512-prog.github.io") {
      return "https://chat-api-production-02de.up.railway.app";
    }

    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.protocol === "file:"
    ) {
      return "http://127.0.0.1:8788";
    }

    return "";
  }

  function getPageKey() {
    return decodeURIComponent(window.location.pathname.replace(/^\/+/, ""));
  }

  function getPageTitle() {
    const heading = document.querySelector("h1")?.textContent?.trim();
    return heading || document.title.trim();
  }

  function getStoredDisplayName() {
    return localStorage.getItem(STORAGE_KEYS.displayName)?.trim() || "";
  }

  function getOrCreateDeviceId() {
    const existingDeviceId = localStorage.getItem(STORAGE_KEYS.deviceId);

    if (isUuid(existingDeviceId)) {
      return existingDeviceId;
    }

    const deviceId =
      typeof window.crypto?.randomUUID === "function"
        ? window.crypto.randomUUID()
        : createFallbackUuid();

    localStorage.setItem(STORAGE_KEYS.deviceId, deviceId);
    return deviceId;
  }

  function createFallbackUuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
      const random = Math.floor(Math.random() * 16);
      const value = character === "x" ? random : (random & 0x3) | 0x8;
      return value.toString(16);
    });
  }

  function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value || ""
    );
  }

  function persistDisplayName(displayName) {
    const nextValue = displayName.trim();

    if (!nextValue) {
      localStorage.removeItem(STORAGE_KEYS.displayName);
      state.nameValue = "";
      return;
    }

    localStorage.setItem(STORAGE_KEYS.displayName, nextValue);
    state.nameValue = nextValue;
  }

  async function loadMessages() {
    if (!state.apiBase) {
      state.loading = false;
      state.fetchError = "Discussion is not configured yet.";
      render();
      return;
    }

    state.loading = true;
    state.fetchError = "";
    render();

    try {
      const response = await fetch(
        `${state.apiBase}/api/chat/pages/${encodeURIComponent(pageKey)}/messages?deviceId=${encodeURIComponent(
          state.deviceId
        )}`
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to load the discussion right now.");
      }

      state.messages = payload.messages || [];

      if (payload.viewerProfile?.displayName && !state.nameValue) {
        persistDisplayName(payload.viewerProfile.displayName);
        state.editingName = false;
      }
    } catch (error) {
      state.fetchError =
        error instanceof TypeError
          ? "Discussion is waking up. Please try again in a little while."
          : error.message || "Unable to load the discussion right now.";
    } finally {
      state.loading = false;
      render();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (state.sending) {
      return;
    }

    const textarea = mount.querySelector("[data-chat-message]");
    const nameInput = mount.querySelector("[data-chat-name]");
    const draftMessage = textarea?.value.trim() || "";
    const draftName = nameInput ? nameInput.value.trim() : state.nameValue.trim();

    state.submitError = "";
    state.draftMessage = draftMessage;

    if (!state.apiBase) {
      state.submitError = "Discussion is not configured yet.";
      render();
      return;
    }

    if (!draftMessage) {
      state.submitError = "Write a message before posting.";
      render();
      return;
    }

    if (draftMessage.length > 500) {
      state.submitError = "Message must be 500 characters or fewer.";
      render();
      return;
    }

    if (draftName.length > 40) {
      state.submitError = "Name or GitHub handle must be 40 characters or fewer.";
      render();
      return;
    }

    state.sending = true;
    render();

    try {
      const response = await fetch(
        `${state.apiBase}/api/chat/pages/${encodeURIComponent(pageKey)}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deviceId: state.deviceId,
            displayName: draftName || null,
            pageTitle,
            message: draftMessage,
          }),
        }
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to post your message right now.");
      }

      if (payload.viewerProfile?.displayName) {
        persistDisplayName(payload.viewerProfile.displayName);
        state.editingName = false;
      } else if (draftName) {
        persistDisplayName(draftName);
        state.editingName = false;
      }

      state.messages = [...state.messages, payload.message];
      state.draftMessage = "";
      state.submitError = "";
    } catch (error) {
      state.submitError =
        error instanceof TypeError
          ? "Discussion is not live yet. Please try posting again in a little while."
          : error.message || "Unable to post your message right now.";
    } finally {
      state.sending = false;
      render();
    }
  }

  function handleEditName() {
    state.editingName = true;
    render();
  }

  function handleRememberName() {
    const nameInput = mount.querySelector("[data-chat-name]");
    const nextValue = nameInput?.value.trim() || "";

    if (!nextValue) {
      state.submitError = "Enter a name or handle before saving it.";
      render();
      return;
    }

    if (nextValue.length > 40) {
      state.submitError = "Name or GitHub handle must be 40 characters or fewer.";
      render();
      return;
    }

    persistDisplayName(nextValue);
    state.editingName = false;
    state.submitError = "";
    render();
  }

  function formatTimestamp(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function renderMessages() {
    if (state.loading) {
      return `
        <div class="page-chat__status" aria-live="polite">
          Loading the discussion for this page.
        </div>
      `;
    }

    if (state.fetchError) {
      return `
        <div class="page-chat__status page-chat__status--error" aria-live="polite">
          <p>${escapeHtml(state.fetchError)}</p>
          <button type="button" class="page-chat__text-button" data-chat-retry>
            Retry
          </button>
        </div>
      `;
    }

    if (!state.messages.length) {
      return `
        <div class="page-chat__empty" aria-live="polite">
          Start the discussion for this page. Your name is optional and remembered on this device.
        </div>
      `;
    }

    return `
      <div class="page-chat__feed">
        ${state.messages
          .map((message) => {
            const author = message.displayName || "Visitor";
            const body = escapeHtml(message.body).replace(/\n/g, "<br>");
            const timestamp = formatTimestamp(message.createdAt);

            return `
              <article class="page-chat__message">
                <div class="page-chat__meta">
                  <span class="page-chat__author">${escapeHtml(author)}</span>
                  <time datetime="${escapeHtml(message.createdAt || "")}">
                    ${escapeHtml(timestamp)}
                  </time>
                </div>
                <p class="page-chat__body">${body}</p>
              </article>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderIdentityBlock() {
    if (!state.editingName && state.nameValue.trim()) {
      return `
        <div class="page-chat__identity">
          <div>
            <p class="page-chat__label">Posting as</p>
            <strong>${escapeHtml(state.nameValue.trim())}</strong>
          </div>
          <button type="button" class="page-chat__text-button" data-chat-edit-name>
            Edit name
          </button>
        </div>
      `;
    }

    return `
      <div class="page-chat__identity-form">
        <label class="page-chat__label" for="page-chat-name">
          Name or GitHub handle (optional)
        </label>
        <div class="page-chat__name-row">
          <input
            id="page-chat-name"
            class="page-chat__input"
            type="text"
            maxlength="40"
            placeholder="Saved on this device"
            value="${escapeHtml(state.nameValue)}"
            data-chat-name
          >
          <button type="button" class="page-chat__text-button" data-chat-save-name>
            Remember name
          </button>
        </div>
      </div>
    `;
  }

  function render() {
    const messageLength = state.draftMessage.length;

    mount.innerHTML = `
      <div class="page-chat__head">
        <p class="eyebrow">Discussion</p>
        <h2>Join the page conversation</h2>
        <p class="page-chat__intro">
          Messages are shared only on this page. Your browser keeps the same device ID and optional name for future visits.
        </p>
      </div>

      ${renderMessages()}

      <form class="page-chat__composer" data-chat-form>
        ${renderIdentityBlock()}
        <div class="page-chat__field">
          <label class="page-chat__label" for="page-chat-message">Your message</label>
          <textarea
            id="page-chat-message"
            class="page-chat__textarea"
            maxlength="500"
            placeholder="Add a thought, question, or correction."
            data-chat-message
          >${escapeHtml(state.draftMessage)}</textarea>
        </div>
        <div class="page-chat__toolbar">
          <div class="page-chat__toolbar-copy">
            <span class="page-chat__helper">Latest 50 messages for this page are loaded here.</span>
            <span class="page-chat__counter">${messageLength}/500</span>
          </div>
          <button class="button" type="submit" ${state.sending ? "disabled" : ""}>
            ${state.sending ? "Posting..." : "Post message"}
          </button>
        </div>
        ${
          state.submitError
            ? `<p class="page-chat__error" aria-live="polite">${escapeHtml(state.submitError)}</p>`
            : ""
        }
      </form>
    `;

    mount.querySelector("[data-chat-form]")?.addEventListener("submit", handleSubmit);
    mount
      .querySelector("[data-chat-retry]")
      ?.addEventListener("click", loadMessages);
    mount
      .querySelector("[data-chat-edit-name]")
      ?.addEventListener("click", handleEditName);
    mount
      .querySelector("[data-chat-save-name]")
      ?.addEventListener("click", handleRememberName);
    mount.querySelector("[data-chat-message]")?.addEventListener("input", (event) => {
      state.draftMessage = event.target.value;
      mount.querySelector(".page-chat__counter").textContent = `${state.draftMessage.length}/500`;
    });
    mount.querySelector("[data-chat-name]")?.addEventListener("input", (event) => {
      state.nameValue = event.target.value;
    });
  }
})();
