// ==========================================
// DAFTAR POSTINGAN KAMU 
// ==========================================
const postFiles = [
    'posts/post1.md',
    'posts/post2.md'
];

async function loadPosts() {
    const container = document.getElementById('posts-container');
    if (!container) return;
    
    container.innerHTML = '<div class="window-box" style="grid-column: 1/-1;"><div class="window-content"><p>⚡ Loading cyber logs...</p></div></div>';

    let allPostsHTML = '';

    for (let index = 0; index < postFiles.length; index++) {
        let file = postFiles[index];
        try {
            const response = await fetch(file);
            if (!response.ok) throw new Error('File tidak ditemukan');
            
            const markdownText = await response.text();
            const htmlContent = marked.parse(markdownText);
            const fileName = file.split('/').pop();

            // Membuat card preview ringkas agar tidak bikin scroll panjang
            allPostsHTML += `
                <article class="window-box post-card" id="post-${index}">
                    <div class="window-header">
                        <span>📝 ${fileName}</span>
                        <div class="window-controls">_ □ X</div>
                    </div>
                    <div class="window-content post-preview-body">
                        <div class="post-snippet">
                            ${htmlContent}
                        </div>
                        <div class="read-more-overlay"></div>
                        <button class="y2k-btn expand-btn" onclick="togglePost(${index})">EXPAND LOG</button>
                    </div>
                </article>
            `;
        } catch (err) {
            console.error('Gagal memuat:', file, err);
        }
    }

    container.innerHTML = allPostsHTML;
}

// Fungsi toggle expand/collapse card post agar tidak kepanjangan
function togglePost(index) {
    const postCard = document.getElementById(`post-${index}`);
    const snippet = postCard.querySelector('.post-snippet');
    const btn = postCard.querySelector('.expand-btn');

    postCard.classList.toggle('expanded');
    if (postCard.classList.contains('expanded')) {
        btn.textContent = 'COLLAPSE LOG';
    } else {
        btn.textContent = 'EXPAND LOG';
        postCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
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