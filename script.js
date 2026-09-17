const postFiles = ['posts/post1.md', 'posts/post2.md'];

function parsePost(markdown) {
  const title = (markdown.match(/^#\s+(.+)$/m) || markdown.match(/^###\s+(.+)$/m) || [null, 'Untitled note'])[1].trim();
  const date = (markdown.match(/\b\d{1,2}\s+[A-Za-z]+\s+\d{4}\b/) || markdown.match(/\b\d{4}-\d{2}-\d{2}\b/) || [null, 'Published recently'])[0];
  const category = (markdown.match(/Kategori:\s*([^\n]+)/i) || [null, 'Journal'])[1].trim();
  return {title, date, category};
}

function removeMainTitle(markdown) {
  return markdown.replace(/^#\s+[^\n]+\n+/, '').trim();
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
      cards.push(`<article class="post-card"><div class="post-card-header"><span class="post-tag">${post.category}</span><time class="post-date">${post.date}</time></div><div class="post-card-body"><h2 class="post-card-title">${post.title}</h2>${marked.parse(removeMainTitle(markdown))}</div><div class="post-card-footer"><button class="read-more-btn" type="button" aria-expanded="false">Read more</button></div></article>`);
    } catch (error) {
      console.error('Gagal memuat post:', error);
      cards.push(`<article class="post-card error-card"><div class="post-card-body">Post gagal dimuat: ${file}</div></article>`);
    }
  }

  container.innerHTML = cards.join('');
  container.querySelectorAll('.read-more-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.post-card');
      const expanded = card.classList.toggle('is-expanded');
      button.textContent = expanded ? 'Collapse' : 'Read more';
      button.setAttribute('aria-expanded', String(expanded));
    });
  });
}

document.addEventListener('DOMContentLoaded', loadPosts);

let originalTitle = document.title;
window.addEventListener('blur', () => { document.title = 'AKHMEY | come back soon'; });
window.addEventListener('focus', () => { document.title = originalTitle; });
