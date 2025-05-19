class PwaInstaller {
  static init() {
    this.deferredPrompt = null;
    this._setupEventListeners();
  }

  static _setupEventListeners() {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      
      this.deferredPrompt = event;

      this._showInstallBanner();
    });

    document.addEventListener('DOMContentLoaded', () => {
      const installButton = document.getElementById('install-pwa');
      const closeBannerButton = document.getElementById('close-banner');
      
      if (installButton) {
        installButton.addEventListener('click', () => {
          this._installPwa();
        });
      }
      
      if (closeBannerButton) {
        closeBannerButton.addEventListener('click', () => {
          this._hideInstallBanner();
        });
      }
    });

    window.addEventListener('appinstalled', () => {
      this._hideInstallBanner();
      
      this.deferredPrompt = null;

      console.log('PWA was installed');
    });
  }

  static _showInstallBanner() {
    const banner = document.getElementById('pwa-install-banner');
    
    if (banner && this.deferredPrompt) {
      banner.classList.add('show');
    }
  }

  static _hideInstallBanner() {
    const banner = document.getElementById('pwa-install-banner');
    
    if (banner) {
      banner.classList.remove('show');
    }
  }

  static async _installPwa() {
    if (!this.deferredPrompt) {
      return;
    }
    
    this.deferredPrompt.prompt();

    const choiceResult = await this.deferredPrompt.userChoice;
    
    this.deferredPrompt = null;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    this._hideInstallBanner();
  }
}

export { PwaInstaller };