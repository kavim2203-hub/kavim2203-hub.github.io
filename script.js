// ---------- Footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Build the ER diagram ----------
const svgNS = "http://www.w3.org/2000/svg";
const svg = document.getElementById('erd');

const centerNode = { id: 'developer', label: 'DEVELOPER', x: 600, y: 300, w: 190, h: 64, center: true };

const satellites = [
  { id: 'languages', label: 'languages',  angle: 200 },
  { id: 'core',      label: 'core_cs',    angle: 150 },
  { id: 'databases', label: 'databases',  angle: 100 },
  { id: 'bigdata',   label: 'big_data',   angle: 40  },
  { id: 'tools',     label: 'tools',      angle: -20 },
  { id: 'libraries', label: 'libraries',  angle: -70 },
];

const RADIUS = 235;
const nodeW = 168, nodeH = 56;

function polar(cx, cy, r, angleDeg){
  const a = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) * 0.72 }; // squashed ellipse for wide layout
}

const nodes = [centerNode];
satellites.forEach(s => {
  const pos = polar(centerNode.x, centerNode.y, RADIUS, s.angle);
  nodes.push({ id: s.id, label: s.label, x: pos.x, y: pos.y, w: nodeW, h: nodeH });
});

function el(tag, attrs){
  const e = document.createElementNS(svgNS, tag);
  for(const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}

// edges first (so nodes sit on top)
nodes.slice(1).forEach(n => {
  const path = el('path', {
    class: 'erd-edge',
    d: `M ${centerNode.x} ${centerNode.y} C ${(centerNode.x+n.x)/2} ${centerNode.y}, ${(centerNode.x+n.x)/2} ${n.y}, ${n.x} ${n.y}`
  });
  svg.appendChild(path);
});

// nodes
nodes.forEach(n => {
  const g = el('g', { class: `erd-node${n.center ? ' center' : ''}`, 'data-node': n.id });
  g.appendChild(el('rect', {
    x: n.x - n.w/2, y: n.y - n.h/2, width: n.w, height: n.h, rx: 8
  }));
  const text = el('text', {
    x: n.x, y: n.y + 5, 'text-anchor': 'middle', class: 't-title'
  });
  text.innerHTML = n.center
    ? `<tspan class="hl">▣</tspan> ${n.label}`
    : n.label;
  g.appendChild(text);
  svg.appendChild(g);

  if(!n.center){
    g.addEventListener('mouseenter', () => setActive(n.id));
    g.addEventListener('mouseleave', () => setActive(null));
    g.addEventListener('click', () => {
      const table = document.querySelector(`.db-table[data-node="${n.id}"]`);
      if(table) table.scrollIntoView({ behavior:'smooth', block:'center' });
      flashTable(n.id);
    });
  }
});

function setActive(id){
  document.querySelectorAll('.erd-node').forEach(g => {
    g.classList.toggle('active', g.dataset.node === id);
  });
  document.querySelectorAll('.db-table').forEach(t => {
    t.classList.toggle('active', t.dataset.node === id);
  });
}

function flashTable(id){
  const table = document.querySelector(`.db-table[data-node="${id}"]`);
  if(!table) return;
  table.classList.add('active');
  setTimeout(() => table.classList.remove('active'), 1400);
}

// hovering a skill table also lights up its ERD node
document.querySelectorAll('.db-table').forEach(t => {
  t.addEventListener('mouseenter', () => setActive(t.dataset.node));
  t.addEventListener('mouseleave', () => setActive(null));
});

// ---------- Scroll reveal ----------
const revealSelectors = ['.about-grid', '.db-table', '.project-row', '.edu-row', '.chip', '.insert-block'];
const revealEls = document.querySelectorAll(revealSelectors.join(','));
revealEls.forEach(e => e.classList.add('reveal'));

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(e => io.observe(e));

// ---------- Nav active link on scroll (subtle) ----------
const sections = document.querySelectorAll('main > section[id], .hero');
