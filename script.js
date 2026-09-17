const postFiles = ['posts/post1.md', 'posts/post2.md'];

function escapeHTML(value) {
  return value.replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
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

function renderArticle(post, markdown) {
  const reader = document.getElementById('reader-view');
  document.getElementById('reader-category').textContent = post.category;
  document.getElementById('reader-date').textContent = post.date;
  document.getElementById('reader-title').textContent = post.title;
  document.getElementById('reader-content').innerHTML = marked.parse(removeMainTitle(markdown));
  document.getElementById('portal-view').hidden = true;
  document.querySelector('.portal-header').hidden = true;
  document.querySelector('.notice-bar').hidden = true;
  reader.hidden = false;
  window.scrollTo({top: 0, behavior: 'smooth'});
  history.pushState({reader: true}, '', '#article');
}

function closeArticle() {
  document.getElementById('reader-view').hidden = true;
  document.getElementById('portal-view').hidden = false;
  document.querySelector('.portal-header').hidden = false;
  document.querySelector('.notice-bar').hidden = false;
  history.pushState({}, '', '#journal');
  window.scrollTo({top: 0, behavior: 'smooth'});
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
      const previewImage = post.image ? `<img class="post-preview-image" src="${escapeHTML(post.image)}" alt="Thumbnail for ${escapeHTML(post.title)}" loading="lazy">` : '';
      cards.push(`<article class="post-card"><div class="post-card-header"><span class="post-tag">${escapeHTML(post.category)}</span><time class="post-date">${escapeHTML(post.date)}</time></div><div class="post-card-body">${previewImage}<h2 class="post-card-title">${escapeHTML(post.title)}</h2><p class="post-excerpt">Open the clean reading view to read this entry.</p></div><div class="post-card-footer"><button class="read-more-btn" type="button" data-file="${escapeHTML(file)}">Read article →</button></div></article>`);
    } catch (error) {
      console.error('Gagal memuat post:', error);
      cards.push(`<article class="post-card error-card"><div class="post-card-body">Post gagal dimuat: ${escapeHTML(file)}</div></article>`);
    }
  }

  container.innerHTML = cards.join('');
  container.querySelectorAll('.read-more-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const response = await fetch(button.dataset.file);
      const markdown = await response.text();
      renderArticle(parsePost(markdown), markdown);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('back-to-portal').addEventListener('click', closeArticle);
  loadPosts();
});

window.addEventListener('popstate', () => {
  if (location.hash !== '#article') closeArticle();
});

let originalTitle = document.title;
window.addEventListener('blur', () => { document.title = 'AKHMEY | come back soon'; });
window.addEventListener('focus', () => { document.title = originalTitle; });
