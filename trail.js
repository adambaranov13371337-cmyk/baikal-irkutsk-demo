const trust = document.querySelector('#o-nas');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const crystal = trust.querySelector('.trust-crystal');
const photos = [...crystal.querySelectorAll('.crystal-shot')];
const benefits = [...trust.querySelectorAll('.perks article')];
const clamp = n => Math.min(1, Math.max(0,n));
let scheduled = false;
function drawTrust() {
  scheduled = false;
  if (!trust.classList.contains('pinned')) return;
  const bounds = trust.getBoundingClientRect();
  if (bounds.bottom < 0 || bounds.top > innerHeight) return;
  const travel = bounds.height - trust.firstElementChild.clientHeight;
  const progress = clamp(-bounds.top / travel);
  const intro = clamp((innerHeight * .44 - bounds.top) / (innerHeight * .44));
  trust.style.setProperty('--title-alpha', intro);
  trust.style.setProperty('--title-rise', ((1-intro)*38)+'px');
  trust.style.setProperty('--grow', .64 + .36 * clamp(progress * 3 + intro * .2));
  // Each photograph holds for a beat. A diagonal wipe follows the scroll
  // position in either direction, clipped by the original crystal silhouette.
  const phase = progress * photos.length;
  const base = Math.min(photos.length - 1, Math.max(0, Math.floor(phase - .25)));
  const reveal = base === photos.length - 1 ? 0 : clamp((phase - base - .75) / .5);
  const incoming = base < photos.length - 1 && reveal > 0 ? base + 1 : -1;
  const active = reveal >= .5 ? incoming : base;
  crystal.style.setProperty('--edge', (126 * reveal).toFixed(2) + '%');
  photos.forEach((photo, i) => {
    photo.classList.toggle('is-base', i === base);
    photo.classList.toggle('is-incoming', i === incoming);
    benefits[i].classList.toggle('current', i === active);
  });
}
function sizeTrust() {
  trust.classList.toggle('pinned', !reduced.matches && innerHeight >= 470);
  const frame = trust.firstElementChild;
  if (frame.scrollHeight > frame.clientHeight + 1) trust.classList.remove('pinned');
  drawTrust();
}
window.addEventListener('scroll', () => {
  if (!scheduled) {scheduled = true; requestAnimationFrame(drawTrust);}
}, {passive:true});
window.addEventListener('resize',sizeTrust);
reduced.addEventListener('change',sizeTrust);
sizeTrust();
const photoLoader = new IntersectionObserver(entries => {
  if (!entries.some(entry => entry.isIntersecting)) return;
  photos.forEach(photo => { photo.loading = 'eager'; });
  photoLoader.disconnect();
}, {rootMargin:'100% 0px'});
photoLoader.observe(trust);

const trekking = document.querySelector('#trekking');
const track = trekking.querySelector('.cards');
track.id='trek-items';
track.tabIndex=0;
track.setAttribute('role','region');
track.setAttribute('aria-label','Снаряжение для треккинга');
const items = [...track.children];
const controls = document.createElement('div');
controls.className='trek-nav';
const range = document.createElement('span');
controls.append(range);
track.before(controls);
function indexAtEdge() {
  const left = track.getBoundingClientRect().left + 2;
  return items.reduce((best,item,i) => Math.abs(item.getBoundingClientRect().left-left) < Math.abs(items[best].getBoundingClientRect().left-left) ? i : best,0);
}
function updateControls() {
  if (!trekking.open) return;
  const end = track.getBoundingClientRect().right;
  const first = indexAtEdge();
  let last = first;
  while (last+1 < items.length && items[last+1].getBoundingClientRect().right <= end+2) last++;
  range.textContent=(first+1)+(last>first?'–'+(last+1):'')+' / '+items.length;
}
function move(step) {
  const item = items[Math.max(0,Math.min(items.length-1,indexAtEdge()+step))];
  track.scrollTo({left:item.offsetLeft-items[0].offsetLeft,behavior:reduced.matches?'instant':'smooth'});
}
let requestedLeft = null;
let lastNotch = 0;
function resetWheel() { requestedLeft = null; }
track.addEventListener('pointerdown', resetWheel, {passive:true});
track.addEventListener('keydown', resetWheel);
track.addEventListener('wheel', event => {
  const dy = event.deltaY;
  if (!event.cancelable || event.ctrlKey || event.shiftKey || !dy ||
      Math.abs(event.deltaX) >= Math.abs(dy)) {
    resetWheel();
    return;
  }
  const max = track.scrollWidth - track.clientWidth;
  if (max < 1 || (dy < 0 && track.scrollLeft <= 2) ||
      (dy > 0 && track.scrollLeft >= max - 2)) {
    resetWheel();
    return;
  }
  event.preventDefault();
  track.classList.add('wheel-scroll');
  const notch = event.deltaMode !== 0 || (Number.isInteger(dy) && Math.abs(dy) >= 90);
  const now = performance.now();
  const start = notch && requestedLeft !== null && now-lastNotch < 200
    ? requestedLeft : track.scrollLeft;
  const unit = event.deltaMode === 1 ? 20 : event.deltaMode === 2 ? track.clientWidth : 1;
  requestedLeft = Math.min(max, Math.max(0, start + dy * unit));
  lastNotch = now;
  track.scrollTo({left:requestedLeft,behavior:notch && !reduced.matches ? 'smooth' : 'instant'});
}, {passive:false});
track.addEventListener('touchstart', () => track.classList.remove('wheel-scroll'), {passive:true});
track.addEventListener('keydown', e=>{
  if(e.target!==track || !['ArrowLeft','ArrowRight'].includes(e.key)) return;
  e.preventDefault();move(e.key==='ArrowLeft'?-1:1);
});
track.addEventListener('scroll',updateControls,{passive:true});
new ResizeObserver(updateControls).observe(track);
trekking.addEventListener('toggle',updateControls);
updateControls();

(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let destination = null;
  let lastWheel = 0;
  const reset = () => { destination = null; };
  window.addEventListener('pointerdown', reset, {passive:true});
  window.addEventListener('keydown', reset);
  window.addEventListener('wheel', event => {
    const delta = event.deltaY;
    const notch = event.deltaMode === 1 || (event.deltaMode === 0 && Math.abs(delta) >= 100 &&
      (delta % 100 === 0 || delta % 120 === 0));
    if (!notch || !delta || event.defaultPrevented || !event.cancelable || reduced.matches ||
        event.ctrlKey || event.shiftKey || event.deltaX || document.querySelector('dialog[open]') ||
        event.target.closest?.('select,textarea,nav')) {
      reset();
      return;
    }
    const now = performance.now();
    const start = destination !== null && now - lastWheel < 200 ? destination : scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    destination = Math.max(0, Math.min(max, start + delta * (event.deltaMode === 1 ? 22 : 1)));
    lastWheel = now;
    event.preventDefault();
    window.scrollTo({top:destination, behavior:'smooth'});
  }, {passive:false});
})();
