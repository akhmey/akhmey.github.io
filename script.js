const postFiles = [
    'posts/post1.md',
    'posts/post2.md'
];

function parseMarkdownPost(markdownText) {
    const titleMatch = markdownText.match(/^#\s+(.+)$/m)
        || markdownText.match(/^##\s+(.+)$/m)
        || markdownText.match(/^###\s+(.+)$/m);

    const dateMatch = markdownText.match(/\b\d{1,2}\s+[A-Za-z]+\s+\d{4}\b/)
        || markdownText.match(/\b\d{4}-\d{2}-\d{2}\b/);

    const categoryMatch = markdownText.match(/Kategori:\s*([^\n]+)/i)
        || (markdownText.toLowerCase().includes('by admin') ? ['','Journal'] : null)
        || (markdownText.toLowerCase().includes('life') ? ['','Life'] : null);

    return {
        title: titleMatch ? titleMatch[1].trim() : 'Untitled note',
        date: dateMatch ? dateMatch[0].trim() : 'Published recently',
        category: categoryMatch && categoryMatch[1] ? categoryMatch[1].trim() : 'Journal'
    };
}

function stripLeadingHeading(markdownText) {
    return markdownText
        .replace(/^#\s+.*\n+/m, '')
        .replace(/^##\s+.*\n+/m, '')
        .replace(/^###\s+.*\n+/m, '')
        .trim();
}

async function loadPosts() {
    const container = document.getElementById('posts-container');
    if (!container) return;

    container.innerHTML = '<article class="post-card"><div class="post-card-body"><p>Loading notes...</p></div></article>';

    const postsHTML = [];

    for (const file of postFiles) {
        try {
            const response = await fetch(file);
            if (!response.ok) throw new Error('File not found');

            const markdownText = await response.text();
            const { title, date, category } = parseMarkdownPost(markdownText);
            const cleanedMarkdown = stripLeadingHeading(markdownText);
            const htmlContent = marked.parse(cleanedMarkdown || markdownText);

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

    const buttons = document.querySelectorAll('.read-more-btn');
    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const card = button.closest('.post-card');
            const expanded = card.classList.toggle('is-expanded');
            button.textContent = expanded ? 'Collapse' : 'Read more';
        });
    });
}

document.addEventListener('DOMContentLoaded', loadPosts);

const navLinks = document.querySelectorAll('.main-nav a');
navLinks.forEach((link) => {
    link.addEventListener('click', () => {
        navLinks.forEach((item) => item.classList.remove('active'));
        link.classList.add('active');
    });
});
