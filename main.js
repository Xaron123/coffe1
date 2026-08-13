/* ============================================================
   Любовь и Кофе — animation choreography
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ---------- helpers ---------- */
const q  = (s, r=document) => r.querySelector(s);
const qq = (s, r=document) => Array.from(r.querySelectorAll(s));

/* Split words into <span class="w"><span class="wi">...</span></span> */
function splitWords(el) {
  const text = el.textContent.trim();
  el.textContent = '';
  const words = text.split(/(\s+)/);
  const spans = [];
  words.forEach(w => {
    if (/^\s+$/.test(w)) { el.appendChild(document.createTextNode(w)); return; }
    const outer = document.createElement('span');
    outer.className = 'w';
    outer.style.display = 'inline-block';
    outer.style.overflow = 'hidden';
    outer.style.verticalAlign = 'top';
    const inner = document.createElement('span');
    inner.className = 'wi';
    inner.style.display = 'inline-block';
    inner.textContent = w;
    outer.appendChild(inner);
    el.appendChild(outer);
    spans.push(inner);
  });
  return spans;
}

/* ---------- preloader ---------- */
function runPreloader() {
  const pl = q('#preloader');
  if (!pl) return;
  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    pl.style.display = 'none';
  };

  const tl = gsap.timeline({ onComplete: dismiss });
  tl.to('.preloader-mark', { opacity: 1, duration: .5, ease: 'power2.out' })
    .to('.preloader-name', { opacity: 1, y: 0, duration: .7, ease: 'power3.out' }, '-=.2')
    .to('.preloader-caption', { opacity: 1, duration: .5 }, '-=.4')
    .to('.preloader-bar span', { scaleX: 1, duration: 1.4, ease: 'power2.inOut' }, '-=.5')
    .to('.preloader-inner', { y: -20, opacity: 0, duration: .5, ease: 'power2.in' }, '+=.15')
    .to(pl, { yPercent: -100, duration: .9, ease: 'power4.inOut' });

  // Safety net: if the tab was hidden and GSAP's ticker was throttled,
  // this guarantees the preloader still disappears.
  setTimeout(dismiss, 5000);
}

