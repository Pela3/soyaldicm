
// Menú mobile
const root = document.documentElement;
const burger = document.querySelector('.burger');
const menu = document.getElementById('menu');

function setMenu(open) {
  root.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  menu.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
}

burger.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && root.classList.contains('menu-open')) setMenu(false);
});

// Revelado al entrar en pantalla, escalonado por grupo
const reveals = document.querySelectorAll('.reveal');
reveals.forEach((el) => {
  const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
  el.style.setProperty('--d', `${Math.min(siblings.indexOf(el), 6) * 80}ms`);
});

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('in'));
}

// Carruseles del portfolio: flechas + barra de progreso
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ARROW_PREV = '<svg viewBox="0 0 16 16"><path d="M10 3L5 8l5 5"/></svg>';
const ARROW_NEXT = '<svg viewBox="0 0 16 16"><path d="M6 3l5 5-5 5"/></svg>';

document.querySelectorAll('.case-gallery').forEach((gallery) => {
  const nav = document.createElement('div');
  nav.className = 'gallery-nav';
  nav.innerHTML = `
    <div class="gallery-progress" aria-hidden="true"><span></span></div>
    <button class="gallery-btn" aria-label="Ver anteriores">${ARROW_PREV}</button>
    <button class="gallery-btn" aria-label="Ver siguientes">${ARROW_NEXT}</button>`;
  gallery.after(nav);

  const [prev, next] = nav.querySelectorAll('.gallery-btn');
  const thumb = nav.querySelector('.gallery-progress span');

  const step = () => {
    const shot = gallery.querySelector('.shot');
    const gap = parseFloat(getComputedStyle(gallery).columnGap) || 0;
    const width = shot.offsetWidth + gap;
    return Math.max(width, Math.floor(gallery.clientWidth / width) * width);
  };
  const go = (dir) => gallery.scrollBy({ left: dir * step(), behavior: reduceMotion ? 'auto' : 'smooth' });
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));

  const update = () => {
    const max = gallery.scrollWidth - gallery.clientWidth;
    const x = gallery.scrollLeft;
    nav.hidden = max <= 4;
    prev.disabled = x <= 4;
    next.disabled = x >= max - 4;
    gallery.classList.toggle('at-end', x >= max - 4);
    const ratio = gallery.clientWidth / gallery.scrollWidth;
    thumb.style.width = `${ratio * 100}%`;
    thumb.style.transform = `translateX(${max > 0 ? (x / max) * (1 / ratio - 1) * 100 : 0}%)`;
  };
  gallery.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(update).observe(gallery);
  update();
});

// Visor de piezas del portfolio: recorre las imágenes del mismo caso
const lightbox = document.querySelector('.lightbox');
const lbImg = lightbox.querySelector('img');
const lbVideo = lightbox.querySelector('video');
const lbCaption = lightbox.querySelector('figcaption');
let group = [];
let current = 0;

function show(i) {
  current = (i + group.length) % group.length;
  const shot = group[current];
  const img = shot.querySelector('img');
  const video = shot.dataset.video;
  lightbox.classList.toggle('is-video', Boolean(video));
  lbVideo.pause();
  if (video) {
    lbVideo.poster = img.currentSrc || img.src;
    lbVideo.src = video;
    lbVideo.play().catch(() => {});
  } else {
    lbVideo.removeAttribute('src');
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
  }
  lbCaption.textContent = shot.dataset.caption;
}

lightbox.addEventListener('close', () => {
  lbVideo.pause();
  lbVideo.removeAttribute('src');
  lbVideo.load();
});

// Reels: vista previa en silencio al pasar el mouse (solo escritorio)
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.shot-video').forEach((shot) => {
    let preview;
    shot.addEventListener('mouseenter', () => {
      if (!preview) {
        preview = document.createElement('video');
        preview.src = shot.dataset.video;
        preview.muted = true;
        preview.loop = true;
        preview.playsInline = true;
        preview.addEventListener('playing', () => preview.classList.add('playing'));
        shot.insertBefore(preview, shot.querySelector('.shot-play'));
      }
      preview.play().catch(() => {});
    });
    shot.addEventListener('mouseleave', () => {
      if (!preview) return;
      preview.pause();
      preview.classList.remove('playing');
    });
  });
}

document.querySelectorAll('.case-gallery').forEach((gallery) => {
  const shots = [...gallery.querySelectorAll('.shot')];
  shots.forEach((shot, i) => {
    shot.addEventListener('click', () => {
      group = shots;
      show(i);
      lightbox.showModal();
    });
  });
});

lightbox.querySelector('.lb-close').addEventListener('click', () => lightbox.close());
lightbox.querySelector('.lb-prev').addEventListener('click', () => show(current - 1));
lightbox.querySelector('.lb-next').addEventListener('click', () => show(current + 1));
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) lightbox.close();
});
lightbox.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') show(current - 1);
  if (e.key === 'ArrowRight') show(current + 1);
});

document.getElementById('year').textContent = new Date().getFullYear();
