// DOM Elements
const amountInput = document.getElementById('amount');
const fromCurrency = document.getElementById('fromCurrency');
const toCurrency = document.getElementById('toCurrency');
const fromCurrencyBadge = document.getElementById('fromCurrencyBadge');
const swapBtn = document.getElementById('swapBtn');
const convertBtn = document.getElementById('convertBtn');
const resultSpan = document.getElementById('convertedAmount');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const rateDisplay = document.getElementById('rateDisplay');
const updateTimeSpan = document.getElementById('updateTime');
const currentDateSpan = document.getElementById('currentDate');
const themeToggleNav = document.getElementById('themeToggleNav');
const themeText = document.getElementById('themeText');

// Stats elements
const pkrSarRate = document.getElementById('pkrSarRate');
const pkrUsdRate = document.getElementById('pkrUsdRate');
const pkrInrRate = document.getElementById('pkrInrRate');
const sarPkrRate = document.getElementById('sarPkrRate');

// Fixed rates (approximate)
const RATES = {
    'PKR': { 'SAR': 0.0135, 'USD': 0.0036, 'INR': 0.30 },
    'SAR': { 'PKR': 74.07, 'USD': 0.27, 'INR': 22.22 },
    'USD': { 'PKR': 277.78, 'SAR': 3.75, 'INR': 83.33 },
    'INR': { 'PKR': 3.33, 'SAR': 0.045, 'USD': 0.012 }
};

// History array
let conversionHistory = [];

// ========== THEME MANAGEMENT ==========
function initTheme() {
    // Check localStorage or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    // Apply theme to HTML element
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update UI
    updateThemeUI(savedTheme);
}

function toggleTheme() {
    // Get current theme
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    // Toggle
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Apply to HTML element
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
    
    // Update UI
    updateThemeUI(newTheme);
    
    // Add animation
    if (themeToggleNav) {
        themeToggleNav.classList.add('rotate');
        setTimeout(() => {
            themeToggleNav.classList.remove('rotate');
        }, 300);
    }
}

function updateThemeUI(theme) {
    if (!themeToggleNav || !themeText) return;
    
    const icon = themeToggleNav.querySelector('i');
    
    if (theme === 'dark') {
        icon.className = 'fas fa-moon';
        themeText.textContent = 'Dark Mode';
    } else {
        icon.className = 'fas fa-sun';
        themeText.textContent = 'Light Mode';
    }
}

// Update date
function updateDate() {
    if (!currentDateSpan) return;
    
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    currentDateSpan.textContent = now.toLocaleDateString('en-US', options);
}

