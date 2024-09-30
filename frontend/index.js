const NEWS_API_URL = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN';

const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const newsContainer = document.getElementById('news-container');
const categoriesNav = document.getElementById('categories');

let allNews = [];

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
    categoriesNav.innerHTML = '<a href="#" data-category="all">All</a>';
    Object.keys(categories).forEach(category => {
        categoriesNav.innerHTML += `<a href="#" data-category="${category}">${category}</a>`;
    });
}

function displayNews(articles) {
    newsContainer.innerHTML = '';
    articles.forEach(article => {
        const articleElement = document.createElement('article');
        articleElement.innerHTML = `
            <img src="${article.imageurl}" alt="${article.title}" onerror="this.onerror=null;this.src='placeholder.jpg';">
            <h2>${article.title}</h2>
            <p>${article.body}</p>
            <p>Categories: ${article.categories}</p>
            <p>Source: ${article.source}</p>
            <p>Published: ${new Date(article.published_on * 1000).toLocaleString()}</p>
            <a href="${article.url}" target="_blank">Read more</a>
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
            if (event.target.tagName === 'A') {
                event.preventDefault();
                const category = event.target.dataset.category;
                
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
