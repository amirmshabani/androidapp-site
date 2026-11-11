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
