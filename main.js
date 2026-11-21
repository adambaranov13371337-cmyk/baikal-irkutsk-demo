const menu = document.querySelector('#menu');
const toggle = document.querySelector('.toggle');
toggle.addEventListener('click', () => {
  toggle.setAttribute('aria-expanded', String(menu.classList.toggle('open')));
});
menu.addEventListener('click', event => {
  if (event.target.closest('a')) {
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');
  }
});
const dialog = document.querySelector('#book');
const consent = dialog.querySelector('input');
document.querySelectorAll('[data-book]').forEach(button => button.addEventListener('click', () => dialog.showModal()));
dialog.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.querySelector('.primary').addEventListener('click', event => {
  if (!consent.reportValidity()) event.preventDefault();
});
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) {
    entry.target.classList.add('arrived');
    observer.unobserve(entry.target);
  }
}));
document.querySelectorAll('section h2,.perks article,.portraits article,.path article').forEach(node => observer.observe(node));
