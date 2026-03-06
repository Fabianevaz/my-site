(() => {
  const modalTriggers = Array.from(document.querySelectorAll("[data-modal]"));
  if (modalTriggers.length === 0) return;

  let lastTrigger = null;

  function openModal(modalId, triggerEl) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("lt-modal-open");
    lastTrigger = triggerEl || null;

    const dialog = modal.querySelector(".lt-modal-content");
    if (dialog) dialog.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");

    const hasOpenModal = document.querySelector(".lt-modal.is-open");
    if (!hasOpenModal) document.body.classList.remove("lt-modal-open");

    if (lastTrigger) {
      lastTrigger.focus();
      lastTrigger = null;
    }
  }

  modalTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openModal(trigger.getAttribute("data-modal"), trigger);
    });
  });

  document.addEventListener("click", (event) => {
    const closeEl = event.target.closest("[data-close='true']");
    if (!closeEl) return;
    const modal = closeEl.closest(".lt-modal");
    closeModal(modal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const openModalEl = document.querySelector(".lt-modal.is-open");
    if (openModalEl) closeModal(openModalEl);
  });
})();
