const postFiles = ['posts/post1.md', 'posts/post2.md'];

function parseMarkdownPost(markdownText) {
    const titleMatch = markdownText.match(/^#\s+(.+)$/m)
        || markdownText.match(/^##\s+(.+)$/m)
        || markdownText.match(/^###\s+(.+)$/m);
    const dateMatch = markdownText.match(/\b\d{1,2}\s+[A-Za-z]+\s+\d{4}\b/)
        || markdownText.match(/\b\d{4}-\d{2}-\d{2}\b/);
    const categoryMatch = markdownText.match(/Kategori:\s*([^\n]+)/i);

    return {
        title: titleMatch ? titleMatch[1].trim() : 'Untitled note',
        date: dateMatch ? dateMatch[0].trim() : 'Published recently',
        category: categoryMatch ? categoryMatch[1].trim() : 'Journal'
    };
}

// Hanya hapus H1 pertama karena judulnya sudah ditampilkan di card.
// Semua heading H2/H3 di dalam artikel tetap dipertahankan.
function removeArticleTitle(markdownText) {
    return markdownText.replace(/^#\s+[^\n]+\n+/, '').trim();
}

async function loadPosts() {
    const container = document.getElementById('posts-container');
    if (!container || typeof marked === 'undefined') return;

    container.innerHTML = '<article class="post-card"><div class="post-card-body"><p>Loading notes...</p></div></article>';
    const postsHTML = [];

    for (const file of postFiles) {
        try {
            const response = await fetch(file);
            if (!response.ok) throw new Error(`Could not load ${file}`);

            const markdownText = await response.text();
            const post = parseMarkdownPost(markdownText);
            const htmlContent = marked.parse(removeArticleTitle(markdownText));

            postsHTML.push(`
                <article class="post-card">
                    <div class="post-card-header">
                        <span class="post-tag">${post.category}</span>
                        <time class="post-date">${post.date}</time>
                    </div>
                    <div class="post-card-body">
                        <h2 class="post-card-title">${post.title}</h2>
                        ${htmlContent}
                    </div>
                    <div class="post-card-footer">
                        <button class="read-more-btn" type="button" aria-expanded="false">Read more</button>
                    </div>
                </article>
            `);
        } catch (error) {
            console.error(`Gagal memuat ${file}:`, error);
            postsHTML.push(`<article class="post-card error-card"><div class="post-card-body"><p>Post gagal dimuat: ${file}</p></div></article>`);
        }
    }

    container.innerHTML = postsHTML.join('');

    container.querySelectorAll('.read-more-btn').forEach((button) => {
        button.addEventListener('click', () => {
            const card = button.closest('.post-card');
            const expanded = card.classList.toggle('is-expanded');
            button.textContent = expanded ? 'Collapse' : 'Read more';
            button.setAttribute('aria-expanded', String(expanded));
        });
    });
}

function setActiveTab(tabName, updateHash = true) {
    const validTabs = ['home', 'journal', 'about'];
    const activeTab = validTabs.includes(tabName) ? tabName : 'home';

    document.querySelectorAll('.tab-link').forEach((button) => {
        const active = button.dataset.tab === activeTab;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', String(active));
    });

    document.querySelectorAll('.tab-panel').forEach((panel) => {
        const active = panel.dataset.panel === activeTab;
        panel.classList.toggle('active', active);
        panel.hidden = !active;
    });

    if (activeTab === 'journal' && !document.querySelector('#posts-container .post-card')) {
        loadPosts();
    }

    if (updateHash) history.replaceState(null, '', `#${activeTab}`);
}

function setupTheme() {
    const themeButton = document.querySelector('.theme-toggle');
    if (!themeButton) return;

    const savedTheme = localStorage.getItem('akhmey-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;

    applyTheme(isDark);
    themeButton.addEventListener('click', () => {
        const nextDark = document.documentElement.dataset.theme !== 'dark';
        applyTheme(nextDark);
        localStorage.setItem('akhmey-theme', nextDark ? 'dark' : 'light');
    });
}

function applyTheme(isDark) {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    const button = document.querySelector('.theme-toggle');
    if (button) {
        button.textContent = isDark ? '☀️' : '🌙';
        button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-tab]').forEach((element) => {
        element.addEventListener('click', () => setActiveTab(element.dataset.tab));
    });

    const initialTab = location.hash.slice(1);
    setActiveTab(initialTab, false);
    setupTheme();
});
