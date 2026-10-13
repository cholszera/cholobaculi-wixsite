/** Navigation, learning resources, and accessible activity previews. */
document.addEventListener('DOMContentLoaded', () => {
  const sections = [...document.querySelectorAll('.view-section')];
  const links = [...document.querySelectorAll('[data-target]')];
  const header = document.querySelector('.site-header');
  const drawer = document.getElementById('mobileNavDrawer');
  const menuButton = document.getElementById('mobileMenuBtn');
  const backdrop = document.getElementById('mobileBackdrop');
  const lightbox = document.getElementById('imageLightboxModal');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pageSurfaces = [...document.querySelectorAll('main, .site-header, .site-footer, .wix-watermark-bar, .skip-link')];
  let activeDialog = null;
  let returnFocus = null;
  let previousOverflow = '';

  function closeMenus() {
    document.querySelectorAll('.nav-item.menu-open').forEach(item => {
      item.classList.remove('menu-open');
      item.querySelector('.nav-menu-toggle').setAttribute('aria-expanded', 'false');
    });
  }

  function openDialog(dialog, focusTarget) {
    if (activeDialog) closeDialog();
    returnFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    activeDialog = dialog;
    dialog.inert = false;
    dialog.setAttribute('aria-hidden', 'false');
    pageSurfaces.forEach(surface => { surface.inert = true; });
    document.body.style.overflow = 'hidden';
    focusTarget.focus();
  }

  function closeDialog() {
    if (!activeDialog) return;
    activeDialog.classList.remove('active', 'open');
    activeDialog.inert = true;
    activeDialog.setAttribute('aria-hidden', 'true');
    activeDialog = null;
    backdrop.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    pageSurfaces.forEach(surface => { surface.inert = false; });
    document.body.style.overflow = previousOverflow;
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  }

  function scrollToElement(element) {
    // Open any collapsed lesson detail that contains an anchor target.
    let parent = element.parentElement;
    while (parent) {
      if (parent.tagName === 'DETAILS') parent.open = true;
      parent = parent.parentElement;
    }
    element.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  }

  function switchView(id, { updateHistory = true, focus = false, scrollTo = null } = {}) {
    const target = document.getElementById(id);
    const section = target?.classList.contains('view-section') ? target : target?.closest('.view-section');
    if (!section) return false;
    closeDialog();
    closeMenus();
    sections.forEach(view => {
      const selected = view === section;
      view.hidden = !selected;
      view.classList.toggle('active', selected);
    });
    links.forEach(link => {
      const linkId = link.getAttribute('data-target');
      const exact = linkId === section.id;
      const termParent = link.matches('.main-nav > .nav-item > .nav-link') && ['midterm', 'finals'].some(term => linkId === `${term}-lessons` && section.id.startsWith(`${term}-`));
      link.classList.toggle('active', exact || termParent);
      if (exact) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    if (updateHistory && window.location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
    const heading = section.querySelector('h1, h2');
    if (focus && heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
    const destination = scrollTo ? document.getElementById(scrollTo) : target === section ? null : target;
    if (destination) scrollToElement(destination);
    else window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    // Avoid narration continuing silently in a different view.
    window.aiNarrator?.stopAll();
    section.querySelectorAll('video').forEach(video => { video.preload = 'metadata'; });
    sections.filter(view => view !== section).forEach(view => view.querySelectorAll('video').forEach(video => video.pause()));
    return true;
  }

  function readHash() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { id = ''; }
    if (!switchView(id || 'home', { updateHistory: false })) switchView('home', { updateHistory: false });
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('[data-target]');
    if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) {
      event.preventDefault();
      switchView(link.dataset.target, { focus: true, scrollTo: link.dataset.scrollTo });
      return;
    }
    const anchor = event.target.closest('a[href^="#"]');
    if (anchor && !anchor.hasAttribute('data-target')) {
      const id = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      if (target.closest('.view-section')) switchView(id, { focus: false });
      else { target.focus({ preventScroll: true }); scrollToElement(target); }
    }
  });
  window.addEventListener('popstate', readHash);
  window.addEventListener('hashchange', readHash);
  window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 30), { passive: true });

  document.querySelectorAll('.nav-menu-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.nav-item');
      const open = !item.classList.contains('menu-open');
      closeMenus();
      item.classList.toggle('menu-open', open);
      button.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', event => { if (!event.target.closest('.nav-item')) closeMenus(); });
  document.addEventListener('focusin', event => { if (!event.target.closest('.nav-item.menu-open')) closeMenus(); });
  menuButton.addEventListener('click', () => {
    closeMenus();
    drawer.classList.add('open');
    backdrop.hidden = false;
    menuButton.setAttribute('aria-expanded', 'true');
    openDialog(drawer, document.getElementById('closeMobileNav'));
  });
  document.getElementById('closeMobileNav').addEventListener('click', closeDialog);
  backdrop.addEventListener('click', closeDialog);
  window.matchMedia('(min-width: 901px)').addEventListener('change', event => { if (event.matches && activeDialog === drawer) closeDialog(); });

  // Compact shortcuts and optional detail make the long curriculum easier to browse.
  const modules = [...document.querySelectorAll('#midterm-lessons .lesson-module-grand-card')];
  const labels = ['Orientation', 'Science & ethics', 'Digital change', 'Digital divide', 'Industry 4.0'];
  const index = document.createElement('nav');
  index.className = 'module-index';
  index.setAttribute('aria-label', 'Midterm module index');
  const indexLabel = document.createElement('span');
  indexLabel.textContent = 'Jump to a module';
  const indexLinks = document.createElement('div');
  indexLinks.className = 'module-index-links';
  modules.forEach((module, i) => {
    module.id = `midterm-module-${i + 1}`;
    const link = document.createElement('a');
    link.href = `#${module.id}`;
    const number = document.createElement('span');
    number.textContent = String(i + 1).padStart(2, '0');
    link.append(number, document.createTextNode(labels[i]));
    indexLinks.appendChild(link);
    const breakdown = module.querySelector('.lesson-breakdown-grid');
    if (breakdown) {
      const details = document.createElement('details');
      details.className = 'lesson-details';
      const summary = document.createElement('summary');
      summary.textContent = 'Explore concepts & supporting notes';
      breakdown.before(details);
      details.append(summary, breakdown);
    }
  });
  index.append(indexLabel, indexLinks);
  modules[0]?.parentElement.before(index);

  // Filter existing reference categories without duplicating their content.
  const resources = [...document.querySelectorAll('#references .references-wide-card')];
  resources.forEach(card => {
    if (!card.dataset.resourceType) {
      const badge = card.querySelector('.ref-badge');
      card.dataset.resourceType = badge?.classList.contains('pdf') ? 'pdf' : badge?.classList.contains('video') ? 'video' : 'reading';
    }
  });
  const toolbar = document.createElement('div');
  toolbar.className = 'resource-toolbar';
  toolbar.setAttribute('role', 'group');
  toolbar.setAttribute('aria-label', 'Filter references');
  const count = document.createElement('span');
  count.className = 'resource-result-count';
  count.setAttribute('role', 'status');
  const filters = [['all', 'All resources'], ['pdf', 'PDFs'], ['reading', 'Reading'], ['video', 'Videos']];
  filters.forEach(([type, label]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'resource-filter';
    button.textContent = label;
    button.setAttribute('aria-pressed', String(type === 'all'));
    button.addEventListener('click', () => {
      toolbar.querySelectorAll('button').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
      resources.forEach(card => { card.hidden = type !== 'all' && card.dataset.resourceType !== type; });
      updateResourceCount();
    });
    toolbar.appendChild(button);
  });
  function updateResourceCount() {
    count.textContent = `${resources.filter(card => !card.hidden).reduce((total, card) => total + card.querySelectorAll('.ref-box-modern').length, 0)} resources`;
  }
  toolbar.appendChild(count);
  resources[0]?.before(toolbar);
  updateResourceCount();

  // Finals selections are local previews, with validation and an explicit remove action.
  document.querySelectorAll('.local-image-picker input').forEach(input => {
    const field = input.closest('.preview-field');
    const picker = input.closest('.local-image-picker');
    const copy = picker.querySelector('.picker-copy');
    const status = field.querySelector('[role="status"]');
    const remove = field.querySelector('.preview-remove');
    let objectUrl = null;
    let generation = 0;
    function reset() {
      generation += 1;
      picker.querySelector('img')?.remove();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = null;
      input.value = '';
      copy.hidden = false;
      remove.hidden = true;
      status.textContent = 'Awaiting documentation';
    }
    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;
      reset();
      if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type) || file.size > 10 * 1024 * 1024) {
        status.textContent = 'Choose a supported image up to 10 MB.';
        return;
      }
      const request = generation;
      const image = new Image();
      objectUrl = URL.createObjectURL(file);
      image.onload = () => {
        if (request !== generation) return;
        image.alt = `${field.querySelector('.preview-label').textContent}: ${file.name}`;
        picker.appendChild(image);
        copy.hidden = true;
        remove.hidden = false;
        status.textContent = `${file.name} Â· Preview only`;
      };
      image.onerror = () => {
        if (request !== generation) return;
        reset();
        status.textContent = 'This image could not be opened. Choose another file.';
      };
      image.src = objectUrl;
    });
    remove.addEventListener('click', () => { reset(); input.focus(); });
    window.addEventListener('pagehide', () => { if (objectUrl) URL.revokeObjectURL(objectUrl); });
  });

  const gallery = [...document.querySelectorAll('[data-lightbox-src]')];
  const galleryImage = document.getElementById('lightboxImg');
  const caption = document.getElementById('lightboxCaption');
  const galleryCount = document.getElementById('lightboxCounter');
  let galleryIndex = 0;
  function renderGallery() {
    const item = gallery[galleryIndex];
    galleryImage.src = item.dataset.lightboxSrc;
    galleryImage.alt = item.dataset.lightboxCaption || item.querySelector('img')?.alt || 'Activity documentation';
    caption.textContent = galleryImage.alt;
    galleryCount.textContent = `${galleryIndex + 1} / ${gallery.length}`;
  }
  function moveGallery(direction) {
    galleryIndex = (galleryIndex + direction + gallery.length) % gallery.length;
    renderGallery();
  }
  gallery.forEach((item, i) => {
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `Expand ${item.querySelector('img')?.alt || 'activity image'}`);
    function open() {
      galleryIndex = i;
      renderGallery();
      lightbox.classList.add('active');
      openDialog(lightbox, document.getElementById('lightboxCloseBtn'));
    }
    item.addEventListener('click', open);
    item.addEventListener('keydown', event => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); open(); } });
  });
  document.getElementById('lightboxCloseBtn').addEventListener('click', closeDialog);
  document.querySelector('.img-lightbox-backdrop').addEventListener('click', closeDialog);
  document.getElementById('lightboxPrev').addEventListener('click', () => moveGallery(-1));
  document.getElementById('lightboxNext').addEventListener('click', () => moveGallery(1));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (activeDialog) closeDialog();
      else {
        const expanded = document.querySelector('.nav-item.menu-open .nav-menu-toggle');
        closeMenus();
        expanded?.focus();
      }
    }
    if (activeDialog === lightbox && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      moveGallery(event.key === 'ArrowLeft' ? -1 : 1);
    }
    if (activeDialog && event.key === 'Tab') {
      const focusable = [...activeDialog.querySelectorAll('button, a[href], input, select, [tabindex="0"]')].filter(element => !element.disabled && !element.hidden && element.getClientRects().length);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  const reveals = document.querySelectorAll('.scroll-reveal');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .08 });
    reveals.forEach(element => observer.observe(element));
  } else reveals.forEach(element => element.classList.add('is-visible'));
  readHash();
});



