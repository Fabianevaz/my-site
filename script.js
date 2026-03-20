const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.header-links');

if (toggle && menu) {
  toggle.setAttribute('aria-expanded', 'false');
  const openMenu = () => {
    menu.classList.add('active');
    document.body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
  };

  const closeMenu = () => {
    menu.classList.remove('active');
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  const isOpen = () => menu.classList.contains('active');

  const toggleMenu = () => {
    if (isOpen()) closeMenu();
    else openMenu();
  };

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  menu.querySelectorAll('a').forEach((link) => { // aqui fecha o menu se clicar num link
    link.addEventListener('click', () => closeMenu());
  });

  document.addEventListener('click', (e) => { // esse fecha se clicar fora
    if (!menu.contains(e.target) && !toggle.contains(e.target)) closeMenu();
  });


  document.addEventListener('keydown', (e) => { // esse aqui fecha com esc
    if (e.key === 'Escape') closeMenu();
  });
}
(async () => {
  const agendaSource = "./src/agenda.json";
  const agendaCarousel = document.querySelector("#sobre .carousel");
  const agendaTrack = document.getElementById("agendaCarouselTrack");
  const agendaDots = document.getElementById("agendaCarouselDots");
  const agendaModal = document.getElementById("modalAgenda");
  const agendaModalBody = document.getElementById("agendaModalContent");

  if (!agendaCarousel || !agendaTrack || !agendaDots || !agendaModalBody) return;

  const prevButtons = Array.from(agendaCarousel.querySelectorAll(".carousel-btn.prev, .carousel-btn.prev-mobile"));
  const nextButtons = Array.from(agendaCarousel.querySelectorAll(".carousel-btn.next, .carousel-btn.next-mobile"));

  const parseLocalDate = (value) => {
    if (!value || typeof value !== "string") return null;
    const [year, month, day] = value.split("-").map(Number);
    if (![year, month, day].every(Number.isFinite)) return null;
    return new Date(year, month - 1, day, 12, 0, 0, 0);
  };

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);

  const sortAgendaItems = (items) => {
    return [...items].sort((a, b) => {
      const aTime = parseLocalDate(a.startDate)?.getTime() ?? 0;
      const bTime = parseLocalDate(b.startDate)?.getTime() ?? 0;
      return aTime - bTime;
    });
  };

  const isVisibleAgendaItem = (entry) => {
    if (!entry || entry.hidden === true) return false;
    const endDate = parseLocalDate(entry.endDate || entry.startDate);
    return !!endDate && endDate >= todayStart;
  };

  const buildModalText = (entry) => {
    const title = entry.title || "";
    const subtitle = entry.subtitle || "";
    const location = entry.location || "";
    return `${title}: ${subtitle} (${location})`;
  };

  const createAgendaCard = (entry) => {
    const card = document.createElement("div");
    card.className = "cards-sobre";

    const inner = document.createElement("div");
    inner.className = "tracejado";

    const header = document.createElement("div");
    header.className = "icon-e-data";

    const iconWrap = document.createElement("div");
    iconWrap.className = "cards-sobre-icon";
    const icon = document.createElement("i");
    icon.className = "fa-solid fa-calendar-days";
    iconWrap.appendChild(icon);

    const dateWrap = document.createElement("div");
    dateWrap.className = "cards-sobre-data";
    const dateText = document.createElement("p");
    const strong = document.createElement("b");
    strong.textContent = entry.cardDate || "";
    dateText.appendChild(strong);
    dateText.append(document.createTextNode(" -"));
    dateText.appendChild(document.createElement("br"));
    dateText.append(document.createTextNode(entry.location || ""));
    dateWrap.appendChild(dateText);

    header.append(iconWrap, dateWrap);

    const title = document.createElement("h3");
    title.className = "agenda-titulo";
    title.textContent = entry.title || "";

    const subtitle = document.createElement("p");
    subtitle.className = "agenda-subtitulo";
    subtitle.textContent = entry.subtitle || "";

    const footer = document.createElement("div");
    footer.className = "agenda-botao-linha";

    const line = document.createElement("div");
    line.className = "linha-agenda";

    const button = document.createElement("button");
    button.className = "button agenda-completa-btn btn-agenda-trigger";
    button.type = "button";
    button.textContent = "Ver agenda completa >";

    footer.append(line, button);
    inner.append(header, title, subtitle, footer);
    card.appendChild(inner);
    return card;
  };

  const createAgendaDot = (index, isActive) => {
    const dot = document.createElement("button");
    dot.className = `dot${isActive ? " active" : ""}`;
    dot.type = "button";
    dot.setAttribute("aria-label", `Slide ${index + 1}`);
    return dot;
  };

  const createEmptyAgendaCard = () => {
    return createAgendaCard({
      cardDate: "Em breve",
      location: "Novas datas",
      title: "Agenda em atualização",
      subtitle: "Novas datas serão publicadas em breve."
    });
  };

  const createAgendaSection = (title, items) => {
    const section = document.createElement("div");
    section.className = "curriculo-content";

    const heading = document.createElement("h2");
    heading.textContent = title;

    const list = document.createElement("ul");

    items.forEach((entry) => {
      const item = document.createElement("li");

      const icon = document.createElement("i");
      icon.className = "fa-solid fa-check";

      const date = document.createElement("span");
      date.className = "agenda-date";
      date.textContent = entry.modalDate || "";

      const divider = document.createElement("span");
      divider.className = "agenda-divider";
      divider.setAttribute("aria-hidden", "true");

      const event = document.createElement("span");
      event.className = "agenda-event";
      event.textContent = buildModalText(entry);

      item.append(icon, date, divider, event);
      list.appendChild(item);
    });

    section.append(heading, list);
    return section;
  };

  const createEmptyAgendaSection = (message = "Adicione novas datas no arquivo agenda.json para exibir a agenda novamente.") => {
    const section = document.createElement("div");
    section.className = "curriculo-content";

    const heading = document.createElement("h2");
    heading.textContent = "Sem eventos visiveis";

    const list = document.createElement("ul");
    const item = document.createElement("li");
    item.textContent = message;
    list.appendChild(item);

    section.append(heading, list);
    return section;
  };

  const setAgendaButtonsDisabled = (disabled) => {
    [...prevButtons, ...nextButtons].forEach((button) => {
      button.disabled = disabled;
      button.setAttribute("aria-disabled", String(disabled));
    });
  };

  const initAgendaCarousel = () => {
    const viewport = agendaCarousel.querySelector(".carousel-viewport");
    const slides = Array.from(agendaTrack.children);
    const dots = Array.from(agendaDots.querySelectorAll(".dot"));

    if (!viewport || slides.length === 0) {
      setAgendaButtonsDisabled(true);
      return;
    }

    let currentIndex = 0;

    const isSpotlightMode = () => window.matchMedia("(min-width: 769px)").matches;

    const updateDots = () => {
      dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentIndex);
      });
    };

    const updateCards = () => {
      const spotlight = isSpotlightMode();

      slides.forEach((slide, index) => {
        if (!spotlight) {
          slide.style.order = "";
          slide.classList.remove("is-center");
          return;
        }

        const total = slides.length;
        const relative = (index - currentIndex + total) % total;
        slide.style.order = String(relative === total - 1 ? 0 : relative + 1);
        slide.classList.toggle("is-center", index === currentIndex);
      });

      if (!spotlight) {
        agendaTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
        return;
      }

      const currentSlide = slides[currentIndex];
      if (!currentSlide) return;

      requestAnimationFrame(() => {
        const viewportWidth = viewport.clientWidth;
        const slideWidth = currentSlide.getBoundingClientRect().width;
        const left = currentSlide.offsetLeft;
        const offsetPx = left - ((viewportWidth - slideWidth) / 2);
        agendaTrack.style.transform = `translateX(${-Math.max(0, offsetPx)}px)`;
      });
    };

    const goTo = (index) => {
      if (slides.length === 0) return;
      currentIndex = (index + slides.length) % slides.length;
      updateCards();
      updateDots();
    };

    const goPrev = () => goTo(currentIndex - 1);
    const goNext = () => goTo(currentIndex + 1);

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => goTo(index));
    });

    prevButtons.forEach((button) => {
      button.addEventListener("click", goPrev);
    });

    nextButtons.forEach((button) => {
      button.addEventListener("click", goNext);
    });

    setAgendaButtonsDisabled(slides.length <= 1);
    updateCards();
    updateDots();
    window.addEventListener("resize", () => updateCards());
  };

  const renderAgenda = (visibleItems, fetchFailed = false) => {
    const cardItems = visibleItems.slice(0, 3);

    agendaTrack.textContent = "";
    agendaDots.textContent = "";
    agendaModalBody.textContent = "";

    if (cardItems.length === 0) {
      agendaTrack.appendChild(createEmptyAgendaCard());
    } else {
      cardItems.forEach((entry, index) => {
        agendaTrack.appendChild(createAgendaCard(entry));
        agendaDots.appendChild(createAgendaDot(index, index === 0));
      });
    }

    if (visibleItems.length === 0) {
      const message = fetchFailed
        ? "Nao foi possivel carregar agenda.json. Confira se o servidor local esta rodando e tente novamente."
        : "Adicione novas datas no arquivo agenda.json para exibir a agenda novamente.";
      agendaModalBody.appendChild(createEmptyAgendaSection(message));
    } else {
      const groupedItems = visibleItems.reduce((acc, entry) => {
        const key = entry.sectionTitle || "Agenda";
        if (!acc.has(key)) acc.set(key, []);
        acc.get(key).push(entry);
        return acc;
      }, new Map());

      groupedItems.forEach((items, title) => {
        agendaModalBody.appendChild(createAgendaSection(title, items));
      });
    }

    if (agendaModal) {
      bindSimpleModal(Array.from(document.querySelectorAll(".btn-agenda-trigger")), agendaModal);
    }

    initAgendaCarousel();
  };

  try {
    const response = await fetch(agendaSource, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const agenda = await response.json();
    if (!Array.isArray(agenda)) throw new Error("Formato invalido para agenda.json");

    const visibleItems = sortAgendaItems(agenda.filter(isVisibleAgendaItem));
    renderAgenda(visibleItems, false);
  } catch (error) {
    console.warn("Nao foi possivel carregar agenda via JSON.", error);
    renderAgenda([], true);
  }
})();

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