// Populate dropdowns
function populateDropdowns() {
    if (!fromCurrency || !toCurrency) return;
    
    // Clear
    fromCurrency.innerHTML = '';
    toCurrency.innerHTML = '';
    
    // Add options
    const currencies = [
        { code: 'PKR', name: 'Pakistani Rupee', flag: '🇵🇰' },
        { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' },
        { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
        { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' }
    ];
    
    currencies.forEach(c => {
        const option1 = document.createElement('option');
        option1.value = c.code;
        option1.textContent = `${c.flag} ${c.code} - ${c.name}`;
        fromCurrency.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = c.code;
        option2.textContent = `${c.flag} ${c.code} - ${c.name}`;
        toCurrency.appendChild(option2);
    });
    
    // Set defaults
    fromCurrency.value = 'PKR';
    toCurrency.value = 'SAR';
    
    // Update badges
    updateCurrencyBadges();
}

// Update badges
function updateCurrencyBadges() {
    if (!fromCurrencyBadge) return;
    
    fromCurrencyBadge.textContent = fromCurrency.value;
    
    // From selector
    const fromSelector = document.getElementById('fromSelector');
    if (fromSelector) {
        const fromFlag = getFlag(fromCurrency.value);
        const flagSpan = fromSelector.querySelector('.currency-flag');
        const codeSpan = fromSelector.querySelector('.currency-code');
        if (flagSpan) flagSpan.textContent = fromFlag;
        if (codeSpan) codeSpan.textContent = fromCurrency.value;
    }
    
    // To selector
    const toSelector = document.getElementById('toSelector');
    if (toSelector) {
        const toFlag = getFlag(toCurrency.value);
        const flagSpan = toSelector.querySelector('.currency-flag');
        const codeSpan = toSelector.querySelector('.currency-code');
        if (flagSpan) flagSpan.textContent = toFlag;
        if (codeSpan) codeSpan.textContent = toCurrency.value;
    }
}

// Get flag
function getFlag(code) {
    const flags = {
        'PKR': '🇵🇰',
        'SAR': '🇸🇦',
        'USD': '🇺🇸',
        'INR': '🇮🇳'
    };
    return flags[code] || '🌍';
}

// Update rate
function updateRateInfo() {
    if (!rateDisplay) return;
    
    const from = fromCurrency.value;
    const to = toCurrency.value;
    
    let rate = 0;
    if (from === to) {
        rate = 1;
    } else {
        rate = RATES[from]?.[to] || 0;
    }
    
    rateDisplay.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
    if (updateTimeSpan) {
        updateTimeSpan.textContent = 'Updated now';
    }
}

// Update stats
function updateStats() {
    if (pkrSarRate) pkrSarRate.textContent = RATES['PKR']['SAR'].toFixed(4);
    if (pkrUsdRate) pkrUsdRate.textContent = RATES['PKR']['USD'].toFixed(4);
    if (pkrInrRate) pkrInrRate.textContent = RATES['PKR']['INR'].toFixed(4);
    if (sarPkrRate) sarPkrRate.textContent = RATES['SAR']['PKR'].toFixed(2);
}

// Convert
function convertCurrency() {
    if (!amountInput || !resultSpan) return;
    
    const amount = parseFloat(amountInput.value) || 0;
    const from = fromCurrency.value;
    const to = toCurrency.value;
    
    if (amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    // Get rate
    let rate = 1;
    if (from !== to) {
        rate = RATES[from]?.[to] || 0;
    }
    
    const converted = amount * rate;
    
    // Show result
    resultSpan.innerHTML = converted.toFixed(2) + ' ' + to;
    
    // Add to history
    addToHistory(amount, from, to, converted, rate);
}

// Add to history
function addToHistory(amount, from, to, result, rate) {
    const item = {
        id: Date.now(),
        time: new Date().toLocaleString(),
        amount: amount.toFixed(2),
        from,
        to,
        result: result.toFixed(2),
        rate: rate.toFixed(4),
        fromFlag: getFlag(from),
        toFlag: getFlag(to)
    };
    
    conversionHistory.unshift(item);
    if (conversionHistory.length > 5) conversionHistory.pop();
    
    renderHistory();
}

// Render history
function renderHistory() {
    if (!historyList) return;
    
    if (conversionHistory.length === 0) {
        historyList.innerHTML = '<div class="empty-history">No conversions yet</div>';
        return;
    }
    
    let html = '';
    conversionHistory.forEach(item => {
        html += `
            <div class="history-item">
                <div>
                    <div><strong>${item.fromFlag} ${item.amount} ${item.from} → ${item.toFlag} ${item.result} ${item.to}</strong></div>
                    <small>1 ${item.from} = ${item.rate} ${item.to}</small>
                    <small>${item.time}</small>
                </div>
                <button onclick="deleteItem(${item.id})" class="delete-btn">✕</button>
            </div>
        `;
    });
    
    historyList.innerHTML = html;
}

// Delete item
window.deleteItem = function(id) {
    conversionHistory = conversionHistory.filter(item => item.id !== id);
    renderHistory();
};

// Clear history
function clearHistory() {
    if (conversionHistory.length > 0) {
        conversionHistory = [];
        renderHistory();
    }
}

// Swap currencies
function swapCurrencies() {
    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;
    
    updateCurrencyBadges();
    updateRateInfo();
}

// Add CSS animations
function addAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(180deg); }
        }
        
        .rotate {
            animation: rotate 0.3s ease;
        }
        
        .history-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: var(--bg-tertiary);
            border-radius: 10px;
            margin-bottom: 10px;
            border: 1px solid var(--border);
        }
        
        .history-item small {
            display: block;
            color: var(--text-tertiary);
            font-size: 11px;
            margin-top: 4px;
        }
        
        .delete-btn {
            background: none;
            border: none;
            color: var(--text-tertiary);
            cursor: pointer;
            font-size: 16px;
            padding: 5px 10px;
            border-radius: 5px;
        }
        
        .delete-btn:hover {
            background: var(--surface-hover);
            color: var(--danger);
        }
        
        .empty-history {
            text-align: center;
            padding: 30px;
            color: var(--text-tertiary);
            background: var(--bg-tertiary);
            border-radius: 10px;
        }
    `;
    document.head.appendChild(style);
}

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('App starting...');
    
    // Initialize theme FIRST (important)
    initTheme();
    
    // Update date
    updateDate();
    
    // Populate dropdowns
    populateDropdowns();
    
    // Update rate and stats
    updateRateInfo();
    updateStats();
    
    // Add animations CSS
    addAnimations();
    
    // ========== EVENT LISTENERS ==========
    
    // Theme toggle - FIXED: Direct click handler
    if (themeToggleNav) {
        console.log('Theme toggle found');
        themeToggleNav.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Theme toggle clicked');
            toggleTheme();
        });
    } else {
        console.log('Theme toggle not found');
    }
    
    // Convert button
    if (convertBtn) {
        convertBtn.addEventListener('click', convertCurrency);
    }
    
    // Swap button
    if (swapBtn) {
        swapBtn.addEventListener('click', swapCurrencies);
    }
    
    // Clear history button
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', clearHistory);
    }
    
    // Currency selectors
    const fromSelector = document.getElementById('fromSelector');
    if (fromSelector) {
        fromSelector.addEventListener('click', () => fromCurrency.click());
    }
    
    const toSelector = document.getElementById('toSelector');
    if (toSelector) {
        toSelector.addEventListener('click', () => toCurrency.click());
    }
    
    // Currency change events
    if (fromCurrency) {
        fromCurrency.addEventListener('change', function() {
            updateCurrencyBadges();
            updateRateInfo();
        });
    }
    
    if (toCurrency) {
        toCurrency.addEventListener('change', function() {
            updateCurrencyBadges();
            updateRateInfo();
        });
    }
    
    // Enter key on amount input
    if (amountInput) {
        amountInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                convertCurrency();
            }
        });
    }
    
    console.log('App ready!');
});