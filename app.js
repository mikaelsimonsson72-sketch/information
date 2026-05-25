// ===================================
// Configuration
// ===================================
const CONFIG = {
    dataPath: './data/',
    currentWeekFile: 'current-week.json',
    upcomingWeeksFile: 'upcoming-weeks.json',
    analyticsFile: 'analytics.json',
    refreshInterval: 300000, // 5 minutes
    storagePrefix: 'veckoinfo_'
};

// ===================================
// State Management
// ===================================
let appState = {
    currentWeek: null,
    upcomingWeeks: null,
    isOnline: navigator.onLine,
    lastUpdate: null,
    deferredPrompt: null
};

// ===================================
// Initialization
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    setupPWA();
    checkOnlineStatus();
});

async function initializeApp() {
    try {
        showLoading();
        await loadAllData();
        hideLoading();
        displayAllContent();
        trackPageView();
        showInfoSection();
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Kunde inte ladda information. Kontrollera din internetanslutning.');
    }
}

// ===================================
// Data Loading
// ===================================
async function loadAllData() {
    try {
        // Load current week data
        const currentWeekResponse = await fetch(`${CONFIG.dataPath}${CONFIG.currentWeekFile}`);
        if (!currentWeekResponse.ok) throw new Error('Failed to load current week data');
        appState.currentWeek = await currentWeekResponse.json();

        // Load upcoming weeks data
        const upcomingWeeksResponse = await fetch(`${CONFIG.dataPath}${CONFIG.upcomingWeeksFile}`);
        if (!upcomingWeeksResponse.ok) throw new Error('Failed to load upcoming weeks data');
        appState.upcomingWeeks = await upcomingWeeksResponse.json();

        appState.lastUpdate = new Date();
        
        // Cache data for offline use
        cacheData();
    } catch (error) {
        console.error('Error loading data:', error);
        // Try to load from cache
        const cachedData = loadFromCache();
        if (cachedData) {
            appState.currentWeek = cachedData.currentWeek;
            appState.upcomingWeeks = cachedData.upcomingWeeks;
            appState.lastUpdate = new Date(cachedData.timestamp);
        } else {
            throw error;
        }
    }
}

// ===================================
// Display Functions
// ===================================
function displayAllContent() {
    displayCurrentWeek();
    displayUpcomingWeeks();
}

function displayCurrentWeek() {
    if (!appState.currentWeek) return;

    const section = document.getElementById('current-week-section');
    const badge = document.getElementById('current-week-badge');
    const title = document.getElementById('current-week-title');
    const updated = document.getElementById('current-week-updated');
    const content = document.getElementById('current-week-content');

    // Show section
    section.style.display = 'block';

    // Set week badge
    badge.textContent = `Vecka ${appState.currentWeek.weekNumber}`;

    // Set title
    title.textContent = appState.currentWeek.title || `Vecka ${appState.currentWeek.weekNumber}`;

    // Set last updated
    const updateDate = new Date(appState.currentWeek.lastUpdated);
    updated.textContent = `Uppdaterad: ${formatDate(updateDate)}`;

    // Set content
    let contentHTML = '';
    
    // Main content
    if (appState.currentWeek.content) {
        contentHTML += `<p>${formatText(appState.currentWeek.content)}</p>`;
    }

    // Sections
    if (appState.currentWeek.sections && appState.currentWeek.sections.length > 0) {
        appState.currentWeek.sections.forEach(section => {
            contentHTML += `
                <h4>${section.heading}</h4>
                <p>${formatText(section.text)}</p>
            `;
        });
    }

    content.innerHTML = contentHTML;
}

function displayUpcomingWeeks() {
    if (!appState.upcomingWeeks || !appState.upcomingWeeks.weeks) return;

    const section = document.getElementById('upcoming-weeks-section');
    const container = document.getElementById('upcoming-weeks-content');

    // Show section
    section.style.display = 'block';

    // Clear existing content
    container.innerHTML = '';

    // Display each upcoming week
    appState.upcomingWeeks.weeks.forEach(week => {
        const card = createUpcomingWeekCard(week);
        container.appendChild(card);
    });
}

function createUpcomingWeekCard(week) {
    const card = document.createElement('div');
    card.className = 'upcoming-week-card';
    
    card.innerHTML = `
        <div class="upcoming-week-header">
            <h3 class="upcoming-week-title">Vecka ${week.weekNumber}</h3>
            <span class="upcoming-week-number">V${week.weekNumber}</span>
        </div>
        <div class="upcoming-week-summary">
            ${formatText(week.summary)}
        </div>
    `;
    
    return card;
}

// ===================================
// UI State Management
// ===================================
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('error').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(message) {
    hideLoading();
    document.getElementById('error').style.display = 'block';
    document.getElementById('error-text').textContent = message;
}

function showInfoSection() {
    // Show info section after a delay
    setTimeout(() => {
        const infoSection = document.getElementById('info-section');
        if (infoSection) {
            infoSection.style.display = 'block';
        }
    }, 1000);
}

