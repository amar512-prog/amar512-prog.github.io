(function () {
  const mount = document.querySelector("[data-page-chat]");

  if (!mount) {
    return;
  }

  mount.innerHTML = `
    <div class="page-chat__head">
      <p class="eyebrow">Discussion</p>
      <h2>Join the page conversation</h2>
      <p class="page-chat__intro">
        Comments for this page are powered by GitHub Issues and matched by page path.
        You will sign in with GitHub when you want to comment.
      </p>
    </div>

    <div class="page-chat__status">
      <p>
        If the discussion frame takes a moment to load, give it a second and then try again.
      </p>
    </div>

    <div class="page-chat__embed" data-utterances-root></div>
  `;

  const script = document.createElement("script");
  script.src = "https://utteranc.es/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.setAttribute("repo", "amar512-prog/amar512-prog.github.io");
  script.setAttribute("issue-term", "pathname");
  script.setAttribute("theme", "github-light");

  mount.querySelector("[data-utterances-root]")?.appendChild(script);
})();
