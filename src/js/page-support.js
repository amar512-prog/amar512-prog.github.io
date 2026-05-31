(function () {
  const mount = document.querySelector("[data-page-support]");
  const section = mount?.closest(".page-support-section");

  if (!mount) {
    return;
  }

  if (section) {
    section.hidden = true;
  }
})();
