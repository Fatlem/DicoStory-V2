import { IdbHelper } from '../../utils/idb-helper.js';
import { AuthHelper } from '../../utils/auth-helper.js';

class FavoritesPage {
  constructor() {
    this._title = 'Cerita Favorit - DicoStory';
  }

  async render() {
    document.title = this._title;

    return `
      <section class="favorites-page page-transition">
        <div class="coordinator-layout">
          <div class="coordinator-header">
            <div>
              <h2 class="coordinator-title">Cerita Favorit</h2>
              <p>Kumpulan cerita yang Anda tandai sebagai favorit</p>
            </div>
            <a href="#/" class="btn btn-secondary">
              <i class="fas fa-arrow-left"></i> Kembali ke Beranda
            </a>
          </div>
          
          <div id="favorites-container" class="coordinator-grid">
            <div class="loader" id="favorites-loader"></div>
          </div>
          
          <div id="error-container" class="error-container hidden"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    if (!AuthHelper.isLoggedIn()) {
      window.location.href = '#/login';
      return;
    }
    
    this.showLoading();
    
    try {
      const favorites = await IdbHelper.getFavorites();
      this.renderFavorites(favorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
      this.showError('Gagal memuat cerita favorit: ' + error.message);
    }
  }

  showLoading() {
    const loader = document.getElementById('favorites-loader');
    if (loader) {
      loader.classList.remove('hidden');
    }
    
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
      errorContainer.classList.add('hidden');
    }
  }

  hideLoading() {
    const loader = document.getElementById('favorites-loader');
    if (loader) {
      loader.classList.add('hidden');
    }
  }

  async renderFavorites(favorites) {
    this.hideLoading();
    
    const favoritesContainer = document.getElementById('favorites-container');
    if (!favoritesContainer) {
      console.error('Favorites container not found');
      return;
    }
    
    if (!favorites || favorites.length === 0) {
      favoritesContainer.innerHTML = `
        <div class="empty-state">
          <p>Belum ada cerita favorit.</p>
          <a href="#/" class="btn btn-primary">Jelajahi Cerita</a>
        </div>
      `;
      return;
    }
    
    favoritesContainer.innerHTML = '';
    
    favorites.forEach((story) => {
      const initial = story.name.charAt(0).toUpperCase();
      
      const storyItemElement = document.createElement('article');
      storyItemElement.classList.add('story-card');
      
      storyItemElement.innerHTML = `
        <div class="story-image-container">
          <img
            src="${story.photoUrl}"
            alt="Cerita dari ${story.name}"
            class="story-image"
            loading="lazy"
            onerror="this.src='./src/public/fallback.jpg';"
          />
        </div>
        <div class="story-content">
          <div class="user-info">
            <div class="user-avatar">${initial}</div>
            <span class="user-name">${story.name}</span>
          </div>
          
          <h3 class="story-title">${story.name}</h3>
          <p class="story-description">${this._truncateText(story.description, 100)}</p>
          
          <div class="story-meta">
            <div class="story-info">
              <i class="fas fa-calendar-alt"></i>
              <span>${this._formatDate(story.createdAt)}</span>
            </div>
            
            ${story.lat && story.lon ? 
              `<div class="story-info">
                <i class="fas fa-map-marker-alt"></i>
                <span>Lokasi tersedia</span>
              </div>` : ''
            }
          </div>
          
          <div class="story-actions">
            <button class="favorite-btn favorited" data-id="${story.id}">
              <i class="fas fa-bookmark"></i>
            </button>
            <a href="#" class="view-details-btn" data-id="${story.id}">
              View Details
            </a>
          </div>
        </div>
      `;
      
      favoritesContainer.appendChild(storyItemElement);
      
      // Setup event listeners
      const viewDetailBtn = storyItemElement.querySelector('.view-details-btn');
      viewDetailBtn.addEventListener('click', (event) => {
        event.preventDefault();
        window.selectedStoryId = story.id;
        window.location.href = '#/detail';
      });
      
      const favoriteBtn = storyItemElement.querySelector('.favorite-btn');
      favoriteBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        
        try {
          await IdbHelper.removeFromFavorites(story.id);
          storyItemElement.remove();
          
          // Check if there are any favorites left
          const remainingFavorites = await IdbHelper.getFavorites();
          if (remainingFavorites.length === 0) {
            this.renderFavorites([]);
          }

          // Tampilkan notifikasi penghapusan favorit
          if ('Notification' in window && Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then((registration) => {
              registration.showNotification('DicoStory', {
                body: 'Cerita berhasil dihapus dari favorit',
                icon: './src/public/icons/icon-192x192.png',
                badge: './src/public/icons/badge-96x96.png',
                vibrate: [100, 50, 100]
              });
            });
          }
        } catch (error) {
          console.error('Error removing from favorites:', error);
        }
      });
    });
  }

  showError(message) {
    this.hideLoading();
    
    const errorContainer = document.getElementById('error-container');
    if (!errorContainer) {
      console.error('Error container not found');
      return;
    }
    
    errorContainer.classList.remove('hidden');
    errorContainer.innerHTML = `
      <div class="error-content">
        <i class="fas fa-exclamation-triangle fa-3x"></i>
        <h3>Gagal memuat cerita favorit</h3>
        <p>${message}</p>
        <button id="retry-button" class="btn">Coba Lagi</button>
      </div>
    `;
    
    const retryButton = document.getElementById('retry-button');
    if (retryButton) {
      retryButton.addEventListener('click', async () => {
        this.showLoading();
        try {
          const favorites = await IdbHelper.getFavorites();
          this.renderFavorites(favorites);
        } catch (error) {
          console.error('Error reloading favorites:', error);
          this.showError('Gagal memuat cerita favorit: ' + error.message);
        }
      });
    }
  }

  _truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) {
      return text;
    }
    return text.substr(0, maxLength) + '...';
  }

  _formatDate(dateString) {
    if (!dateString) return '-';
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  }
}

export { FavoritesPage }