// نوار پیشرفت و سایه‌ی نوار بالا
const progress = document.getElementById('progress');
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
  const el = document.documentElement;
  const max = el.scrollHeight - el.clientHeight;
  progress.style.width = (max > 0 ? (el.scrollTop / max) * 100 : 0) + '%';
  nav.classList.toggle('scrolled', el.scrollTop > 40);
}, { passive: true });

// ظاهر شدن تدریجی المان‌ها هنگام اسکرول
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// شمارش انیمیشنی اعداد در هیرو (اعداد فارسی)
const faDigits = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
const statIO = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.count;
    const dur = 1200;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = faDigits(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    statIO.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach((el) => statIO.observe(el));

// افکت سه‌بعدی برگشت کارت‌ها با حرکت موس (tilt)
if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `rotateY(${x * -10}deg) rotateX(${y * 10}deg) translateZ(10px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// موکاپ گوشی که با حرکت موس می‌چرخد (parallax سه‌بعدی)
const phone = document.getElementById('phone');
const hero = document.querySelector('.hero');
if (phone && hero && window.matchMedia('(hover: hover)').matches) {
  let tx = 0, ty = 0, cx = 0, cy = 0;
  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 18;
    ty = ((e.clientY - r.top) / r.height - 0.5) * -14;
  });
  hero.addEventListener('mouseleave', () => { tx = 0; ty = 0; });
  (function animatePhone() {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    phone.style.transform = `rotateY(${cx}deg) rotateX(${cy}deg)`;
    requestAnimationFrame(animatePhone);
  })();
}

// صحنه‌ی سه‌بعدی پارتیکل‌ها در بخش هیرو (Three.js)
(function init3d() {
  if (!window.THREE) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('bg3d');
  const heroEl = document.querySelector('.hero');
  if (!canvas || !heroEl) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 14;

  // پارتیکل‌های نیلی شناور
  const COUNT = 260;
  const positions = new Float32Array(COUNT * 3);
  const speeds = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 36;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    speeds[i] = 0.15 + Math.random() * 0.5;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // تکسچر دایره‌ی نرم برای پارتیکل‌ها
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(57, 73, 171, 0.9)');
  g.addColorStop(0.4, 'rgba(121, 134, 203, 0.45)');
  g.addColorStop(1, 'rgba(121, 134, 203, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const sprite = new THREE.CanvasTexture(c);

  const mat = new THREE.PointsMaterial({
    size: 0.55,
    map: sprite,
    transparent: true,
    depthWrite: false,
    opacity: 0.85
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // دو حلقه‌ی سه‌بعدی نازک (تور) برای عمق بیشتر
  const torusGeo = new THREE.TorusGeometry(6, 0.06, 12, 120);
  const torusMat = new THREE.MeshBasicMaterial({ color: 0x7986cb, transparent: true, opacity: 0.18 });
  const torus1 = new THREE.Mesh(torusGeo, torusMat);
  torus1.rotation.x = Math.PI / 2.4;
  torus1.position.set(-6, 2, -4);
  scene.add(torus1);

  const torus2 = new THREE.Mesh(torusGeo, torusMat.clone());
  torus2.material.opacity = 0.12;
  torus2.rotation.x = Math.PI / 1.8;
  torus2.rotation.y = 0.6;
  torus2.position.set(7, -3, -6);
  scene.add(torus2);

  // واکنش به حرکت موس
  let mx = 0, my = 0;
  window.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  function resize() {
    const w = heroEl.clientWidth;
    const h = heroEl.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  const pos = geo.attributes.position;
  function animate(t) {
    requestAnimationFrame(animate);
    // شناور شدن پارتیکل‌ها به سمت بالا
    for (let i = 0; i < COUNT; i++) {
      let y = pos.getY(i) + speeds[i] * 0.01;
      if (y > 11) y = -11;
      pos.setY(i, y);
      pos.setX(i, pos.getX(i) + Math.sin(t * 0.001 + i) * 0.002);
    }
    pos.needsUpdate = true;

    points.rotation.y = t * 0.00003;
    torus1.rotation.z = t * 0.0002;
    torus2.rotation.z = -t * 0.00015;

    // پارالاکس دوربین با موس
    camera.position.x += (mx * 1.6 - camera.position.x) * 0.03;
    camera.position.y += (-my * 1.2 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
})();
