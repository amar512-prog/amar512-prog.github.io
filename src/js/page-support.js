(function () {
  const mount = document.querySelector("[data-page-support]");

  if (!mount) {
    return;
  }

  mount.innerHTML = `
    <div class="page-support__copy">
      <p class="eyebrow">Support</p>
      <h2>Keep the next write-up moving</h2>
      <p class="page-support__intro">
        If a note or paper review helped you think more clearly, and you would like to
        support more work like this, the easiest place to start is GitHub.
      </p>
    </div>

    <div class="page-support__actions">
      <a class="button" href="https://github.com/amar512-prog">Support on GitHub</a>
      <a
        class="button button-secondary"
        href="https://github.com/amar512-prog/amar512-prog.github.io"
      >
        View the repository
      </a>
    </div>
  `;
})();
