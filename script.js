/* Kavitha M — Portfolio interactions (vanilla JS, no dependencies) */
(() => {
  'use strict';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Footer year ---------- */
  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Navigation ---------- */
  const nav = $('#nav'), toggle = $('#navToggle'), links = $('#navLinks'), bar = $('#progress');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const closeMenu = () => { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); };
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  $$('a', links).forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* Active section highlighting */
  const sections = $$('main section[id]');
  const navMap = new Map($$('a', links).map(a => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        navMap.forEach(a => a.classList.remove('active'));
        const a = navMap.get(en.target.id); if (a) a.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- Scroll reveal ---------- */
  const reveals = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  }

  if (reduceMotion) return; // everything below is motion-only

  /* ---------- Shared pointer state ---------- */
  const ptr = { x: innerWidth / 2, y: innerHeight / 3, active: false };
  const spot = $('#spotlight');
  window.addEventListener('pointermove', e => {
    ptr.x = e.clientX; ptr.y = e.clientY; ptr.active = true;
    if (spot) { spot.style.setProperty('--mx', e.clientX + 'px'); spot.style.setProperty('--my', e.clientY + 'px'); }
  }, { passive: true });
  document.addEventListener('pointerleave', () => { ptr.active = false; });

  /* ---------- Custom cursor ---------- */
  if (finePointer) {
    const dot = $('#cursorDot'), ring = $('#cursorRing');
    document.body.classList.add('has-cursor');
    let rx = ptr.x, ry = ptr.y;
    const loop = () => {
      rx += (ptr.x - rx) * .18; ry += (ptr.y - ry) * .18;
      dot.style.transform  = `translate(${ptr.x}px,${ptr.y}px)`;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener('pointerover', e => ring.classList.toggle('hover', !!e.target.closest('a,button,.tilt')));
  }

  /* ---------- Hero portrait: tilt + parallax ---------- */
  const stage = $('#stage'), portrait = $('#portrait'), layers = $$('.layer', stage || document);
  if (stage && portrait && finePointer) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    const MAX = 9; // degrees: kept small so the face is never visibly distorted
    const render = () => {
      cx += (tx - cx) * .1; cy += (ty - cy) * .1;
      portrait.style.transform = `rotateY(${cx * MAX}deg) rotateX(${-cy * MAX}deg) translateZ(0)`;
      layers.forEach(l => {
        const d = parseFloat(l.dataset.depth || 0);
        l.style.transform = `translate3d(${cx * d}px,${cy * d}px,0)`;
      });
      if (Math.abs(tx - cx) > .001 || Math.abs(ty - cy) > .001) raf = requestAnimationFrame(render); else raf = null;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(render); };
    // follow the cursor across the whole hero so the portrait reacts naturally
    const hero = $('#home');
    hero.addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (innerWidth / 2)));
      ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (innerHeight / 2)));
      portrait.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100) + '%');
      portrait.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100) + '%');
      kick();
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { tx = ty = 0; kick(); });
  }

  /* ---------- Card tilt + glow ---------- */
  if (finePointer) {
    $$('.tilt').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(900px) rotateY(${(px - .5) * 7}deg) rotateX(${(.5 - py) * 7}deg) translateY(-4px)`;
        card.style.setProperty('--gx', px * 100 + '%'); card.style.setProperty('--gy', py * 100 + '%');
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });

    /* Magnetic buttons */
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .25}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Interactive particle background ---------- */
  const cv = $('#bg-canvas'); if (!cv) return;
  const ctx = cv.getContext('2d');
  let W, H, dpr, parts = [], running = true;
  const COLORS = ['79,140,255', '139,92,246', '34,211,238'];

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(90, Math.max(28, (W * H) / 18000)));
    parts = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
      r: Math.random() * 1.6 + .6, c: COLORS[(Math.random() * 3) | 0], a: Math.random() * .5 + .25
    }));
  };
  resize();
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) draw(); });

  const LINK = 120, PUSH = 140;
  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (ptr.active) { // gentle repulsion from the cursor
        const dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx * dx + dy * dy;
        if (d2 < PUSH * PUSH && d2 > 1) { const f = (1 - Math.sqrt(d2) / PUSH) * .6, d = Math.sqrt(d2); p.vx += dx / d * f * .1; p.vy += dy / d * f * .1; }
      }
      p.vx *= .99; p.vy *= .99;
      p.x += p.vx + Math.sin((p.y + performance.now() * .02) * .01) * .05; p.y += p.vy;
      if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832);
      ctx.fillStyle = `rgba(${p.c},${p.a})`; ctx.shadowColor = `rgba(${p.c},.8)`; ctx.shadowBlur = 8; ctx.fill();
      ctx.shadowBlur = 0;
      for (let j = i + 1; j < parts.length; j++) {
        const q = parts[j], dx = p.x - q.x, dy = p.y - q.y, d2 = dx * dx + dy * dy;
        if (d2 < LINK * LINK) {
          ctx.strokeStyle = `rgba(${p.c},${(1 - Math.sqrt(d2) / LINK) * .16})`;
          ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

async function updateLeetCodeStats() {
    const username = "kavitha_22";
    const query = `
        query {
            matchedUser(username: "${username}") {
                submitStats {
                    acSubmissionNum {
                        difficulty
                        count
                    }
                }
            }
        }
    `;

    try {
        const params = new URLSearchParams({ query });

        const response = await fetch(
            `https://proxy.cors.dev/https://leetcode.com/graphql?${params}`
        );

        if (!response.ok) {
            throw new Error("Unable to fetch LeetCode stats");
        }

        const result = await response.json();

        const stats =
            result.data.matchedUser.submitStats.acSubmissionNum;

        const total = stats.find(item => item.difficulty === "All");

        if (total) {
            document.getElementById("leetcode-total").textContent =
                total.count;
        }

    } catch (error) {
        console.error("LeetCode stats update failed:", error);
    }
}

updateLeetCodeStats();
