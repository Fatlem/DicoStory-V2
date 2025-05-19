class NetworkStatus {
  static init() {
    this._setupNetworkListeners();
    this._createOfflineIndicator();
  }

  static _setupNetworkListeners() {
    window.addEventListener('online', () => {
      this._updateOfflineStatus(false);
      this._showToast('Anda kembali online');
    });

    window.addEventListener('offline', () => {
      this._updateOfflineStatus(true);
      this._showToast('Anda sedang offline. Beberapa fitur mungkin terbatas.', 'warning');
    });

    // Check initial status
    if (!navigator.onLine) {
      this._updateOfflineStatus(true);
    }
  }

  static _createOfflineIndicator() {
    // Create offline indicator if not exists
    if (!document.getElementById('offline-indicator')) {
      const offlineIndicator = document.createElement('div');
      offlineIndicator.id = 'offline-indicator';
      offlineIndicator.className = 'offline-indicator';
      offlineIndicator.innerHTML = '<i class="fas fa-wifi"></i> Anda sedang offline. Beberapa fitur mungkin terbatas.';
      
      document.body.insertBefore(offlineIndicator, document.body.firstChild);
    }
  }

  static _updateOfflineStatus(isOffline) {
    const offlineIndicator = document.getElementById('offline-indicator');
    
    if (offlineIndicator) {
      if (isOffline) {
        offlineIndicator.classList.add('show');
      } else {
        offlineIndicator.classList.remove('show');
      }
    }
  }

  static _showToast(message, type = 'info') {
    // Create toast if not exists
    let toast = document.getElementById('toast');
    
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.classList.add('show');
    
    if (type === 'warning') {
      toast.style.backgroundColor = 'var(--warning-color)';
      toast.style.color = '#333';
    } else {
      toast.style.backgroundColor = 'var(--primary-color)';
      toast.style.color = '#fff';
    }
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  static isOnline() {
    return navigator.onLine;
  }
}

export { NetworkStatus };