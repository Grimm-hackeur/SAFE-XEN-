const form = document.getElementById('form');
const urlInput = document.getElementById('url');
const submitBtn = document.getElementById('submitBtn');
const hint = document.getElementById('hint');
const result = document.getElementById('result');
const resultVideo = document.getElementById('resultVideo');
const resultTitle = document.getElementById('resultTitle');
const resultAuthor = document.getElementById('resultAuthor');
const downloadVideo = document.getElementById('downloadVideo');
const downloadAudio = document.getElementById('downloadAudio');

const HISTORY_KEY = 'kelt_tiktok_history';
const HISTORY_MAX = 30;

function getHistory(){
  try{
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  }catch(e){
    return [];
  }
}

function saveHistory(list){
  try{
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, HISTORY_MAX)));
  }catch(e){
    // stockage indisponible (navigation privée, quota) : on continue sans historique
  }
}

function addToHistory(entry){
  const list = getHistory();
  list.unshift({ ...entry, ts: Date.now() });
  saveHistory(list);
  renderHistory();
}

function renderHistory(){
  const list = getHistory();
  const container = document.getElementById('historyList');
  const empty = document.getElementById('historyEmpty');
  container.innerHTML = '';

  if(list.length === 0){
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  list.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'hist-item glass';

    const thumb = document.createElement('div');
    thumb.className = 'hist-thumb';
    if(item.thumbnail){
      thumb.style.backgroundImage = `url("${item.thumbnail}")`;
    }

    const meta = document.createElement('div');
    meta.className = 'hist-meta';
    const p = document.createElement('p');
    p.textContent = item.title || item.sourceUrl;
    const span = document.createElement('span');
    span.textContent = new Date(item.ts).toLocaleString('fr-FR');
    meta.appendChild(p);
    meta.appendChild(span);

    const actions = document.createElement('div');
    actions.className = 'hist-actions';
    const dl = document.createElement('a');
    dl.href = item.videoUrl;
    dl.target = '_blank';
    dl.rel = 'noopener';
    dl.download = '';
    dl.textContent = 'Rouvrir';
    const del = document.createElement('button');
    del.textContent = 'Retirer';
    del.addEventListener('click', () => {
      const filtered = getHistory().filter((h) => h.ts !== item.ts);
      saveHistory(filtered);
      renderHistory();
    });
    actions.appendChild(dl);
    actions.appendChild(del);

    row.appendChild(thumb);
    row.appendChild(meta);
    row.appendChild(actions);
    container.appendChild(row);
  });
}

document.getElementById('clearHistory').addEventListener('click', () => {
  saveHistory([]);
  renderHistory();
});

function setLoading(isLoading){
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? 'Récupération…' : 'Récupérer';
}

function setHint(message, isError){
  hint.textContent = message || '';
  hint.classList.toggle('error', Boolean(isError));
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const link = urlInput.value.trim();

  if(!link.includes('tiktok.com')){
    setHint('Lien invalide, envoie un lien tiktok.com valide.', true);
    return;
  }

  setLoading(true);
  setHint('');
  result.hidden = true;

  try{
    const response = await fetch(`/api/tiktok?url=${encodeURIComponent(link)}`);
    const data = await response.json();

    if(!response.ok || !data.success || !data.video){
      setHint(data.error || 'Échec de récupération du lien. Vérifie l\'URL et réessaie.', true);
      setLoading(false);
      return;
    }

    resultVideo.src = data.video;
    if(data.thumbnail){
      resultVideo.poster = data.thumbnail;
    }
    resultTitle.textContent = data.title || 'Vidéo TikTok';
    resultAuthor.textContent = data.author ? `@${data.author}` : '';
    downloadVideo.href = data.video;

    if(data.audio){
      downloadAudio.href = data.audio;
      downloadAudio.hidden = false;
    }else{
      downloadAudio.hidden = true;
    }

    result.hidden = false;

    addToHistory({
      sourceUrl: link,
      videoUrl: data.video,
      thumbnail: data.thumbnail || '',
      title: data.title || '',
      author: data.author || ''
    });

    setLoading(false);
  }catch(err){
    setHint('Erreur réseau pendant la récupération. Réessaie dans un instant.', true);
    setLoading(false);
  }
});

renderHistory();

const bottomBar = document.getElementById('bottomBar');
const bottomBarBtn = document.getElementById('bottomBarBtn');

function toggleBottomBar(){
  const heroBottom = form.getBoundingClientRect().bottom;
  bottomBar.classList.toggle('show', heroBottom < 0);
}
window.addEventListener('scroll', toggleBottomBar, { passive: true });
toggleBottomBar();

bottomBarBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => urlInput.focus(), 300);
});
