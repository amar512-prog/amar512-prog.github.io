(function () {
  const mount = document.querySelector("[data-page-chat]");
  const repo = "amar512-prog/amar512-prog.github.io";
  const repoOwner = repo.split("/")[0].toLowerCase();
  const themeHref =
    window.location.protocol === "http:" || window.location.protocol === "https:"
      ? new URL("/giscus-theme.css?v=20260531g", window.location.origin).toString()
      : "noborder_light";

  if (!mount) {
    return;
  }

  mount.innerHTML = `
    <div class="page-chat__head">
      <p class="eyebrow">Discussion</p>
      <h2>Join the conversation</h2>
      <p class="page-chat__intro">
        Comments here are powered by GitHub Discussions. Sign in with GitHub if you want
        to ask a question, leave a note, or react to a post.
      </p>
    </div>

    <div class="page-chat__status">
      <p>
        Use this space to ask a question, share a takeaway, or add a useful follow-up to
        the piece.
      </p>
    </div>

    <div class="page-chat__owner-tools" data-page-chat-owner-tools hidden>
      <div class="page-chat__owner-copy">
        <p class="eyebrow">Owner tools</p>
        <p class="page-chat__owner-note" data-page-chat-owner-note>
          Open the GitHub discussion to remove the full thread when you need to clear it
          out.
        </p>
      </div>
      <a
        class="button button-secondary page-chat__owner-link"
        data-page-chat-delete-thread
        href="#"
        target="_blank"
        rel="noreferrer noopener"
      >
        Delete thread on GitHub
      </a>
    </div>

    <div class="page-chat__embed">
      <div class="giscus"></div>
    </div>
  `;

  const ownerTools = mount.querySelector("[data-page-chat-owner-tools]");
  const ownerNote = mount.querySelector("[data-page-chat-owner-note]");
  const ownerDeleteLink = mount.querySelector("[data-page-chat-delete-thread]");

  ownerDeleteLink?.removeAttribute("href");

  function updateOwnerTools(metadataMessage) {
    if (!ownerTools || !ownerDeleteLink || !ownerNote) {
      return;
    }

    const discussionUrl =
      typeof metadataMessage?.discussion?.url === "string" ? metadataMessage.discussion.url : "";
    const viewerLogin =
      typeof metadataMessage?.viewer?.login === "string"
        ? metadataMessage.viewer.login.toLowerCase()
        : "";
    const totalCommentCount = Number(metadataMessage?.discussion?.totalCommentCount);
    const canManage = Boolean(discussionUrl) && viewerLogin === repoOwner;

    ownerTools.hidden = !canManage;

    if (!canManage) {
      ownerDeleteLink.removeAttribute("href");
      return;
    }

    ownerDeleteLink.href = discussionUrl;

    if (Number.isFinite(totalCommentCount) && totalCommentCount >= 0) {
      ownerNote.textContent =
        totalCommentCount === 0
          ? "Open the GitHub discussion to remove this thread before it picks up replies."
          : `Open the GitHub discussion to remove this full thread and its ${totalCommentCount} ${
              totalCommentCount === 1 ? "reply" : "replies"
            }.`;
      return;
    }

    ownerNote.textContent =
      "Open the GitHub discussion to remove the full thread when you need to clear it out.";
  }

  function handleGiscusMessage(event) {
    if (event.origin !== "https://giscus.app") {
      return;
    }

    if (!(typeof event.data === "object" && event.data && "giscus" in event.data)) {
      return;
    }

    const giscusData = event.data.giscus;

    if (giscusData && typeof giscusData === "object" && "discussion" in giscusData) {
      updateOwnerTools(giscusData);
    }
  }

  window.addEventListener("message", handleGiscusMessage);

  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.setAttribute("data-repo", repo);
  script.setAttribute("data-repo-id", "R_kgDOInzVeg");
  script.setAttribute("data-category", "Announcements");
  script.setAttribute("data-category-id", "DIC_kwDOInzVes4C-MbK");
  script.setAttribute("data-mapping", "pathname");
  script.setAttribute("data-strict", "0");
  script.setAttribute("data-reactions-enabled", "1");
  script.setAttribute("data-emit-metadata", "1");
  script.setAttribute("data-input-position", "bottom");
  script.setAttribute("data-theme", themeHref);
  script.setAttribute("data-lang", "en");

  mount.querySelector(".giscus")?.appendChild(script);
})();
