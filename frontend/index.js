import { backend } from 'declarations/backend';
import { AuthClient } from "@dfinity/auth-client";

const API_KEY = 'YOUR_CRYPTOCOMPARE_API_KEY'; // Replace with your actual API key
const NEWS_API_URL = `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&api_key=${API_KEY}`;

const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');

async function fetchNews() {
    try {
        const response = await fetch(NEWS_API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched news data:', data);
        return data.Data;
    } catch (error) {
        console.error('Error fetching news:', error);
        throw error;
    }
}

async function addArticlesToBackend(articles) {
    for (const article of articles) {
        try {
            await backend.addArticle(
                article.title,
                article.body,
                article.categories,
                article.published_on,
                article.source,
                article.url
            );
        } catch (error) {
            console.error('Error adding article to backend:', error);
        }
    }
}

async function displayNews() {
    const newsContainer = document.getElementById('news-container');
    try {
        const articles = await backend.getAllArticles();
        console.log('Retrieved articles from backend:', articles);
        
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
    } catch (error) {
        console.error('Error displaying news:', error);
        errorElement.textContent = 'Failed to load news. Please try again later.';
        errorElement.style.display = 'block';
    }
}

async function displayCategories() {
    const categoriesNav = document.getElementById('categories');
    try {
        const categories = await backend.getCategories();
        console.log('Retrieved categories from backend:', categories);
        
        categoriesNav.innerHTML = '<a href="#" data-category="all">All</a>';
        categories.forEach(category => {
            categoriesNav.innerHTML += `<a href="#" data-category="${category}">${category}</a>`;
        });

        categoriesNav.addEventListener('click', async (event) => {
            if (event.target.tagName === 'A') {
                event.preventDefault();
                const category = event.target.dataset.category;
                const newsContainer = document.getElementById('news-container');
                
                try {
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
                } catch (error) {
                    console.error('Error displaying category news:', error);
                    errorElement.textContent = 'Failed to load category news. Please try again later.';
                    errorElement.style.display = 'block';
                }
            }
        });
    } catch (error) {
        console.error('Error displaying categories:', error);
        errorElement.textContent = 'Failed to load categories. Please try again later.';
        errorElement.style.display = 'block';
    }
}

async function init() {
    try {
        loadingElement.style.display = 'block';
        errorElement.style.display = 'none';

        const authClient = await AuthClient.create();
        const isAuthenticated = await authClient.isAuthenticated();

        if (!isAuthenticated) {
            await authClient.login({
                identityProvider: "https://identity.ic0.app/#authorize",
                onSuccess: async () => {
                    const news = await fetchNews();
                    await addArticlesToBackend(news);
                    await displayCategories();
                    await displayNews();
                    loadingElement.style.display = 'none';
                },
            });
        } else {
            const news = await fetchNews();
            await addArticlesToBackend(news);
            await displayCategories();
            await displayNews();
            loadingElement.style.display = 'none';
        }
    } catch (error) {
        console.error('Initialization error:', error);
        loadingElement.style.display = 'none';
        errorElement.textContent = 'Failed to initialize the application. Please try again later.';
        errorElement.style.display = 'block';
    }
}

init();