let activeModalState = null;

function getFocusableElements(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
    .filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
}

function trapFocusInModal(e) {
  if (!activeModalState || e.key !== 'Tab') return;
  const { modalEl } = activeModalState;
  const focusable = getFocusableElements(modalEl);
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const isShift = e.shiftKey;

  if (isShift && document.activeElement === first) {
    e.preventDefault();
    last.focus();
    return;
  }

  if (!isShift && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function openModalA11y(modalEl, triggerEl = null) {
  if (!modalEl) return;
  modalEl.classList.add("is-open");
  modalEl.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  activeModalState = { modalEl, triggerEl };
  document.addEventListener("keydown", trapFocusInModal, true);

  const focusable = getFocusableElements(modalEl);
  const firstTarget = focusable[0] || modalEl.querySelector(".modal-content") || modalEl;
  if (firstTarget && typeof firstTarget.focus === "function") {
    if (!firstTarget.hasAttribute("tabindex") && (firstTarget === modalEl || firstTarget.classList.contains("modal-content"))) {
      firstTarget.setAttribute("tabindex", "-1");
    }
    firstTarget.focus();
  }
}

function closeModalA11y(modalEl) {
  if (!modalEl) return;
  modalEl.classList.remove("is-open");
  modalEl.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  if (activeModalState && activeModalState.modalEl === modalEl) {
    const { triggerEl } = activeModalState;
    activeModalState = null;
    document.removeEventListener("keydown", trapFocusInModal, true);
    if (triggerEl && typeof triggerEl.focus === "function") {
      triggerEl.focus();
    }
  }
}

const btnVerMais = document.getElementById("verMais_sobre");
const sobre = document.getElementById("sobre");

if (btnVerMais && sobre) {
  btnVerMais.addEventListener("click", function (e) {
    e.preventDefault();

    const expandido = sobre.classList.contains("expandido");

    if (!expandido) {
      sobre.classList.add("expandido");
      btnVerMais.textContent = "Ver menos <";
    } else {
      sobre.classList.remove("expandido");
      btnVerMais.textContent = "Ver mais >";

      setTimeout(() => {
        sobre.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  });
}

const btnCurriculo = document.getElementById("curriculo_pdf");
const modal = document.getElementById("modalCurriculo");
let modalCurriculoTrigger = null;

function openModal() {
  openModalA11y(modal, modalCurriculoTrigger);
}

function closeModal() {
  closeModalA11y(modal);
}

if (btnCurriculo && modal) {
  btnCurriculo.addEventListener("click", (e) => {
    e.preventDefault();
    modalCurriculoTrigger = e.currentTarget;
    openModal();
  });

  modal.addEventListener("click", (e) => {
    const target = e.target;
    if (target && target.dataset && target.dataset.close === "true") {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

const btnAgendaCompleta = document.querySelectorAll(".btn-agenda-trigger");
const modalAgenda = document.getElementById("modalAgenda");

function bindSimpleModal(triggers, modalEl) {
  if (!modalEl || !triggers || triggers.length === 0) return;
  let lastTrigger = null;

  const openModal = () => {
    openModalA11y(modalEl, lastTrigger);
  };

  const closeModal = () => {
    closeModalA11y(modalEl);
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      lastTrigger = e.currentTarget;
      openModal();
    });
  });

  modalEl.addEventListener("click", (e) => {
    const target = e.target;
    if (target && target.dataset && target.dataset.close === "true") {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalEl.classList.contains("is-open")) {
      closeModal();
    }
  });
}

if (btnAgendaCompleta.length > 0 && modalAgenda) {
  bindSimpleModal(Array.from(btnAgendaCompleta), modalAgenda);
}

// MODAIS DE SERVIÇOS
(function () {
  const servicosSection = document.getElementById('servicos');
  if (!servicosSection) return;

  const modalIds = ['modalDiagnostico', 'modalEstrutura', 'modalAceleracao', 'modalEbook', 'modalEbook7'];
  const modais = {};

  modalIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) modais[id] = el;
  });
  let lastServicoTrigger = null;

  function openServicoModal(id) {
    const modal = modais[id];
    if (!modal) return;
    openModalA11y(modal, lastServicoTrigger);
  }

  function closeServicoModal(modal) {
    if (!modal) return;
    closeModalA11y(modal);
  }

  // Delegação no section para capturar clicks nos botões mesmo dentro do carousel
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.btn-ver-detalhes, .btn-ebook-trigger');
    if (btn) {
      e.preventDefault();
      lastServicoTrigger = btn;
      openServicoModal(btn.getAttribute('data-modal'));
      return;
    }

    // Fechar pelo backdrop ou botão ×
    const target = e.target;
    if (target && target.dataset && target.dataset.close === 'true') {
      const openModal = target.closest('.modal.is-open');
      if (openModal && modalIds.includes(openModal.id)) {
        closeServicoModal(openModal);
      }
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      modalIds.forEach(id => {
        const modal = modais[id];
        if (modal && modal.classList.contains('is-open')) {
          closeServicoModal(modal);
        }
      });
    }
  });
})();

function initCarousel(carousel) {
  if (!carousel || carousel.dataset.carouselInitialized === "true") return;
  const track = carousel.querySelector('.carousel-track');
  const viewport = carousel.querySelector('.carousel-viewport');
  const prevBtn = carousel.querySelector('.carousel-btn.prev');
  const nextBtn = carousel.querySelector('.carousel-btn.next');
  const dotsContainer = carousel.querySelector('.carousel-dots');
  const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll('.dot')) : [];

  if (!track || !viewport) return;

  const slides = Array.from(track.children);
  if (slides.length === 0) return;
  carousel.dataset.carouselInitialized = "true";

  const isMobileOnly = carousel.classList.contains('mobile-carousel');
  const isServicesCarousel = carousel.id === 'carousel-servicos';
  const isSobreCarousel = !!carousel.closest('#sobre');

  const autoplayTime = 4000;
  const pauseAfterClick = 10000;

  let intervalId = null;
  let pauseTimeoutId = null;
  let isAnimating = false;
  let currentIndex = 0;
  const useIndexMode = dots.length > 0;

  function isServicesTabletMode() {
    return isServicesCarousel && window.matchMedia('(min-width: 769px) and (max-width: 1100px)').matches;
  }

  function isSobreTabletMode() {
    return isSobreCarousel && window.matchMedia('(min-width: 769px) and (max-width: 1100px)').matches;
  }

  function isSobreDesktopMode() {
    return isSobreCarousel && window.matchMedia('(min-width: 1101px)').matches;
  }

  function isSpotlightMode() {
    return isServicesTabletMode() || isSobreTabletMode() || isSobreDesktopMode();
  }

  function isDesktopOff() {
    return isMobileOnly && window.innerWidth >= 768 && !isServicesTabletMode();
  }

  if (isSpotlightMode() && slides.length > 0) {
    currentIndex = 0;
  }

  const setTransitionOn = () => {
    track.style.transition = 'transform 0.6s cubic-bezier(0.5, 0, 0.4, 1)';
  };

  const setTransitionOff = () => {
    track.style.transition = 'none';
  };

  function updateDots() {
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  function updateSpotlightCenterState() {
    if (!isServicesCarousel && !isSobreCarousel) return;
    slides.forEach((slide, index) => {
      slide.classList.toggle('is-center', isSpotlightMode() && index === currentIndex);
    });
  }

  function updateSlideOrder() {
    if (!useIndexMode) return;
    const total = slides.length;
    slides.forEach((slide, index) => {
      const relative = (index - currentIndex + total) % total;
      const order = isSpotlightMode()
        ? (relative === total - 1 ? 0 : (relative === 0 ? 1 : relative + 1))
        : relative;
      slide.style.order = String(order);
    });
  }

  function clearSlideOrder() {
    if (!useIndexMode) return;
    slides.forEach((slide) => {
      slide.style.order = '';
    });
  }

  function applyInfiniteIndexTransform() {
    if (!useIndexMode) return false;
    updateSlideOrder();
    const currentSlide = slides[currentIndex];
    if (!currentSlide) return false;
    const viewportWidth = viewport.clientWidth;
    const slideWidth = currentSlide.getBoundingClientRect().width;
    const left = currentSlide.offsetLeft;
    const offsetPx = isSpotlightMode()
      ? left - ((viewportWidth - slideWidth) / 2)
      : left;
    track.style.transform = `translateX(${-Math.max(0, offsetPx)}px)`;
    return true;
  }

  function moveTo(index) {
    if (isDesktopOff() || isAnimating) return;
    currentIndex = index;
    updateSpotlightCenterState();
    setTransitionOn();
    const previousTransform = track.style.transform;
    if (applyInfiniteIndexTransform()) {
      updateDots();
      if (track.style.transform === previousTransform) {
        isAnimating = false;
        return;
      }
      isAnimating = true;
      track.addEventListener('transitionend', () => {
        isAnimating = false;
      }, { once: true });
      return;
    }
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    updateDots();
    isAnimating = true;
    track.addEventListener('transitionend', () => {
      isAnimating = false;
    }, { once: true });
  }

  function moveNext() {
    if (isDesktopOff()) {
      track.style.transform = 'none';
      return;
    }
    if (isAnimating) return;

    if (useIndexMode) {
      if (currentIndex < slides.length - 1) {
        moveTo(currentIndex + 1);
      } else {
        moveTo(0);
      }
      return;
    }

    if (!track.firstElementChild) return;
    isAnimating = true;
    const firstSlide = track.firstElementChild;
    setTransitionOn();
    track.style.transform = 'translateX(-100%)';
    track.addEventListener('transitionend', () => {
      setTransitionOff();
      track.appendChild(firstSlide);
      track.style.transform = 'translateX(0)';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitionOn();
          isAnimating = false;
        });
      });
    }, { once: true });
  }

  function movePrev() {
    if (isDesktopOff()) return;
    if (isAnimating) return;

    if (useIndexMode) {
      if (currentIndex > 0) {
        moveTo(currentIndex - 1);
      } else {
        moveTo(slides.length - 1);
      }
      return;
    }

    if (!track.lastElementChild) return;
    isAnimating = true;
    const lastSlide = track.lastElementChild;
    setTransitionOff();
    track.prepend(lastSlide);
    track.style.transform = 'translateX(-100%)';
    requestAnimationFrame(() => {
      setTransitionOn();
      track.style.transform = 'translateX(0)';
    });
    track.addEventListener('transitionend', () => {
      isAnimating = false;
    }, { once: true });
  }

  function startAutoplay() {
    stopAutoplay();
    intervalId = setInterval(moveNext, autoplayTime);
  }

  function stopAutoplay() {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
  }

  function pauseAutoplay() {
    stopAutoplay();
    if (pauseTimeoutId) clearTimeout(pauseTimeoutId);
    pauseTimeoutId = setTimeout(() => {
      startAutoplay();
    }, pauseAfterClick);
  }

  const nextBtns = carousel.querySelectorAll('.carousel-btn.next, .carousel-btn.next-mobile');
  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      moveNext();
      pauseAutoplay();
    });
  });

  const prevBtns = carousel.querySelectorAll('.carousel-btn.prev, .carousel-btn.prev-mobile');
  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      movePrev();
      pauseAutoplay();
    });
  });

  if (useIndexMode) {
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        if (currentIndex !== index) {
          moveTo(index);
          pauseAutoplay();
        }
      });
    });
  }

  window.addEventListener('resize', () => {
    if (isDesktopOff()) {
      track.style.transform = 'none';
      clearSlideOrder();
      stopAutoplay();
    } else {
      updateSpotlightCenterState();
      if (useIndexMode) {
        if (!applyInfiniteIndexTransform()) {
          clearSlideOrder();
          track.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
      }
      startAutoplay();
    }
  });

  if (!isDesktopOff()) {
    updateSpotlightCenterState();
    if (useIndexMode) {
      if (!applyInfiniteIndexTransform()) {
        clearSlideOrder();
      }
      updateDots();
    }
    startAutoplay();
  } else {
    track.style.transform = 'none';
    clearSlideOrder();
  }

  let startX = 0;
  let startY = 0;
  let deltaX = 0;
  let deltaY = 0;
  let isTouching = false;
  const SWIPE_THRESHOLD = 50;
  const VERTICAL_TOLERANCE = 30;

  viewport.addEventListener('touchstart', (e) => {
    if (isDesktopOff() || isAnimating) return;
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    deltaX = 0;
    deltaY = 0;
    isTouching = true;
    pauseAutoplay();
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    if (!isTouching || isDesktopOff()) return;
    const t = e.touches[0];
    deltaX = t.clientX - startX;
    deltaY = t.clientY - startY;
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > VERTICAL_TOLERANCE) {
      isTouching = false;
    }
  }, { passive: true });

  viewport.addEventListener('touchend', () => {
    if (!isTouching || isDesktopOff()) return;
    isTouching = false;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
    if (deltaX < 0) moveNext();
    else movePrev();
  }, { passive: true });
}

