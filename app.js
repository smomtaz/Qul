// Quranic Arabic Roots Flashcard App
// Main application logic

class FlashcardApp {
    constructor() {
        this.currentIndex = 0;
        this.roots = [...quranRoots]; // Copy of original data
        this.isFlipped = false;
        this.deferredPrompt = null;
        
        this.init();
    }

    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.registerServiceWorker();
        this.checkInstallPrompt();
    }

    cacheElements() {
        // Screens
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.flashcardContainer = document.getElementById('flashcardContainer');
        
        // Flashcard elements
        this.flashcard = document.getElementById('flashcard');
        this.arabicRoot = document.getElementById('arabicRoot');
        this.transliteration = document.getElementById('transliteration');
        this.meaning = document.getElementById('meaning');
        this.formsCount = document.getElementById('formsCount');
        this.cardCounter = document.getElementById('cardCounter');
        this.progressFill = document.getElementById('progressFill');
        
        // Buttons
        this.startBtn = document.getElementById('startBtn');
        this.flipBtn = document.getElementById('flipBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.viewFormsBtn = document.getElementById('viewFormsBtn');
        this.searchBtn = document.getElementById('searchBtn');
        
        // Modals
        this.formsModal = document.getElementById('formsModal');
        this.searchModal = document.getElementById('searchModal');
        this.formsContent = document.getElementById('formsContent');
        this.modalRoot = document.getElementById('modalRoot');
        this.closeModal = document.getElementById('closeModal');
        this.closeSearch = document.getElementById('closeSearch');
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        
        // Install prompt
        this.installPrompt = document.getElementById('installPrompt');
        this.installBtn = document.getElementById('installBtn');
        this.installClose = document.getElementById('installClose');
    }

    attachEventListeners() {
        // Start button
        this.startBtn.addEventListener('click', () => this.startLearning());
        
        // Navigation
        this.flashcard.addEventListener('click', () => this.flipCard());
        this.flipBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.flipCard();
        });
        this.prevBtn.addEventListener('click', () => this.previousCard());
        this.nextBtn.addEventListener('click', () => this.nextCard());
        this.shuffleBtn.addEventListener('click', () => this.shuffleCards());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // View forms
        this.viewFormsBtn.addEventListener('click', () => this.showForms());
        this.closeModal.addEventListener('click', () => this.closeFormsModal());
        
        // Search
        this.searchBtn.addEventListener('click', () => this.openSearch());
        this.closeSearch.addEventListener('click', () => this.closeSearchModal());
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // Modal backdrop clicks
        this.formsModal.addEventListener('click', (e) => {
            if (e.target === this.formsModal) this.closeFormsModal();
        });
        this.searchModal.addEventListener('click', (e) => {
            if (e.target === this.searchModal) this.closeSearchModal();
        });
        
        // Install prompt
        this.installBtn.addEventListener('click', () => this.installApp());
        this.installClose.addEventListener('click', () => this.hideInstallPrompt());
    }

    startLearning() {
        this.welcomeScreen.style.display = 'none';
        this.flashcardContainer.style.display = 'block';
        this.loadCard();
        this.updateProgress();
    }

    loadCard() {
        const root = this.roots[this.currentIndex];
        
        this.arabicRoot.textContent = root.arabic;
        this.transliteration.textContent = root.transliteration;
        this.meaning.textContent = root.meaning;
        this.formsCount.textContent = root.forms.length;
        this.modalRoot.textContent = root.arabic;
        
        this.cardCounter.textContent = `${this.currentIndex + 1} / ${this.roots.length}`;
        
        // Reset flip state
        if (this.isFlipped) {
            this.flipCard();
        }
    }

    flipCard() {
        this.isFlipped = !this.isFlipped;
        this.flashcard.classList.toggle('flipped');
    }

    nextCard() {
        this.currentIndex = (this.currentIndex + 1) % this.roots.length;
        this.loadCard();
        this.updateProgress();
    }

    previousCard() {
        this.currentIndex = (this.currentIndex - 1 + this.roots.length) % this.roots.length;
        this.loadCard();
        this.updateProgress();
    }

    shuffleCards() {
        // Fisher-Yates shuffle algorithm
        for (let i = this.roots.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.roots[i], this.roots[j]] = [this.roots[j], this.roots[i]];
        }
        
        this.currentIndex = 0;
        this.loadCard();
        this.updateProgress();
        
        // Visual feedback
        this.shuffleBtn.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            this.shuffleBtn.style.transform = '';
        }, 300);
    }

    updateProgress() {
        const progress = ((this.currentIndex + 1) / this.roots.length) * 100;
        this.progressFill.style.width = `${progress}%`;
    }

    handleKeyboard(e) {
        if (this.flashcardContainer.style.display === 'none') return;
        
        switch(e.key) {
            case 'ArrowLeft':
                this.previousCard();
                break;
            case 'ArrowRight':
                this.nextCard();
                break;
            case ' ':
            case 'Enter':
                e.preventDefault();
                this.flipCard();
                break;
            case 'Escape':
                if (this.formsModal.classList.contains('active')) {
                    this.closeFormsModal();
                } else if (this.searchModal.classList.contains('active')) {
                    this.closeSearchModal();
                }
                break;
        }
    }

    showForms() {
        const root = this.roots[this.currentIndex];
        
        this.formsContent.innerHTML = '';
        
        root.forms.forEach((form, index) => {
            const formElement = document.createElement('div');
            formElement.className = 'word-form';
            formElement.innerHTML = `
                <div class="form-arabic">${form.arabic}</div>
                <div class="form-transliteration">${form.transliteration}</div>
                <div class="form-meaning">${form.meaning}</div>
            `;
            
            // Add staggered animation
            formElement.style.animation = `fadeIn 0.3s ease ${index * 0.05}s both`;
            
            this.formsContent.appendChild(formElement);
        });
        
        this.formsModal.classList.add('active');
    }

    closeFormsModal() {
        this.formsModal.classList.remove('active');
    }

    openSearch() {
        this.searchModal.classList.add('active');
        this.searchInput.focus();
        this.searchInput.value = '';
        this.displayAllRoots();
    }

    closeSearchModal() {
        this.searchModal.classList.remove('active');
    }

    displayAllRoots() {
        this.searchResults.innerHTML = '';
        
        this.roots.forEach((root, index) => {
            const resultElement = this.createSearchResult(root, index);
            this.searchResults.appendChild(resultElement);
        });
    }

    handleSearch(query) {
        this.searchResults.innerHTML = '';
        
        if (!query.trim()) {
            this.displayAllRoots();
            return;
        }
        
        const lowercaseQuery = query.toLowerCase();
        const filteredRoots = this.roots.filter(root => {
            return root.arabic.includes(query) ||
                   root.transliteration.toLowerCase().includes(lowercaseQuery) ||
                   root.meaning.toLowerCase().includes(lowercaseQuery);
        });
        
        if (filteredRoots.length === 0) {
            this.searchResults.innerHTML = `
                <div class="no-results">
                    <p>No roots found matching "${query}"</p>
                </div>
            `;
            return;
        }
        
        filteredRoots.forEach((root) => {
            const index = this.roots.indexOf(root);
            const resultElement = this.createSearchResult(root, index);
            this.searchResults.appendChild(resultElement);
        });
    }

    createSearchResult(root, index) {
        const resultElement = document.createElement('div');
        resultElement.className = 'search-result';
        resultElement.innerHTML = `
            <div class="result-arabic">${root.arabic}</div>
            <div class="result-details">
                <span>${root.transliteration}</span> • 
                <span>${root.meaning}</span> • 
                <span>${root.forms.length} forms</span>
            </div>
        `;
        
        resultElement.addEventListener('click', () => {
            this.currentIndex = index;
            this.loadCard();
            this.updateProgress();
            this.closeSearchModal();
        });
        
        return resultElement;
    }

    // PWA Installation
    checkInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });

        window.addEventListener('appinstalled', () => {
            this.hideInstallPrompt();
            this.deferredPrompt = null;
        });
    }

    showInstallPrompt() {
        setTimeout(() => {
            this.installPrompt.style.display = 'flex';
        }, 3000);
    }

    hideInstallPrompt() {
        this.installPrompt.style.display = 'none';
    }

    async installApp() {
        if (!this.deferredPrompt) return;

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        }
        
        this.deferredPrompt = null;
        this.hideInstallPrompt();
    }

    // Service Worker Registration
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FlashcardApp();
});
