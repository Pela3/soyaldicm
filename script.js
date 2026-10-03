
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

// Visor de piezas del portfolio: recorre las imágenes del mismo caso
const lightbox = document.querySelector('.lightbox');
const lbImg = lightbox.querySelector('img');
const lbCaption = lightbox.querySelector('figcaption');
let group = [];
let current = 0;

function show(i) {
  current = (i + group.length) % group.length;
  const shot = group[current];
  const img = shot.querySelector('img');
  lbImg.src = img.currentSrc || img.src;
  lbImg.alt = img.alt;
  lbCaption.textContent = shot.dataset.caption;
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
