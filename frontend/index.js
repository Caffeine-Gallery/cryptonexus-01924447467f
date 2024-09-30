import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory as commentsIdlFactory } from "./declarations/comments/comments.did.js";

const NEWS_API_URL = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN';
const PRICE_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple,cardano,polkadot&vs_currencies=usd&include_24hr_change=true';

const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const newsContainer = document.getElementById('news-container');
const categoriesNav = document.getElementById('categories');
const tickerElement = document.querySelector('.ticker');
const gridViewButton = document.getElementById('grid-view');
const listViewButton = document.getElementById('list-view');
const commentModal = document.getElementById('comment-modal');
const commentArticleTitle = document.getElementById('comment-article-title');
const commentsContainer = document.getElementById('comments-container');
const commentForm = document.getElementById('comment-form');
const commentInput = document.getElementById('comment-input');

let allNews = [];
let currentView = 'grid';
let currentArticleId = null;
let commentsActor;

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

async function initializeCommentsActor() {
    const agent = new HttpAgent();
    commentsActor = Actor.createActor(commentsIdlFactory, {
        agent,
        canisterId: process.env.COMMENTS_CANISTER_ID,
    });
}

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

async function fetchPrices() {
    try {
        const response = await fetch(PRICE_API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching prices:', error);
        throw error;
    }
}

function updatePriceTicker(prices) {
    let tickerContent = '';
    for (const [coin, data] of Object.entries(prices)) {
        const priceChange = data.usd_24h_change;
        const changeClass = priceChange >= 0 ? 'price-up' : 'price-down';
        const changeIcon = priceChange >= 0 ? '▲' : '▼';
        tickerContent += `<span class="ticker__item ${changeClass}">${coin.toUpperCase()}: $${data.usd.toFixed(2)} ${changeIcon} ${Math.abs(priceChange).toFixed(2)}%</span>`;
    }
    tickerElement.innerHTML = tickerContent;
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
    
    if (categories['ICP']) {
        const icon = categoryIcons['ICP'];
        categoriesNav.innerHTML += `<a href="#" data-category="ICP"><i class="${icon}"></i> ICP</a>`;
    }
    
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
                <div class="article-actions">
                    <a href="${article.url}" target="_blank" class="read-more">Read more</a>
                    <button class="comment-button" data-article-id="${article.id}"><i class="fas fa-comment"></i> Comments</button>
                </div>
            </div>
        `;
        newsContainer.appendChild(articleElement);
    });

    document.querySelectorAll('.comment-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const articleId = event.target.closest('.comment-button').dataset.articleId;
            openCommentModal(articleId);
        });
    });
}

function filterTodayNews(news) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return news.filter(article => {
        const articleDate = new Date(article.published_on * 1000);
        articleDate.setHours(0, 0, 0, 0);
        return articleDate.getTime() === today.getTime();
    });
}

function switchView(view) {
    currentView = view;
    newsContainer.className = `${view}-view`;
    if (view === 'grid') {
        gridViewButton.classList.add('active');
        listViewButton.classList.remove('active');
    } else {
        listViewButton.classList.add('active');
        gridViewButton.classList.remove('active');
    }
    localStorage.setItem('preferredView', view);
}

async function openCommentModal(articleId) {
    currentArticleId = articleId;
    const article = allNews.find(a => a.id === articleId);
    commentArticleTitle.textContent = article.title;
    await displayComments(articleId);
    commentModal.style.display = 'block';
}

function closeCommentModal() {
    commentModal.style.display = 'none';
    currentArticleId = null;
}

async function displayComments(articleId) {
    const comments = await getCommentsForArticle(articleId);
    commentsContainer.innerHTML = '';
    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');
        commentElement.textContent = comment.content;
        commentsContainer.appendChild(commentElement);
    });
}

async function getCommentsForArticle(articleId) {
    try {
        return await commentsActor.getComments(articleId);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return [];
    }
}

async function addComment(articleId, content) {
    try {
        await commentsActor.addComment(articleId, content);
        await displayComments(articleId);
    } catch (error) {
        console.error('Error adding comment:', error);
    }
}

async function init() {
    try {
        loadingElement.style.display = 'block';
        errorElement.style.display = 'none';

        await initializeCommentsActor();

        let fetchedNews = await fetchNews();
        allNews = filterTodayNews(fetchedNews);
        
        if (allNews.length === 0) {
            errorElement.textContent = 'No news available for today. Please check back later.';
            errorElement.style.display = 'block';
            loadingElement.style.display = 'none';
            return;
        }

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

        const prices = await fetchPrices();
        updatePriceTicker(prices);

        setInterval(async () => {
            const updatedPrices = await fetchPrices();
            updatePriceTicker(updatedPrices);
        }, 300000);

        gridViewButton.addEventListener('click', () => switchView('grid'));
        listViewButton.addEventListener('click', () => switchView('list'));

        const preferredView = localStorage.getItem('preferredView') || 'grid';
        switchView(preferredView);

        commentForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const comment = commentInput.value.trim();
            if (comment && currentArticleId) {
                await addComment(currentArticleId, comment);
                commentInput.value = '';
            }
        });

        document.querySelector('.close').addEventListener('click', closeCommentModal);

        window.addEventListener('click', (event) => {
            if (event.target === commentModal) {
                closeCommentModal();
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
