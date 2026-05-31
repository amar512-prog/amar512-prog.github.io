(function () {
  const mount = document.querySelector("[data-page-chat]");

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
        This thread is mapped to the current page path, so each note or paper review keeps
        its own discussion stream.
      </p>
    </div>

    <div class="page-chat__embed">
      <div class="giscus"></div>
    </div>
  `;

  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.setAttribute("data-repo", "amar512-prog/amar512-prog.github.io");
  script.setAttribute("data-repo-id", "R_kgDOInzVeg");
  script.setAttribute("data-category", "Announcements");
  script.setAttribute("data-category-id", "DIC_kwDOInzVes4C-MbK");
  script.setAttribute("data-mapping", "pathname");
  script.setAttribute("data-strict", "0");
  script.setAttribute("data-reactions-enabled", "1");
  script.setAttribute("data-emit-metadata", "0");
  script.setAttribute("data-input-position", "bottom");
  script.setAttribute("data-theme", "preferred_color_scheme");
  script.setAttribute("data-lang", "en");

  mount.querySelector(".giscus")?.appendChild(script);
})();
