(function () {
  const mount = document.querySelector("[data-page-chat]");

  if (!mount) {
    return;
  }

  const repo = "amar512-prog/amar512-prog.github.io";
  const pageKey = window.location.pathname.replace(/^\/+/, "") || "index.html";
  const pageTitle =
    document.querySelector("h1")?.textContent?.trim() || document.title.trim();
  const pageUrl = `${window.location.origin}${window.location.pathname}`;
  const issueTitle = `Page discussion: ${pageKey}`;
  const searchQuery = `is:issue repo:${repo} in:title "${issueTitle}"`;
  const searchUrl = `https://github.com/${repo}/issues?q=${encodeURIComponent(searchQuery)}`;
  const newIssueBody = [
    `Page title: ${pageTitle}`,
    `Page path: /${pageKey}`,
    `Page URL: ${pageUrl}`,
    "",
    "Use this issue as the public discussion thread for this page."
  ].join("\n");
  const newIssueUrl =
    `https://github.com/${repo}/issues/new?title=${encodeURIComponent(issueTitle)}` +
    `&body=${encodeURIComponent(newIssueBody)}`;

  mount.innerHTML = `
    <div class="page-chat__head">
      <p class="eyebrow">Discussion</p>
      <h2>Discuss this page on GitHub</h2>
      <p class="page-chat__intro">
        Each article and note can have one shared GitHub issue thread keyed to its page path.
        If a thread already exists, open it. If not, start one with the prefilled draft below.
      </p>
    </div>

    <div class="page-chat__status">
      <p>
        This page uses the repository issue tracker instead of an embedded app, so the
        discussion stays readable even when the site is hosted statically.
      </p>
      <div class="article-actions page-chat__actions">
        <a class="button" href="${searchUrl}" target="_blank" rel="noreferrer">
          View page thread
        </a>
        <a class="button button-secondary" href="${newIssueUrl}" target="_blank" rel="noreferrer">
          Start thread
        </a>
      </div>
    </div>
  `;
})();
