const postFiles = ['posts/post1.md', 'posts/post2.md'];

function parseMarkdownPost(markdownText) {
    const titleMatch = markdownText.match(/^#\s+(.+)$/m) || markdownText.match(/^##\s+(.+)$/m) || markdownText.match(/^###\s+(.+)$/m);
    const dateMatch = markdownText.match(/\b\d{1,2}\s+[A-Za-z]+\s+\d{4}\b/) || markdownText.match(/\b\d{4}-\d{2}-\d{2}\b/);
    const categoryMatch = markdownText.match(/Kategori:\s*([^\n]+)/i) || (markdownText.toLowerCase().includes('by admin') ? ['', 'Journal'] : null) || (markdownText.toLowerCase().includes('life') ? ['', 'Life'] : null);

    return {
        title: titleMatch ? titleMatch[1].trim() : 'Untitled note',
        date: dateMatch ? dateMatch[0].trim() : 'Published recently',
        category: categoryMatch && categoryMatch[1] ? categoryMatch[1].trim() : 'Journal'
    };
}

function stripLeadingTitle(markdownText) {
    return markdownText.replace(/^#\s+.*\n+/, '').trim();
}

async function loadPosts() {
    const container = document.getElementById('posts-container');
    if (!container) return;

    container.innerHTML = '<article class="post-card"><div class="post-card-body"><p>Loading notes...</p></div></article>';
    const postsHTML = [];

    for (const file of postFiles) {
        try {
            const response = await fetch(file);
            if (!response.ok) throw new Error(`Could not load ${file}`);
            const markdownText = await response.text();
            const { title, date, category } = parseMarkdownPost(markdownText);
            const htmlContent = marked.parse(stripLeadingTitle(markdownText) || markdownText);

            postsHTML.push(`
                <article class="post-card">
                    <div class="post-card-header">
                        <span class="post-tag">${category}</span>
                        <time class="post-date">${date}</time>
                    </div>
                    <div class="post-card-body">
                        <h2 class="post-card-title">${title}</h2>
                        ${htmlContent}
                    </div>
                    <div class="post-card-footer">
                        <button class="read-more-btn" type="button">Read more</button>
                    </div>
                </article>
            `);
        } catch (error) {
            console.error('Gagal memuat post:', file, error);
        }
    }

    container.innerHTML = postsHTML.join('');
    container.querySelectorAll('.read-more-btn').forEach((button) => {
        button.addEventListener('click', () => {
            const card = button.closest('.post-card');
            const expanded = card.classList.toggle('is-expanded');
            button.textContent = expanded ? 'Collapse' : 'Read more';
        });
    });
}

function setActiveTab(tabName, updateHash = true) {
    document.querySelectorAll('.tab-link').forEach((button) => {
        const isActive = button.dataset.tab === tabName;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-selected', String(isActive));
    });

    document.querySelectorAll('.tab-panel').forEach((panel) => {
        const isActive = panel.dataset.panel === tabName;
        panel.classList.toggle('active', isActive);
        panel.hidden = !isActive;
    });

    if (tabName === 'journal' && !document.querySelector('#posts-container .post-card')) loadPosts();
    if (updateHash) history.replaceState(null, '', `#${tabName}`);
}

function setupTheme() {
    const savedTheme = localStorage.getItem('akhmey-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    updateThemeButton(isDark);

    document.querySelector('.theme-toggle').addEventListener('click', () => {
        const nextDark = document.documentElement.dataset.theme !== 'dark';
        document.documentElement.dataset.theme = nextDark ? 'dark' : 'light';
        localStorage.setItem('akhmey-theme', nextDark ? 'dark' : 'light');
        updateThemeButton(nextDark);
    });
}

function updateThemeButton(isDark) {
    const button = document.querySelector('.theme-toggle');
    if (!button) return;
    button.textContent = isDark ? '☀️' : '🌙';
    button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-tab]').forEach((element) => {
        element.addEventListener('click', () => setActiveTab(element.dataset.tab));
    });

    const initialTab = ['home', 'journal', 'about'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home';
    setActiveTab(initialTab, false);
    setupTheme();
});
