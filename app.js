const app = document.getElementById('app');
const searchInput = document.getElementById('search');

async function loadBaseVideos(){
  try{
    const res = await fetch('data/videos.json');
    return await res.json();
  }catch(e){
    console.error('Failed loading base videos',e);
    return [];
  }
}

function loadLocalVideos(){
  try{ return JSON.parse(localStorage.getItem('yt_videos')||'[]') }catch(e){return []}
}

function saveLocalVideos(v){ localStorage.setItem('yt_videos',JSON.stringify(v)) }

function allVideos(base){
  const local = loadLocalVideos();
  return [...base, ...local];
}

function qs(name){
  const h = location.hash || '#/';
  const parts = h.split('?');
  if(parts[1]){
    return new URLSearchParams(parts[1]).get(name);
  }
  return null;
}

function createCard(video){
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = `
    <img class="thumb" src="${video.thumbnail}" alt="thumb" />
    <div class="meta">
      <div class="title">${escapeHTML(video.title)}</div>
      <div class="sub">${video.channel} • ${video.views} views</div>
    </div>
  `;
  div.onclick = ()=>{ location.hash = `#/watch?id=${video.id}` }
  return div;
}

function escapeHTML(s=''){ return String(s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[c]) }

async function renderHome(){
  const base = await loadBaseVideos();
  const videos = allVideos(base);
  const container = document.createElement('div');
  container.className = 'container';
  const grid = document.createElement('div'); grid.className='grid';

  const q = (searchInput.value||'').toLowerCase();
  videos.filter(v=> (v.title+v.channel).toLowerCase().includes(q)).forEach(v=> grid.appendChild(createCard(v)));

  container.appendChild(grid);
  app.innerHTML=''; app.appendChild(container);
}

function ensureId(){ return Math.random().toString(36).slice(2,9) }

function getLikeKey(id){ return `likes_${id}` }
function getCommentsKey(id){ return `comments_${id}` }

function loadComments(id){ return JSON.parse(localStorage.getItem(getCommentsKey(id))||'[]') }
function saveComments(id,arr){ localStorage.setItem(getCommentsKey(id),JSON.stringify(arr)) }

function toggleLike(id){
  const key = getLikeKey(id);
  const curr = JSON.parse(localStorage.getItem(key)||'0');
  const newv = curr===1?0:1; localStorage.setItem(key,JSON.stringify(newv));
}

async function renderWatch(id){
  const base = await loadBaseVideos();
  const videos = allVideos(base);
  const v = videos.find(x=>x.id==id);
  if(!v){ app.innerHTML=`<div class="container"><p>Video not found</p></div>`; return }

  const container = document.createElement('div'); container.className='container';
  const watch = document.createElement('div'); watch.className='watch-player';
  const grid = document.createElement('div'); grid.className='watch-grid';

  const left = document.createElement('div');
  left.innerHTML = `
    <div class="video-frame">
      <video id="player" controls src="${v.src}" poster="${v.thumbnail}" style="width:100%"></video>
    </div>
    <h2>${escapeHTML(v.title)}</h2>
    <div class="small">${v.channel} • ${v.views} views</div>
    <div class="controls">
      <button id="likeBtn" class="btn">Like</button>
    </div>
    <p>${escapeHTML(v.description||'')}</p>
  `;

  const right = document.createElement('div');
  right.innerHTML = `<div class="comments"><h3>Comments</h3><div id="commentsList"></div>
    <div style="margin-top:8px"><textarea id="commentText" rows="3" style="width:100%;"></textarea>
    <button id="postComment" class="btn" style="margin-top:6px">Post</button></div></div>`;

  grid.appendChild(left); grid.appendChild(right);
  watch.appendChild(grid); container.appendChild(watch); app.innerHTML=''; app.appendChild(container);

  // like button state
  const likeBtn = document.getElementById('likeBtn');
  const likeState = JSON.parse(localStorage.getItem(getLikeKey(v.id))||'0');
  likeBtn.textContent = likeState? 'Liked' : 'Like';
  likeBtn.onclick = ()=>{ toggleLike(v.id); likeBtn.textContent = JSON.parse(localStorage.getItem(getLikeKey(v.id))||'0')? 'Liked':'Like' }

  // comments
  function refreshComments(){
    const list = document.getElementById('commentsList'); list.innerHTML='';
    loadComments(v.id).forEach(c=>{
      const el = document.createElement('div'); el.className='comment';
      el.innerHTML = `<div class="small">${escapeHTML(c.when)}</div><div>${escapeHTML(c.text)}</div>`;
      list.appendChild(el);
    })
  }
  refreshComments();
  document.getElementById('postComment').onclick = ()=>{
    const t = document.getElementById('commentText'); if(!t.value.trim()) return;
    const arr = loadComments(v.id); arr.unshift({text:t.value,when:new Date().toLocaleString()}); saveComments(v.id,arr); t.value=''; refreshComments();
  }
}

function renderUpload(){
  const el = document.createElement('div'); el.className='container';
  el.innerHTML = `
    <div class="upload-form">
      <h2>Upload / Add Video (demo)</h2>
      <p class="small">You can add a public video URL. Local files will play in this session but won't persist across reloads.</p>
      <label>Title</label>
      <input id="u_title" style="width:100%;padding:8px;margin:6px 0" />
      <label>Channel</label>
      <input id="u_channel" style="width:100%;padding:8px;margin:6px 0" />
      <label>Video URL</label>
      <input id="u_src" style="width:100%;padding:8px;margin:6px 0" placeholder="https://...mp4" />
      <label>Thumbnail URL</label>
      <input id="u_thumb" style="width:100%;padding:8px;margin:6px 0" placeholder="https://...jpg" />
      <button id="saveVid" class="btn">Add Video</button>
    </div>
  `;
  app.innerHTML=''; app.appendChild(el);
  document.getElementById('saveVid').onclick = ()=>{
    const title = document.getElementById('u_title').value.trim();
    const channel = document.getElementById('u_channel').value.trim()||'Me';
    const src = document.getElementById('u_src').value.trim();
    const thumb = document.getElementById('u_thumb').value.trim()||'https://via.placeholder.com/480x270.png?text=No+Thumb';
    if(!title||!src){ alert('Provide title and video URL'); return }
    const arr = loadLocalVideos();
    const id = ensureId();
    arr.unshift({id,title,channel,views:0,likes:0,src,thumbnail:thumb,description:''});
    saveLocalVideos(arr);
    location.hash = `#/watch?id=${id}`;
  }
}

function route(){
  const h = location.hash || '#/';
  if(h.startsWith('#/watch')){
    const id = qs('id'); renderWatch(id);
  }else if(h.startsWith('#/upload')){
    renderUpload();
  }else{
    renderHome();
  }
}

window.addEventListener('hashchange', route);
searchInput.addEventListener('input', ()=>{ if(location.hash==''||location.hash=='#/') renderHome(); else route(); });

// initial
route();
