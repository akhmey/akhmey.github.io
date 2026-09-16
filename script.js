// ==========================================
// DAFTAR POSTINGAN KAMU 
// (Tiap nulis post baru, buat file .md di folder posts/, lalu tulis namanya di bawah ini)
// ==========================================
const postFiles = [
    'posts/post1.md',
    'posts/post2.md'
];

async function loadPosts() {
    const container = document.getElementById('posts-container');
    if (!container) return;
    
    container.innerHTML = '<div class="window-box"><div class="window-content"><p>⚡ Loading cyber logs...</p></div></div>';

    let allPostsHTML = '';

    for (let file of postFiles) {
        try {
            const response = await fetch(file);
            if (!response.ok) throw new Error('File tidak ditemukan');
            
            const markdownText = await response.text();
            const htmlContent = marked.parse(markdownText);

            allPostsHTML += `
                <article class="window-box" style="margin-bottom: 15px;">
                    <div class="window-header">
                        <span>📝 ${file.split('/').pop()}</span>
                        <div class="window-controls">_ □ X</div>
                    </div>
                    <div class="window-content post-markdown-body">
                        ${htmlContent}
                    </div>
                </article>
            `;
        } catch (err) {
            console.error('Gagal memuat:', file, err);
        }
    }

    container.innerHTML = allPostsHTML;
}

// Jalankan saat halaman dibuka
document.addEventListener('DOMContentLoaded', loadPosts);

// Efek Judul Tab Berubah saat ditinggal
let originalTitle = document.title;
window.addEventListener('blur', () => {
    document.title = "★ COME BACK TO THE CYBERSPACE ★";
});
window.addEventListener('focus', () => {
    document.title = originalTitle;
});