document.querySelectorAll('.carousel').forEach(initCarousel);


 (async () => {
  const carousel = document.getElementById("tCarousel");
  if (!carousel) return;

  const viewport = carousel.querySelector(".t-viewport");
  const track = carousel.querySelector(".t-track");
  const prev = carousel.querySelector(".t-btn.prev");
  const next = carousel.querySelector(".t-btn.next");
  const testimonialsSource = "./src/depoimentos.json";

  const buildSnippet = (fullText) => {
    if (!fullText) return "";
    const normalized = fullText
      .replace(/lineB/g, " ")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const maxChars = 230;
    if (normalized.length <= maxChars) return normalized;
    const sliced = normalized.slice(0, maxChars);
    const safeCut = sliced.lastIndexOf(" ");
    return `${(safeCut > 120 ? sliced.slice(0, safeCut) : sliced).trim()}...`;
  };

  const buildStars = (count) => {
    const safeCount = Number.isFinite(count) ? Math.max(0, count) : 5;
    return Array.from({ length: safeCount }, () => "★").join(" ");
  };

  const setAuthorContent = (authorEl, author) => {
    if (!authorEl) return;
    authorEl.textContent = "";
    const dash = document.createElement("span");
    dash.textContent = "—";
    authorEl.appendChild(dash);
    if (author) {
      authorEl.append(document.createTextNode(` ${author}`));
    } else {
      authorEl.append(document.createTextNode(" "));
    }
  };

  const createTestimonialCard = (entry) => {
    const article = document.createElement("article");
    article.className = "testimonial-card";

    const quoteIcon = document.createElement("i");
    quoteIcon.className = "fa-solid fa-quote-left";

    const snippet = document.createElement("p");
    snippet.className = "t-snippet";
    snippet.textContent = buildSnippet(entry.fullText || "");

    const author = document.createElement("p");
    author.className = "t-author";
    setAuthorContent(author, entry.author || "");

    const enterprise = document.createElement("p");
    enterprise.className = "t-author-enterprise";
    enterprise.textContent = entry.enterprise || "";

    const stars = document.createElement("p");
    stars.className = "t-stars";
    stars.textContent = buildStars(entry.stars ?? 5);

    const button = document.createElement("button");
    button.className = "t-more";
    button.type = "button";
    button.textContent = "Ler mais";
    button.dataset.title = entry.author || "";
    button.dataset.full = entry.fullText || "";

    article.append(quoteIcon, snippet, author, enterprise, stars, button);
    return article;
  };

  const renderTestimonialsFromJson = async () => {
    try {
      const response = await fetch(testimonialsSource, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const testimonials = await response.json();
      if (!Array.isArray(testimonials) || testimonials.length === 0) return false;

      track.textContent = "";
      testimonials.forEach((entry) => {
        track.appendChild(createTestimonialCard(entry));
      });
      return true;
    } catch (error) {
      console.warn("Nao foi possivel carregar depoimentos via JSON.", error);
      return false;
    }
  };

  const loadedFromJson = await renderTestimonialsFromJson();

  let cards = Array.from(track.querySelectorAll(".testimonial-card"));
  if (cards.length === 0) return;

  let centerIndex = Math.min(1, cards.length - 1);

  if (!loadedFromJson) {
    cards.forEach((card) => {
      const btn = card.querySelector(".t-more");
      const snippet = card.querySelector(".t-snippet");
      if (!btn || !snippet) return;
      const full = btn.getAttribute("data-full") || "";
      const nextSnippet = buildSnippet(full);
      if (nextSnippet) snippet.textContent = nextSnippet;
    });
  }

  const getCardStep = () => {
    const first = cards[0];
    const second = cards[1];
    if (!first) return 0;
    if (!second) return first.getBoundingClientRect().width;

    const r1 = first.getBoundingClientRect();
    const r2 = second.getBoundingClientRect();
    return Math.abs(r2.left - r1.left);
  };

  const applyCenterClass = () => {
    cards.forEach((c, i) => c.classList.toggle("is-center", i === centerIndex));
  };

  const applyDesktopOrder = () => {
    const total = cards.length;
    cards.forEach((card, index) => {
      const relative = (index - centerIndex + total) % total;
      const isSpotlight = !window.matchMedia("(max-width: 768px)").matches;
      const order = isSpotlight
        ? (relative === total - 1 ? 0 : (relative === 0 ? 1 : relative + 1))
        : relative;
      card.style.order = String(order);
    });
  };

  const clearDesktopOrder = () => {
    cards.forEach((card) => {
      card.style.order = "";
    });
  };

  const render = () => {
    cards = Array.from(track.querySelectorAll(".testimonial-card"));
    if (cards.length === 0) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const isSpotlight = !isMobile;

    applyCenterClass();

    applyDesktopOrder();
    const currentCard = cards[centerIndex];
    if (currentCard) {
      const viewportWidth = viewport.clientWidth;
      const cardWidth = currentCard.getBoundingClientRect().width;
      const cardLeft = currentCard.offsetLeft;
      const targetOffset = isSpotlight
        ? cardLeft - ((viewportWidth - cardWidth) / 2)
        : cardLeft;
      track.style.transform = `translateX(${-Math.max(0, targetOffset)}px)`;
    }

    const dotElems = carousel.querySelectorAll(".carousel-controls .dot");
    dotElems.forEach((d, i) => d.classList.toggle("active", i === centerIndex));
  };

  const goNext = () => {
    if (centerIndex < cards.length - 1) centerIndex++;
    else centerIndex = 0;
    render();
  };

  const goPrev = () => {
    if (centerIndex > 0) centerIndex--;
    else centerIndex = cards.length - 1;
    render();
  };

  const allNext = carousel.querySelectorAll(".t-btn.next, .carousel-btn.next-mobile");
  const allPrev = carousel.querySelectorAll(".t-btn.prev, .carousel-btn.prev-mobile");

  allNext.forEach(b => b.addEventListener("click", goNext));
  allPrev.forEach(b => b.addEventListener("click", goPrev));

  const dots = carousel.querySelectorAll(".carousel-controls .dot");
  dots.forEach((d, i) => d.addEventListener("click", () => {
    centerIndex = i;
    render();
  }));

  let startX = 0;
  let startY = 0;
  let dx = 0;
  let dy = 0;
  let touching = false;

  const SWIPE_THRESHOLD = 50;
  const VERTICAL_TOLERANCE = 30;

  viewport.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    dx = 0; dy = 0;
    touching = true;
  }, { passive: true });

  viewport.addEventListener("touchmove", (e) => {
    if (!touching) return;
    const t = e.touches[0];
    dx = t.clientX - startX;
    dy = t.clientY - startY;

    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > VERTICAL_TOLERANCE) {
      touching = false;
    }
  }, { passive: true });

  viewport.addEventListener("touchend", () => {
    if (!touching) return;
    touching = false;

    if (Math.abs(dx) < SWIPE_THRESHOLD) return;

    if (dx < 0) goNext();
    else goPrev();
  }, { passive: true });

  window.addEventListener("resize", () => {
    clearTimeout(window.__tResize);
    window.__tResize = setTimeout(render, 120);
  });

  const modal = document.getElementById("modalDepoimento");
  const modalText = document.getElementById("modalDepoTexto");
  const modalAuthor = document.getElementById("modalDepoAuthor");
  const modalEnterprise = document.getElementById("modalDepoEnterprise");
  const modalStars = document.getElementById("modalDepoStars");
  let lastDepoTrigger = null;

  const openModal = (card, text) => {
    if (!modal) return;
    const formattedText = (text || "")
      .replace(/lineB/g, "\n\n")
      .replace(/\n{2,}/g, "<br><br>")
      .replace(/\n/g, "<br>");
    modalText.innerHTML = formattedText;

    if (card) {
      modalAuthor.innerHTML = card.querySelector(".t-author").innerHTML;
      modalEnterprise.innerHTML = card.querySelector(".t-author-enterprise").innerHTML;
      modalStars.innerHTML = card.querySelector(".t-stars").innerHTML;
    }

    openModalA11y(modal, lastDepoTrigger);
  };

  const closeModal = () => {
    closeModalA11y(modal);
  };

  track.addEventListener("click", (e) => {
    const btn = e.target.closest(".t-more");
    if (!btn) return;

    lastDepoTrigger = btn;
    const card = btn.closest(".testimonial-card");
    const full = btn.getAttribute("data-full");
    openModal(card, full);
  });

  if (modal) {
    modal.addEventListener("click", (e) => {
      const t = e.target;
      if (t && t.dataset && t.dataset.close === "true") closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });
  }

  render();
})();

