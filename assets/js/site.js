const config = window.PIWM_CONFIG;
const authors = document.querySelector('#authors');
authors.innerHTML = config.authors.map((name, index) => `<span>${name}${index < config.authors.length - 1 ? ',' : ''}</span>`).join(' ');

const links = document.querySelector('#paper-links');
const linkItems = [
  config.links.paperPdf ? `<a class="button primary" href="${config.links.paperPdf}">Paper PDF</a>` : `<span class="button disabled" title="No compiled PDF was included">Paper PDF · pending</span>`,
  config.links.arxiv ? `<a class="button dark" href="${config.links.arxiv}">arXiv</a>` : `<span class="button disabled" title="No arXiv identifier was included">arXiv · pending</span>`,
  config.links.code ? `<a class="button dark" href="${config.links.code}">Code</a>` : '',
  `<a class="button light" href="${config.links.source}" download>LaTeX source</a>`,
  `<a class="button light" href="mailto:${config.correspondence}">Contact</a>`
];
links.innerHTML = linkItems.join('');

const candidates = {
  Greet: { change: 'Not provided in source figure', benefit: '—', risk: '—', status: 'No target shown' },
  Elicit: { change: 'Interest / need focus clearer', benefit: 'Clarify comparison need', risk: 'Mild interruption', status: 'Gold action' },
  Inform: { change: 'Interest / more facts available', benefit: 'Reduce basic uncertainty', risk: 'Information may be generic', status: 'Candidate' },
  Recommend: { change: 'Interest / one option highlighted', benefit: 'Narrow the search', risk: 'Premature preference pressure', status: 'Candidate' },
  Hold: { change: 'Interest / browsing continues', benefit: 'Preserve autonomy', risk: 'Uncertainty remains', status: 'Non-intervention' }
};
const tabs = document.querySelector('.action-tabs');
Object.entries(candidates).forEach(([name]) => {
  const button = document.createElement('button');
  button.type = 'button'; button.role = 'tab'; button.textContent = name; button.dataset.candidate = name;
  if (name === 'Elicit') button.classList.add('active');
  tabs.appendChild(button);
});
tabs.addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  tabs.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button));
  const item = candidates[button.dataset.candidate];
  document.querySelector('#candidate-name').textContent = button.dataset.candidate;
  document.querySelector('#candidate-status').textContent = item.status;
  document.querySelector('#candidate-change').textContent = item.change;
  document.querySelector('#candidate-benefit').textContent = item.benefit;
  document.querySelector('#candidate-risk').textContent = item.risk;
});

const frameCaptions = ['Remains near the machine.', 'Gaze shifts across display regions.', 'Leans slightly forward; no explicit request.'];
document.querySelector('.frame-strip').addEventListener('click', event => {
  const frame = event.target.closest('.frame'); if (!frame) return;
  document.querySelectorAll('.frame').forEach(item => item.classList.toggle('active', item === frame));
  document.querySelector('#frame-caption').textContent = frameCaptions[Number(frame.dataset.frame)];
});

const resultData = {
  full: { title: 'Full video-to-action accuracy', note: 'Counterfactual PIWM supplies predicted candidate consequences to Act; direct PIWM does not.', headers: ['Model / configuration', 'Correct', 'Accuracy'], rows: [['Qwen2.5-VL-7B', '126 / 509', '24.75%'], ['PIWM · direct decision', '231 / 509', '45.38%'], ['PIWM · consequence comparison', '324 / 509', '63.65%', 'highlight'], ['GPT-4o', '351 / 509', '68.96%'], ['Gemini 2.5 Flash', '355 / 509', '69.74%']] },
  components: { title: 'Task-specific component accuracy', note: 'See requires both stage and intent to be correct; Foresee reports next-stage accuracy; Act receives the reference customer state.', headers: ['Model', 'See (209)', 'Foresee (309)', 'Act (245)'], rows: [['Qwen2.5-VL-7B', '43.54%', '9.39%', '13.47%'], ['PIWM', '62.20%', '74.43%', '89.80%', 'highlight']] },
  ablations: { title: 'Full-pipeline ablations', note: 'All conditions use the same 509-example Full test set and retain the five-action decision space.', headers: ['Inference setting', 'Correct', 'Accuracy', 'Δ vs. full'], rows: [['Full See + Foresee + Act', '324 / 509', '63.65%', '—', 'highlight'], ['Direct decision', '231 / 509', '45.38%', '−18.27 pp'], ['Without explicit evidence', '141 / 509', '27.70%', '−35.95 pp'], ['Hold forecast unavailable', '244 / 509', '47.94%', '−15.72 pp']] }
};
function renderResult(key) {
  const data = resultData[key];
  const header = data.headers.map(value => `<th>${value}</th>`).join('');
  const rows = data.rows.map(row => { const mark = row.at(-1) === 'highlight'; const cells = (mark ? row.slice(0,-1) : row).map(value => `<td>${value}</td>`).join(''); return `<tr class="${mark ? 'highlight' : ''}">${cells}</tr>`; }).join('');
  document.querySelector('#result-content').innerHTML = `<div class="result-head"><h3>${data.title}</h3><p>${data.note}</p></div><div class="table-scroll"><table><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></div>`;
}
renderResult('full');
document.querySelector('.result-tabs').addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  document.querySelectorAll('.result-tab').forEach(item => item.classList.toggle('active', item === button)); renderResult(button.dataset.result);
});

document.querySelector('.copy-button').addEventListener('click', async event => {
  await navigator.clipboard.writeText(document.querySelector('#bibtex').textContent);
  event.target.textContent = 'Copied'; setTimeout(() => event.target.textContent = 'Copy BibTeX', 1600);
});
const menu = document.querySelector('.menu-button');
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') === 'true'; menu.setAttribute('aria-expanded', String(!open)); document.querySelector('.nav-links').classList.toggle('open', !open); });
document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => { menu.setAttribute('aria-expanded', 'false'); document.querySelector('.nav-links').classList.remove('open'); }));
const topButton = document.querySelector('.to-top');
window.addEventListener('scroll', () => topButton.classList.toggle('show', window.scrollY > 700)); topButton.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting) entry.target.classList.add('visible'); }), {threshold:.12});
document.querySelectorAll('.reveal').forEach(item => observer.observe(item));
