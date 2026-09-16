const postFiles = [
    'posts/post1.md',
    'posts/post2.md'
];

function parseMarkdownPost(markdownText) {
    const titleMatch = markdownText.match(/^#\s+(.+)$/m) ||
        markdownText.match(/^###\s+(.+)$/m) ||
        markdownText.match(/^##\s+(.+)$/m);

    const dateMatch = markdownText.match(/\b(\d{1,2}\s+[A-Za-z]+\s+\d{4})\b/) ||
        markdownText.match(/\b(\d{4}-\d{2}-\d{2})\b/);

    const categoryMatch = markdownText.match(/Kategori:\s*([^\n]+)/i) ||
        markdownText.match(/by\s+([^\n]+)/i);

    return {
        title: titleMatch ? titleMatch[1].trim() : 'Untitled Post',
        date: dateMatch ? dateMatch[1].trim() : '',
        category: categoryMatch ? categoryMatch[1].trim() : 'Writing'
    };
}

async function loadPosts() {
    const container = document.getElementById('posts-container');
    if (!container) return;

    container.innerHTML = '<article class="post-card"><div class="post-card-body"><p>Loading posts...</p></div></article>';

    const postsHTML = [];

    for (const file of postFiles) {
        try {
            const response = await fetch(file);
            if (!response.ok) throw new Error('File not found');

            const markdownText = await response.text();
            const { title, date, category } = parseMarkdownPost(markdownText);
            const htmlContent = marked.parse(markdownText);

            postsHTML.push(`
                <article class="post-card">
                    <div class="post-card-header">
                        <span class="post-tag">${category}</span>
                        <time class="post-date">${date || 'Published recently'}</time>
                    </div>
                    <div class="post-card-body">
                        <h2>${title}</h2>
                        ${htmlContent}
                    </div>
                    <div class="post-card-footer">
                        <button class="read-more-btn" type="button">Baca selengkapnya</button>
                    </div>
                </article>
            `);
        } catch (error) {
            console.error('Gagal memuat post:', file, error);
        }
    }

    container.innerHTML = postsHTML.join('');

    const buttons = document.querySelectorAll('.read-more-btn');
    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const card = button.closest('.post-card');
            const isExpanded = card.classList.toggle('is-expanded');
            button.textContent = isExpanded ? 'Sembunyikan' : 'Baca selengkapnya';
        });
    });
}

document.addEventListener('DOMContentLoaded', loadPosts);

window.addEventListener('load', () => {
    document.body.classList.add('is-ready');
});

const navLinks = document.querySelectorAll('.main-nav a');
navLinks.forEach((link) => {
    link.addEventListener('click', () => {
        navLinks.forEach((item) => item.classList.remove('active'));
        link.classList.add('active');
    });
});























































































































































































