document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".header-links .link-text");
  const sections = document.querySelectorAll("section, footer, main > section");

  const highlightMenu = () => {
    let scrollPos = window.scrollY || document.documentElement.scrollTop;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        links.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
          }
        });
      }
    });

    if ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight - 10) {
      links.forEach((link) => link.classList.remove("active"));
      const lastLink = document.querySelector('#link-text-contato');
      if (lastLink) lastLink.classList.add("active");
    }
  };

  window.addEventListener("scroll", highlightMenu);
  highlightMenu();
});


const formContato = document.getElementById("contatoForm");
const formStatus = document.getElementById("formStatus");
const btnSubmit = document.getElementById("btnSubmit");

if (formContato) {
  formContato.addEventListener("submit", async function (event) {
    event.preventDefault();

    const btnOriginalText = btnSubmit.textContent;
    btnSubmit.textContent = "Enviando...";
    btnSubmit.disabled = true;
    formStatus.textContent = "";

    const formData = new FormData(formContato);

    try {
      const response = await fetch(formContato.action, {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        formStatus.textContent = "Obrigado! Sua mensagem foi enviada com sucesso.";
        formStatus.className = "form-success";
        formContato.reset();
      } else {
        formStatus.textContent = "Oops! Houve um problema ao enviar, tente novamente.";
        formStatus.className = "form-error";
      }
    } catch (error) {
      formStatus.textContent = "Oops! Verifique sua conexão e tente novamente.";
      formStatus.className = "form-error";
    }

    btnSubmit.textContent = btnOriginalText;
    btnSubmit.disabled = false;
  });
}
