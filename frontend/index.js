import { backend } from 'declarations/backend';

const API_KEY = 'YOUR_CRYPTOCOMPARE_API_KEY';
const NEWS_API_URL = `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&api_key=${API_KEY}`;

async function fetchNews() {
    try {
        const response = await fetch(NEWS_API_URL);
        const data = await response.json();
        return data.Data;
    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
}

async function addArticlesToBackend(articles) {
    for (const article of articles) {
        await backend.addArticle(
            article.title,
            article.body,
            article.categories,
            article.published_on,
            article.source,
            article.url
        );
    }
}

async function displayNews() {
    const newsContainer = document.getElementById('news-container');
    const articles = await backend.getAllArticles();
    
    newsContainer.innerHTML = '';
    articles.forEach(article => {
        const articleElement = document.createElement('article');
        articleElement.innerHTML = `
            <h2>${article.title}</h2>
            <p>${article.body}</p>
            <p>Category: ${article.category}</p>
            <p>Source: ${article.source}</p>
            <p>Published: ${new Date(article.publishedAt * 1000).toLocaleString()}</p>
            <a href="${article.url}" target="_blank">Read more</a>
        `;
        newsContainer.appendChild(articleElement);
    });
}

async function displayCategories() {
    const categoriesNav = document.getElementById('categories');
    const categories = await backend.getCategories();
    
    categoriesNav.innerHTML = '<a href="#" data-category="all">All</a>';
    categories.forEach(category => {
        categoriesNav.innerHTML += `<a href="#" data-category="${category}">${category}</a>`;
    });

    categoriesNav.addEventListener('click', async (event) => {
        if (event.target.tagName === 'A') {
            event.preventDefault();
            const category = event.target.dataset.category;
            const newsContainer = document.getElementById('news-container');
            
            if (category === 'all') {
                await displayNews();
            } else {
                const articles = await backend.getArticlesByCategory(category);
                newsContainer.innerHTML = '';
                articles.forEach(article => {
                    const articleElement = document.createElement('article');
                    articleElement.innerHTML = `
                        <h2>${article.title}</h2>
                        <p>${article.body}</p>
                        <p>Category: ${article.category}</p>
                        <p>Source: ${article.source}</p>
                        <p>Published: ${new Date(article.publishedAt * 1000).toLocaleString()}</p>
                        <a href="${article.url}" target="_blank">Read more</a>
                    `;
                    newsContainer.appendChild(articleElement);
                });
            }
        }
    });
}

async function init() {
    const news = await fetchNews();
    await addArticlesToBackend(news);
    await displayCategories();
    await displayNews();
}

init();
