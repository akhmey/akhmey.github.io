const postFiles = ['posts/post1.md', 'posts/post2.md'];

function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function parsePost(markdown) {
  const title = (markdown.match(/^#\s+(.+)$/m) || markdown.match(/^###\s+(.+)$/m) || [null, 'Untitled note'])[1].trim();
  const date = (markdown.match(/\b\d{1,2}\s+[A-Za-z]+\s+\d{4}\b/) || markdown.match(/\b\d{4}-\d{2}-\d{2}\b/) || [null, 'Published recently'])[0];
  const category = (markdown.match(/Kategori:\s*([^\n]+)/i) || (markdown.toLowerCase().includes('life') ? [null, 'Life'] : [null, 'Journal']))[1].trim();
  const image = markdown.match(/!\[[^\]]*\]\(([^)]+)\)/);
  return { title, date, category, image: image ? image[1] : '' };
}

function removeMainTitle(markdown) {
  return markdown.replace(/^#\s+[^\n]+\n+/, '').trim();
}

function showReader(post, markdown) {
  const reader = document.getElementById('reader-view');
  document.getElementById('reader-category').textContent = post.category;
  document.getElementById('reader-date').textContent = post.date;
  document.getElementById('reader-title').textContent = post.title;
  document.getElementById('reader-content').innerHTML = marked.parse(removeMainTitle(markdown));
  document.getElementById('portal-view').hidden = true;
  document.querySelector('.portal-header').hidden = true;
  document.querySelector('.notice-bar').hidden = true;
  reader.hidden = false;
  window.scrollTo(0, 0);
}

function openArticleInNewTab(file) {
  const url = `${window.location.origin}${window.location.pathname}?article=${encodeURIComponent(file)}`;
  window.open(url, '_blank', 'noopener');
}

function closeArticle() {
  window.location.href = `${window.location.pathname}#journal`;
}

async function loadArticleFromQuery() {
  const file = new URLSearchParams(window.location.search).get('article');
  if (!file || !postFiles.includes(file) || typeof marked === 'undefined') return false;

  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error(file);
    const markdown = await response.text();
    showReader(parsePost(markdown), markdown);
    return true;
  } catch (error) {
    console.error('Gagal membuka artikel:', error);
    return false;
  }
}

async function loadPosts() {
  const container = document.getElementById('posts-container');
  if (!container || typeof marked === 'undefined') return;

  container.innerHTML = '<div class="loading">Loading journal...</div>';
  const cards = [];

  for (const file of postFiles) {
    try {
      const response = await fetch(file);
      if (!response.ok) throw new Error(file);
      const markdown = await response.text();
      const post = parsePost(markdown);
      const thumbnail = post.image
        ? `<img class="post-preview-image" src="${escapeHTML(post.image)}" alt="Thumbnail: ${escapeHTML(post.title)}" loading="lazy">`
        : '<div class="post-preview-placeholder">AKHMEY</div>';

      cards.push(`
        <article class="post-card">
          <div class="post-card-header">
            <span class="post-tag">${escapeHTML(post.category)}</span>
            <time class="post-date">${escapeHTML(post.date)}</time>
          </div>
          <div class="post-card-row">
            <div class="post-thumbnail">${thumbnail}</div>
            <div class="post-summary">
              <h2 class="post-card-title">${escapeHTML(post.title)}</h2>
              <p class="post-excerpt">Catatan pribadi, cerita, dan hal-hal random dari AKHMEY.</p>
              <button class="read-more-btn" type="button" data-file="${escapeHTML(file)}">Baca artikel ↗</button>
            </div>
          </div>
        </article>
      `);
    } catch (error) {
      console.error('Gagal memuat post:', error);
      cards.push(`<article class="post-card error-card"><div class="post-card-body">Post gagal dimuat: ${escapeHTML(file)}</div></article>`);
    }
  }

  container.innerHTML = cards.join('');
  container.querySelectorAll('.read-more-btn').forEach((button) => {
    button.addEventListener('click', () => openArticleInNewTab(button.dataset.file));
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const backButton = document.getElementById('back-to-portal');
  if (backButton) backButton.addEventListener('click', closeArticle);

  const openedArticle = await loadArticleFromQuery();
  if (!openedArticle) loadPosts();
});

let originalTitle = document.title;
window.addEventListener('blur', () => { document.title = 'AKHMEY | come back soon'; });
window.addEventListener('focus', () => { document.title = originalTitle; });