// ===================================
// Analytics & Tracking
// ===================================
function trackPageView() {
    if (!appState.currentWeek) return;

    const weekKey = `${appState.currentWeek.year}-W${appState.currentWeek.weekNumber}`;
    const storageKey = `${CONFIG.storagePrefix}viewed_${weekKey}`;
    const today = new Date().toDateString();
    const lastView = localStorage.getItem(storageKey);

    // Only track once per day
    if (lastView !== today) {
        localStorage.setItem(storageKey, today);
        incrementViewCount(weekKey);
    }
}

function incrementViewCount(weekKey) {
    // In a real implementation, this would send data to a server
    // For static site, we store locally
    const analyticsKey = `${CONFIG.storagePrefix}analytics`;
    let analytics = JSON.parse(localStorage.getItem(analyticsKey) || '{}');
    
    if (!analytics[weekKey]) {
        analytics[weekKey] = { views: 0, lastViewed: null };
    }
    
    analytics[weekKey].views++;
    analytics[weekKey].lastViewed = new Date().toISOString();
    
    localStorage.setItem(analyticsKey, JSON.stringify(analytics));
}

// ===================================
// Caching
// ===================================
function cacheData() {
    const cacheData = {
        currentWeek: appState.currentWeek,
        upcomingWeeks: appState.upcomingWeeks,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(`${CONFIG.storagePrefix}cache`, JSON.stringify(cacheData));
}

function loadFromCache() {
    try {
        const cached = localStorage.getItem(`${CONFIG.storagePrefix}cache`);
        return cached ? JSON.parse(cached) : null;
    } catch (error) {
        console.error('Error loading from cache:', error);
        return null;
    }
}

// ===================================
// Online/Offline Status
// ===================================
function checkOnlineStatus() {
    updateConnectionStatus();
    
    window.addEventListener('online', () => {
        appState.isOnline = true;
        updateConnectionStatus();
        loadAllData().then(() => {
            displayAllContent();
        });
    });
    
    window.addEventListener('offline', () => {
        appState.isOnline = false;
        updateConnectionStatus();
    });
}

function updateConnectionStatus() {
    const statusElement = document.getElementById('connection-status');
    if (appState.isOnline) {
        statusElement.textContent = '● Online';
        statusElement.className = 'status-online';
    } else {
        statusElement.textContent = '● Offline';
        statusElement.className = 'status-offline';
    }
}

// ===================================
// PWA Installation
// ===================================
function setupPWA() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        appState.deferredPrompt = e;
        showInstallPrompt();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
        console.log('PWA installed successfully');
        hideInstallPrompt();
        appState.deferredPrompt = null;
    });
}

function showInstallPrompt() {
    const prompt = document.getElementById('install-prompt');
    const installButton = document.getElementById('install-button');
    const dismissButton = document.getElementById('dismiss-install');

    // Check if user has dismissed before
    const dismissed = localStorage.getItem(`${CONFIG.storagePrefix}install_dismissed`);
    if (dismissed) return;

    prompt.style.display = 'block';

    installButton.addEventListener('click', async () => {
        if (!appState.deferredPrompt) return;

        appState.deferredPrompt.prompt();
        const { outcome } = await appState.deferredPrompt.userChoice;
        
        console.log(`User response to install prompt: ${outcome}`);
        appState.deferredPrompt = null;
        hideInstallPrompt();
    });

    dismissButton.addEventListener('click', () => {
        hideInstallPrompt();
        localStorage.setItem(`${CONFIG.storagePrefix}install_dismissed`, 'true');
    });
}

function hideInstallPrompt() {
    const prompt = document.getElementById('install-prompt');
    prompt.style.display = 'none';
}

// ===================================
// Event Listeners
// ===================================
function setupEventListeners() {
    // Auto-refresh data periodically
    setInterval(() => {
        if (appState.isOnline) {
            loadAllData().then(() => {
                displayAllContent();
            }).catch(error => {
                console.error('Auto-refresh failed:', error);
            });
        }
    }, CONFIG.refreshInterval);

    // Pull to refresh (for mobile)
    let touchStartY = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchmove', (e) => {
        const touchY = e.touches[0].clientY;
        const touchDiff = touchY - touchStartY;

        if (touchDiff > 100 && window.scrollY === 0) {
            location.reload();
        }
    });
}

// ===================================
// Utility Functions
// ===================================
function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('sv-SE', options);
}

function formatText(text) {
    if (!text) return '';
    
    // Convert line breaks to <br>
    text = text.replace(/\n/g, '<br>');
    
    // Convert URLs to links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    text = text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Convert email addresses to mailto links
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g;
    text = text.replace(emailRegex, '<a href="mailto:$1">$1</a>');
    
    return text;
}

function getCurrentWeekNumber() {
    const date = new Date();
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// ===================================
// Service Worker Registration
// ===================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// ===================================
// Export for testing (if needed)
// ===================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatDate,
        formatText,
        getCurrentWeekNumber
    };
}

// Made with Bob
