const NEWS_API_URL = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN';

const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const newsContainer = document.getElementById('news-container');
const categoriesNav = document.getElementById('categories');

let allNews = [];

const categoryIcons = {
    'Blockchain': 'fas fa-link',
    'Bitcoin': 'fab fa-bitcoin',
    'Ethereum': 'fab fa-ethereum',
    'Altcoin': 'fas fa-coins',
    'Trading': 'fas fa-chart-line',
    'Mining': 'fas fa-microchip',
    'ICO': 'fas fa-rocket',
    'Regulation': 'fas fa-gavel',
    'Exchange': 'fas fa-exchange-alt',
    'Wallet': 'fas fa-wallet',
    'ICP': 'fas fa-infinity',
    'Default': 'fas fa-newspaper'
};

async function fetchNews() {
    try {
        const response = await fetch(NEWS_API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.Data;
    } catch (error) {
        console.error('Error fetching news:', error);
        throw error;
    }
}

function categorizeNews(news) {
    const categories = {};
    news.forEach(article => {
        article.categories.split('|').forEach(category => {
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(article);
        });
    });
    return categories;
}

function displayCategories(categories) {
    categoriesNav.innerHTML = '<a href="#" data-category="all"><i class="fas fa-globe"></i> All</a>';
    
    // Add ICP category if it exists
    if (categories['ICP']) {
        const icon = categoryIcons['ICP'];
        categoriesNav.innerHTML += `<a href="#" data-category="ICP"><i class="${icon}"></i> ICP</a>`;
    }
    
    // Add other categories
    Object.keys(categories).forEach(category => {
        if (category !== 'ICP') {
            const icon = categoryIcons[category] || categoryIcons['Default'];
            categoriesNav.innerHTML += `<a href="#" data-category="${category}"><i class="${icon}"></i> ${category}</a>`;
        }
    });
}

function displayNews(articles) {
    newsContainer.innerHTML = '';
    articles.forEach(article => {
        const articleElement = document.createElement('article');
        articleElement.innerHTML = `
            <div class="article-image" style="background-image: url('${article.imageurl}')"></div>
            <div class="article-content">
                <h2>${article.title}</h2>
                <p>${article.body.substring(0, 150)}...</p>
                <div class="article-meta">
                    <span class="article-author"><i class="fas fa-user"></i> ${article.source}</span>
                    <span class="article-date"><i class="far fa-clock"></i> ${new Date(article.published_on * 1000).toLocaleString()}</span>
                </div>
                <div class="article-tags">
                    ${article.categories.split('|').map(tag => `<span class="tag">${tag.trim()}</span>`).join('')}
                </div>
                <a href="${article.url}" target="_blank" class="read-more">Read more</a>
            </div>
        `;
        newsContainer.appendChild(articleElement);
    });
}

async function init() {
    try {
        loadingElement.style.display = 'block';
        errorElement.style.display = 'none';

        allNews = await fetchNews();
        const categorizedNews = categorizeNews(allNews);
        
        displayCategories(categorizedNews);
        displayNews(allNews);

        categoriesNav.addEventListener('click', (event) => {
            if (event.target.tagName === 'A' || event.target.parentElement.tagName === 'A') {
                event.preventDefault();
                const categoryElement = event.target.tagName === 'A' ? event.target : event.target.parentElement;
                const category = categoryElement.dataset.category;
                
                if (category === 'all') {
                    displayNews(allNews);
                } else {
                    displayNews(categorizedNews[category] || []);
                }
            }
        });

        loadingElement.style.display = 'none';
    } catch (error) {
        console.error('Initialization error:', error);
        loadingElement.style.display = 'none';
        errorElement.textContent = 'Failed to load news. Please try again later.';
        errorElement.style.display = 'block';
    }
}

init();