/* ---------- custom cursor ---------- */
function initCursor() {
  const cur  = q('#cursor');
  const fol  = q('#cursor-follower');
  if (!cur) return;
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let fx = mx, fy = my;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  gsap.ticker.add(() => {
    cur.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    fx += (mx - fx) * 0.15;
    fy += (my - fy) * 0.15;
    fol.style.transform = `translate(${fx}px, ${fy}px) translate(-50%,-50%)`;
  });

  qq('[data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ---------- header scroll state ---------- */
function initHeader() {
  const h = q('#header');
  ScrollTrigger.create({
    start: 60, end: 99999,
    onUpdate: self => h.classList.toggle('scrolled', self.progress > 0 || self.scroll() > 60),
    onToggle: self => h.classList.toggle('scrolled', self.isActive || self.scroll() > 60)
  });
  // simpler: on scroll listener
  window.addEventListener('scroll', () => {
    h.classList.toggle('scrolled', window.scrollY > 40);
  });
}

/* ---------- hero animation ---------- */
function initHero() {
  qq('[data-split]').forEach(el => { el.__spans = splitWords(el); });

  const heroSpans = qq('.hero-title [data-split]').flatMap(el => el.__spans);

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: .1 });

  tl.from(heroSpans, {
      yPercent: 120, duration: 1.1, stagger: .08
    })
    .from('.pill', { y: 20, opacity: 0, duration: .8 }, '-=.9')
    .from('.hero-lede', { y: 20, opacity: 0, duration: .8 }, '-=.7')
    .from('.hero-cta > *', { y: 20, opacity: 0, duration: .7, stagger: .08 }, '-=.5')
    .from('.meta-item', { y: 20, opacity: 0, duration: .7, stagger: .1 }, '-=.6')
    .from('.hv-main', { y: 60, opacity: 0, duration: 1.2, ease: 'power3.out' }, '-=1.2')
    .from('.hv-small', { y: 40, opacity: 0, scale: .8, duration: 1, stagger: .15 }, '-=.9')
    .from('.hv-badge', { scale: 0, opacity: 0, duration: 1, ease: 'back.out(1.6)' }, '-=.8')
    .from('.hero-scroll', { opacity: 0, y: 10, duration: .5 }, '-=.5');

  // slight parallax on hero visual on mouse move
  const hv = q('.hero-visual');
  if (hv) {
    const main = q('.hv-main'), a = q('.hv-a'), b = q('.hv-b'), badge = q('.hv-badge');
    hv.addEventListener('mousemove', (e) => {
      const r = hv.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top)  / r.height - .5;
      gsap.to(main,  { x: x*-14, y: y*-14, duration: .6, ease: 'power2.out' });
      gsap.to(a,     { x: x*22,  y: y*22,  duration: .8 });
      gsap.to(b,     { x: x*18,  y: y*-18, duration: .8 });
      gsap.to(badge, { x: x*10,  y: y*10,  duration: .8 });
    });
    hv.addEventListener('mouseleave', () => {
      gsap.to([main,a,b,badge], { x:0, y:0, duration: .8, ease: 'power2.out' });
    });
  }

  // hero blobs parallax on scroll
  gsap.to('.hero-blob.b1', {
    yPercent: 40, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  gsap.to('.hero-blob.b2', {
    yPercent: -30, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
}

/* ---------- manifesto pinned reveal ---------- */
function initManifesto() {
  const section = q('#manifesto');
  const spans = qq('.manifesto-text > span');
  if (!section || !spans.length) return;

  gsap.to(spans, {
    opacity: 1,
    stagger: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: '+=200%',
      scrub: true,
      pin: true,
      pinSpacing: true
    }
  });
}

/* ---------- section-title splits (in-view) ---------- */
function initSectionTitles() {
  qq('.section-title, .craft-title, .bakery-title, .contact-title').forEach(t => {
    const splits = qq('[data-split]', t);
    if (!splits.length) return;
    const spans = splits.flatMap(s => s.__spans || splitWords(s));
    splits.forEach(s => s.__spans = s.__spans || spans);
    gsap.from(spans, {
      yPercent: 120,
      duration: 1,
      ease: 'power4.out',
      stagger: .08,
      scrollTrigger: { trigger: t, start: 'top 82%' }
    });
  });
}

/* ---------- menu cards enter ---------- */
function initMenu() {
  const cards = qq('.menu-card');
  gsap.from(cards, {
    y: 60, opacity: 0,
    duration: .9, ease: 'power3.out', stagger: .1,
    scrollTrigger: { trigger: '.menu-strip', start: 'top 75%' }
  });
}

/* ---------- craft list reveal ---------- */
function initCraft() {
  const items = qq('.craft-list li');
  gsap.to(items, {
    opacity: 1, y: 0,
    duration: .9, ease: 'power3.out', stagger: .14,
    scrollTrigger: { trigger: '.craft-list', start: 'top 78%' }
  });
}

/* ---------- signature carousel ---------- */
function initSignature() {
  const data = [
    {
      name: 'Вишнёвый матча-тоник',
      img:  'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=900&q=80&auto=format&fit=crop',
      desc: 'Освежающий лимонад на биттер-тонике с вишнёвым джемом и цветочной голубой матчей. Подаём с веточкой мяты и колотым льдом.',
      list: ['биттер-тоник · 180 мл', 'вишнёвый джем · 2 ч.л.', 'голубая матча · 1 ч.л.', 'лёд, мята, долька лайма'],
      price: '340 ₽'
    },
    {
      name: 'Какао «черничный йогурт»',
      img:  'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=900&q=80&auto=format&fit=crop',
      desc: 'Нежный айс-какао: сладость кокосового молока, свежесть черники и горчинка натурального какао. Пьётся, как десерт.',
      list: ['кокосовое молоко · 200 мл', 'натуральное какао · 20 г', 'черничный сироп · 30 мл', 'лёд, ванильная пудра'],
      price: '290 ₽'
    },
    {
      name: 'Раф фисташковый',
      img:  'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=900&q=80&auto=format&fit=crop',
      desc: 'Тёплый раф на сливках с натуральной фисташковой пастой и щепоткой морской соли. Ореховый, плотный, любимый.',
      list: ['эспрессо · 30 мл', 'сливки 33% · 150 мл', 'фисташковая паста · 20 г', 'морская соль · щепотка'],
      price: '320 ₽'
    }
  ];

  const items = qq('.sig-item');
  const img   = q('#sig-img');
  const idx   = q('#sig-idx');
  const box   = q('#sig-recipe');

  function render(i) {
    const d = data[i];
    gsap.to(img,   { opacity: 0, scale: .96, duration: .3, onComplete: () => {
      img.src = d.img;
      gsap.to(img, { opacity: 1, scale: 1, duration: .6, ease: 'power2.out' });
    }});
    idx.textContent = String(i + 1).padStart(2, '0');
    box.innerHTML = `
      <div class="sig-name">${d.name}</div>
      <div class="sig-desc">${d.desc}</div>
      <ul class="sig-list">${d.list.map(l => `<li>${l}</li>`).join('')}</ul>
      <div class="sig-price">${d.price}</div>
    `;
    gsap.from(box.children, { y: 14, opacity: 0, duration: .6, stagger: .08, ease: 'power3.out' });
  }

  items.forEach(btn => {
    btn.addEventListener('click', () => {
      items.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render(parseInt(btn.dataset.idx, 10));
    });
  });

  // hover preview
  items.forEach(btn => btn.setAttribute('data-cursor', 'hover'));
}

/* ---------- gallery parallax ---------- */
function initGallery() {
  qq('.gallery .g').forEach(f => {
    const speed = parseFloat(f.dataset.speed || 1);
    gsap.to(f.querySelector('img'), {
      yPercent: (1 - speed) * 30,
      ease: 'none',
      scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  gsap.from('.gallery .g', {
    y: 50, opacity: 0,
    duration: 1, ease: 'power3.out', stagger: .08,
    scrollTrigger: { trigger: '.gallery', start: 'top 78%' }
  });
}

/* ---------- footer mega ---------- */
function initFooter() {
  gsap.from('.footer-mega span, .footer-mega em', {
    yPercent: 100,
    duration: 1.1,
    stagger: .1,
    ease: 'power4.out',
    scrollTrigger: { trigger: '.footer-mega', start: 'top 90%' }
  });
}

/* ---------- boot ---------- */
function boot() {
  gsap.set('.preloader-name', { y: 20 });
  gsap.set('.preloader-caption', { y: 10 });

  // Init content immediately — preloader is decoration, not a gate
  initCursor();
  initHeader();
  initHero();
  initManifesto();
  initSectionTitles();
  initMenu();
  initCraft();
  initSignature();
  initGallery();
  initFooter();
  ScrollTrigger.refresh();

  runPreloader();
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(boot, 0);
} else {
  window.addEventListener('DOMContentLoaded', boot, { once: true });
  window.addEventListener('load', boot, { once: true });
}
