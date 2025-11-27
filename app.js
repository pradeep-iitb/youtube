// YouTube Clone Application
const app = document.getElementById('app');
const searchInput = document.getElementById('search');
const guideButton = document.getElementById('guide-button');
const guide = document.getElementById('guide');

// State management
let sidebarExpanded = window.innerWidth > 1024;

// Initialize sidebar state
if (window.innerWidth <= 1024) {
  guide.style.transform = 'translateX(-240px)';
  document.getElementById('content').style.marginLeft = '0';
} else {
  guide.classList.toggle('guide-collapsed', !sidebarExpanded);
}

// Sidebar toggle functionality
guideButton.addEventListener('click', () => {
  if (window.innerWidth <= 1024) {
    // Mobile: slide in/out
    const isHidden = guide.style.transform === 'translateX(-240px)';
    guide.style.transform = isHidden ? 'translateX(0)' : 'translateX(-240px)';
  } else {
    // Desktop: collapse/expand
    sidebarExpanded = !sidebarExpanded;
    guide.classList.toggle('guide-collapsed', !sidebarExpanded);
  }
});

// Data loading functions
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

function formatViews(views) {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + 'M';
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'K';
  }
  return views.toString();
}

function formatDuration(seconds) {
  if (!seconds) return '10:24';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getRandomAvatar() {
  const avatars = [
    'https://yt3.ggpht.com/yti/default_avatar.jpg',
    'https://yt3.ggpht.com/a/default-user=s88-c-k-c0x00ffffff-no-rj',
    'https://yt3.ggpht.com/ytc/default-user=s88-c-k-c0x00ffffff-no-rj'
  ];
  return avatars[Math.floor(Math.random() * avatars.length)];
}

function createVideoCard(video){
  const card = document.createElement('div');
  card.className = 'video-card';
  card.onclick = () => { location.hash = `#/watch?id=${video.id}` };
  
  card.innerHTML = `
    <div class="video-thumbnail">
      <img src="${video.thumbnail}" alt="${escapeHTML(video.title)}">
      <span class="video-duration">${formatDuration(video.duration)}</span>
    </div>
    <div class="video-info">
      <div class="channel-avatar">
        <img src="${getRandomAvatar()}" alt="${escapeHTML(video.channel)}">
      </div>
      <div class="video-details">
        <div class="video-title">${escapeHTML(video.title)}</div>
        <div class="video-metadata">
          <div class="channel-name">${escapeHTML(video.channel)}</div>
          <div class="video-stats">${formatViews(video.views)} views</div>
        </div>
      </div>
    </div>
  `;
  
  return card;
}

function escapeHTML(s=''){ return String(s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[c]) }

async function renderHome(){
  const base = await loadBaseVideos();
  const videos = allVideos(base);
  
  const container = document.createElement('div');
  container.className = 'home-container';
  
  const grid = document.createElement('div');
  grid.className = 'video-grid';

  const q = (searchInput.value||'').toLowerCase();
  const filteredVideos = videos.filter(v => 
    (v.title + v.channel).toLowerCase().includes(q)
  );
  
  filteredVideos.forEach(video => {
    grid.appendChild(createVideoCard(video));
  });

  container.appendChild(grid);
  app.innerHTML = '';
  app.appendChild(container);
}

function ensureId(){ return Math.random().toString(36).slice(2,9) }

function getLikeKey(id){ return `likes_${id}` }
function getDislikeKey(id){ return `dislikes_${id}` }
function getCommentsKey(id){ return `comments_${id}` }
function getSubscribedKey(channel){ return `subscribed_${channel}` }

function loadComments(id){ return JSON.parse(localStorage.getItem(getCommentsKey(id))||'[]') }
function saveComments(id,arr){ localStorage.setItem(getCommentsKey(id),JSON.stringify(arr)) }

function toggleLike(id){
  const likeKey = getLikeKey(id);
  const dislikeKey = getDislikeKey(id);
  const currentLike = JSON.parse(localStorage.getItem(likeKey)||'false');
  
  if (currentLike) {
    localStorage.setItem(likeKey, 'false');
  } else {
    localStorage.setItem(likeKey, 'true');
    localStorage.setItem(dislikeKey, 'false'); // Remove dislike if liked
  }
}

function toggleDislike(id){
  const likeKey = getLikeKey(id);
  const dislikeKey = getDislikeKey(id);
  const currentDislike = JSON.parse(localStorage.getItem(dislikeKey)||'false');
  
  if (currentDislike) {
    localStorage.setItem(dislikeKey, 'false');
  } else {
    localStorage.setItem(dislikeKey, 'true');
    localStorage.setItem(likeKey, 'false'); // Remove like if disliked
  }
}

function toggleSubscribe(channel){
  const key = getSubscribedKey(channel);
  const current = JSON.parse(localStorage.getItem(key)||'false');
  localStorage.setItem(key, JSON.stringify(!current));
}

async function renderWatch(id){
  const base = await loadBaseVideos();
  const videos = allVideos(base);
  const video = videos.find(x => x.id == id);
  
  if(!video){ 
    app.innerHTML = `<div class="home-container"><p>Video not found</p></div>`; 
    return;
  }

  // Get suggested videos (other videos)
  const suggestedVideos = videos.filter(v => v.id !== id).slice(0, 10);

  const container = document.createElement('div');
  container.className = 'watch-container';

  const primaryContent = document.createElement('div');
  primaryContent.className = 'primary-content';

  // Video player
  const playerContainer = document.createElement('div');
  playerContainer.className = 'video-player';
  playerContainer.innerHTML = `
    <video id="player" controls src="${video.src}" poster="${video.thumbnail}"></video>
  `;

  // Video info
  const videoInfo = document.createElement('div');
  videoInfo.className = 'video-primary-info';
  
  const isLiked = JSON.parse(localStorage.getItem(getLikeKey(video.id))||'false');
  const isDisliked = JSON.parse(localStorage.getItem(getDislikeKey(video.id))||'false');
  const isSubscribed = JSON.parse(localStorage.getItem(getSubscribedKey(video.channel))||'false');
  
  videoInfo.innerHTML = `
    <h1 class="video-title-watch">${escapeHTML(video.title)}</h1>
    <div class="video-info-secondary">
      <div class="video-owner">
        <div class="owner-avatar">
          <img src="${getRandomAvatar()}" alt="${escapeHTML(video.channel)}">
        </div>
        <div class="owner-info">
          <div class="owner-name">${escapeHTML(video.channel)}</div>
          <div class="owner-subscribers">${Math.floor(Math.random() * 1000)}K subscribers</div>
        </div>
        <button id="subscribeBtn" class="subscribe-button" style="background: ${isSubscribed ? '#606060' : '#cc0000'}">
          ${isSubscribed ? 'Subscribed' : 'Subscribe'}
        </button>
      </div>
      <div class="video-actions">
        <button id="likeBtn" class="action-button ${isLiked ? 'liked' : ''}">
          <span class="material-icons">${isLiked ? 'thumb_up' : 'thumb_up_off_alt'}</span>
          <span>${video.likes + (isLiked ? 1 : 0)}</span>
        </button>
        <button id="dislikeBtn" class="action-button ${isDisliked ? 'disliked' : ''}">
          <span class="material-icons">${isDisliked ? 'thumb_down' : 'thumb_down_off_alt'}</span>
        </button>
        <button class="action-button">
          <span class="material-icons">share</span>
          <span>Share</span>
        </button>
        <button class="action-button">
          <span class="material-icons">playlist_add</span>
          <span>Save</span>
        </button>
      </div>
    </div>
  `;

  // Comments section
  const commentsSection = document.createElement('div');
  commentsSection.className = 'comments-section';
  
  const comments = loadComments(video.id);
  commentsSection.innerHTML = `
    <div class="comments-header">
      <div class="comments-count">${comments.length} Comments</div>
    </div>
    <div class="comment-input-container">
      <div class="comment-avatar">
        <img src="${getRandomAvatar()}" alt="Your avatar">
      </div>
      <div class="comment-input-form">
        <textarea id="commentInput" class="comment-input" placeholder="Add a comment..."></textarea>
        <div class="comment-actions" id="commentActions" style="display: none;">
          <button class="comment-button" id="cancelComment">Cancel</button>
          <button class="comment-button primary" id="postComment">Comment</button>
        </div>
      </div>
    </div>
    <div class="comments-list" id="commentsList"></div>
  `;

  // Secondary content (suggested videos)
  const secondaryContent = document.createElement('div');
  secondaryContent.className = 'secondary-content';
  
  const suggestedContainer = document.createElement('div');
  suggestedContainer.className = 'suggested-videos';
  
  suggestedVideos.forEach(suggestedVideo => {
    const suggestedElement = document.createElement('div');
    suggestedElement.className = 'suggested-video';
    suggestedElement.onclick = () => { location.hash = `#/watch?id=${suggestedVideo.id}` };
    
    suggestedElement.innerHTML = `
      <div class="suggested-thumbnail">
        <img src="${suggestedVideo.thumbnail}" alt="${escapeHTML(suggestedVideo.title)}">
        <span class="video-duration">${formatDuration(suggestedVideo.duration)}</span>
      </div>
      <div class="suggested-info">
        <div class="suggested-title">${escapeHTML(suggestedVideo.title)}</div>
        <div class="suggested-channel">${escapeHTML(suggestedVideo.channel)}</div>
        <div class="suggested-stats">${formatViews(suggestedVideo.views)} views</div>
      </div>
    `;
    
    suggestedContainer.appendChild(suggestedElement);
  });

  secondaryContent.appendChild(suggestedContainer);

  // Assemble the watch page
  primaryContent.appendChild(playerContainer);
  primaryContent.appendChild(videoInfo);
  primaryContent.appendChild(commentsSection);
  
  container.appendChild(primaryContent);
  container.appendChild(secondaryContent);
  
  app.innerHTML = '';
  app.appendChild(container);

  // Event handlers
  setupWatchPageEvents(video);
}

function setupWatchPageEvents(video) {
  // Like/Dislike functionality
  const likeBtn = document.getElementById('likeBtn');
  const dislikeBtn = document.getElementById('dislikeBtn');
  const subscribeBtn = document.getElementById('subscribeBtn');

  likeBtn.onclick = () => {
    toggleLike(video.id);
    location.reload(); // Simple refresh to update UI
  };

  dislikeBtn.onclick = () => {
    toggleDislike(video.id);
    location.reload(); // Simple refresh to update UI
  };

  subscribeBtn.onclick = () => {
    toggleSubscribe(video.channel);
    const isSubscribed = JSON.parse(localStorage.getItem(getSubscribedKey(video.channel))||'false');
    subscribeBtn.textContent = isSubscribed ? 'Subscribed' : 'Subscribe';
    subscribeBtn.style.background = isSubscribed ? '#606060' : '#cc0000';
  };

  // Comment functionality
  const commentInput = document.getElementById('commentInput');
  const commentActions = document.getElementById('commentActions');
  const cancelBtn = document.getElementById('cancelComment');
  const postBtn = document.getElementById('postComment');

  commentInput.onfocus = () => {
    commentActions.style.display = 'flex';
  };

  cancelBtn.onclick = () => {
    commentInput.value = '';
    commentActions.style.display = 'none';
    commentInput.blur();
  };

  postBtn.onclick = () => {
    const text = commentInput.value.trim();
    if (!text) return;

    const comments = loadComments(video.id);
    comments.unshift({
      text: text,
      author: 'You',
      time: new Date().toLocaleString(),
      likes: 0
    });
    saveComments(video.id, comments);
    
    commentInput.value = '';
    commentActions.style.display = 'none';
    refreshComments(video.id);
  };

  refreshComments(video.id);
}

function refreshComments(videoId) {
  const commentsList = document.getElementById('commentsList');
  const comments = loadComments(videoId);
  
  commentsList.innerHTML = '';
  
  comments.forEach(comment => {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    
    commentElement.innerHTML = `
      <div class="comment-avatar">
        <img src="${getRandomAvatar()}" alt="${escapeHTML(comment.author)}">
      </div>
      <div class="comment-content">
        <div class="comment-author">
          ${escapeHTML(comment.author)}
          <span class="comment-time">${comment.time}</span>
        </div>
        <div class="comment-text">${escapeHTML(comment.text)}</div>
        <div class="comment-actions-row">
          <button class="comment-action">
            <span class="material-icons">thumb_up</span>
            <span>${comment.likes || 0}</span>
          </button>
          <button class="comment-action">
            <span class="material-icons">thumb_down</span>
          </button>
          <button class="comment-action">Reply</button>
        </div>
      </div>
    `;
    
    commentsList.appendChild(commentElement);
  });
}

function renderUpload(){
  const container = document.createElement('div');
  container.className = 'home-container';
  container.innerHTML = `
    <div class="upload-form" style="max-width: 600px; margin: 0 auto; background: #181818; padding: 24px; border-radius: 12px;">
      <h2 style="margin-bottom: 16px;">Upload Video</h2>
      <p style="color: #aaa; margin-bottom: 24px;">Add a video by providing a public URL. This is a demo version.</p>
      
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Title</label>
        <input id="u_title" style="width: 100%; padding: 12px; background: #0f0f0f; border: 1px solid #303030; border-radius: 8px; color: #f1f1f1; font-size: 14px;" />
      </div>
      
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Channel</label>
        <input id="u_channel" style="width: 100%; padding: 12px; background: #0f0f0f; border: 1px solid #303030; border-radius: 8px; color: #f1f1f1; font-size: 14px;" />
      </div>
      
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Video URL</label>
        <input id="u_src" style="width: 100%; padding: 12px; background: #0f0f0f; border: 1px solid #303030; border-radius: 8px; color: #f1f1f1; font-size: 14px;" placeholder="https://example.com/video.mp4" />
      </div>
      
      <div style="margin-bottom: 24px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Thumbnail URL</label>
        <input id="u_thumb" style="width: 100%; padding: 12px; background: #0f0f0f; border: 1px solid #303030; border-radius: 8px; color: #f1f1f1; font-size: 14px;" placeholder="https://example.com/thumbnail.jpg" />
      </div>
      
      <button id="saveVid" style="background: #cc0000; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;">Upload Video</button>
    </div>
  `;
  
  app.innerHTML = '';
  app.appendChild(container);
  
  document.getElementById('saveVid').onclick = () => {
    const title = document.getElementById('u_title').value.trim();
    const channel = document.getElementById('u_channel').value.trim() || 'Your Channel';
    const src = document.getElementById('u_src').value.trim();
    const thumb = document.getElementById('u_thumb').value.trim() || 'https://via.placeholder.com/480x270.png?text=Video';
    
    if (!title || !src) { 
      alert('Please provide both title and video URL'); 
      return;
    }
    
    const videos = loadLocalVideos();
    const id = ensureId();
    const newVideo = {
      id,
      title,
      channel,
      views: Math.floor(Math.random() * 10000),
      likes: Math.floor(Math.random() * 500),
      src,
      thumbnail: thumb,
      description: '',
      duration: 600 + Math.floor(Math.random() * 1800) // 10-40 minutes
    };
    
    videos.unshift(newVideo);
    saveLocalVideos(videos);
    location.hash = `#/watch?id=${id}`;
  };
}

// Navigation and routing
function updateActiveNavItem() {
  const currentHash = location.hash || '#/';
  const navItems = document.querySelectorAll('.guide-item');
  
  navItems.forEach(item => {
    item.classList.remove('active');
    const href = item.getAttribute('href');
    if (href === currentHash || (href === '#/' && currentHash === '#/')) {
      item.classList.add('active');
    }
  });
}

function route(){
  const h = location.hash || '#/';
  
  if (h.startsWith('#/watch')) {
    const id = qs('id');
    renderWatch(id);
  } else if (h.startsWith('#/upload')) {
    renderUpload();
  } else if (h.startsWith('#/trending')) {
    renderTrending();
  } else if (h.startsWith('#/subscriptions')) {
    renderSubscriptions();
  } else if (h.startsWith('#/library')) {
    renderLibrary();
  } else {
    renderHome();
  }
  
  updateActiveNavItem();
}

async function renderTrending() {
  const base = await loadBaseVideos();
  const videos = allVideos(base);
  
  // Sort by views for trending
  const trendingVideos = [...videos].sort((a, b) => b.views - a.views);
  
  const container = document.createElement('div');
  container.className = 'home-container';
  
  const header = document.createElement('h1');
  header.textContent = 'Trending';
  header.style.marginBottom = '24px';
  header.style.fontSize = '24px';
  
  const grid = document.createElement('div');
  grid.className = 'video-grid';
  
  trendingVideos.forEach(video => {
    grid.appendChild(createVideoCard(video));
  });
  
  container.appendChild(header);
  container.appendChild(grid);
  app.innerHTML = '';
  app.appendChild(container);
}

async function renderSubscriptions() {
  const container = document.createElement('div');
  container.className = 'home-container';
  container.innerHTML = `
    <h1 style="margin-bottom: 24px; font-size: 24px;">Subscriptions</h1>
    <p style="color: #aaa;">Subscribe to channels to see their latest videos here!</p>
  `;
  
  app.innerHTML = '';
  app.appendChild(container);
}

async function renderLibrary() {
  const container = document.createElement('div');
  container.className = 'home-container';
  container.innerHTML = `
    <h1 style="margin-bottom: 24px; font-size: 24px;">Library</h1>
    <p style="color: #aaa;">Your saved videos and playlists will appear here!</p>
  `;
  
  app.innerHTML = '';
  app.appendChild(container);
}

// Event listeners
window.addEventListener('hashchange', route);
window.addEventListener('resize', () => {
  if (window.innerWidth <= 1024) {
    guide.style.transform = 'translateX(-240px)';
    document.getElementById('content').style.marginLeft = '0';
  } else {
    guide.style.transform = '';
    guide.classList.toggle('guide-collapsed', !sidebarExpanded);
  }
});

searchInput.addEventListener('input', () => { 
  if (location.hash === '' || location.hash === '#/') {
    renderHome();
  }
});

// Search functionality
document.querySelector('.search-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (location.hash !== '#/' && location.hash !== '') {
    location.hash = '#/';
  } else {
    renderHome();
  }
});

// Initialize application
route();
