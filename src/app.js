// File: src/app.js

import { routes } from './routes/routes.js';
import { UrlParser } from './utils/url-parser.js';
import { AuthHelper } from './utils/auth-helper.js';
import { IdbHelper } from './utils/idb-helper.js';
import { NotificationHelper } from './utils/notification-helper.js';
import { NetworkStatus } from './utils/network-status.js';
import { PwaInstaller } from './utils/pwa-installer.js';

window.selectedStoryId = null;

class App {
  constructor() {
    this._initializeApp();
  }

  async _initializeApp() {
    console.log('Initializing app...');
    
    // Initialize utils
    await this._initIndexedDB();
    await this._initServiceWorker();
    NetworkStatus.init();
    PwaInstaller.init();
    
    this._initMobileNav();
    this._checkAuthStatus();
    this._handleRoute();
    
    window.addEventListener('hashchange', () => {
      this._handleRoute();
    });

    // Setup view transitions if supported
    document.addEventListener('click', (event) => {
      if (event.target.tagName === 'A' && event.target.href.includes('#/')) {
        if (document.startViewTransition) {
          event.preventDefault();
          document.startViewTransition(() => {
            window.location.href = event.target.href;
          });
        }
      }
    });
  }

  async _initServiceWorker() {
    try {
      // Register Service Worker
      const registration = await NotificationHelper.registerServiceWorker();
      
      // Request notification permission if logged in
      if (AuthHelper.isLoggedIn()) {
        const permission = await NotificationHelper.requestPermission();
        
        if (permission && registration) {
          await NotificationHelper.subscribePushNotification(registration);
        }
      }
    } catch (error) {
      console.error('Error initializing service worker:', error);
    }
  }

  async _initIndexedDB() {
    try {
      await IdbHelper.openDB();
      console.log('IndexedDB initialized successfully');
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
    }
  }

  _initMobileNav() {
    const menuButton = document.getElementById('menu');
    const drawer = document.getElementById('drawer');
    
    if (!menuButton || !drawer) {
      console.error('Menu button or drawer not found');
      return;
    }
    
    menuButton.addEventListener('click', (event) => {
      event.stopPropagation();
      drawer.classList.toggle('open');
    });

    document.addEventListener('click', (event) => {
      if (drawer.classList.contains('open') && !drawer.contains(event.target)) {
        drawer.classList.remove('open');
      }
    });

    const navLinks = document.querySelectorAll('.nav-item a');
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
      });
    });
  }

  _checkAuthStatus() {
    console.log('Checking auth status...');
    const isLoggedIn = AuthHelper.isLoggedIn();
    const loginMenuItem = document.getElementById('login-menu');
    const registerMenuItem = document.getElementById('register-menu');
    const logoutMenuItem = document.getElementById('logout-menu');
    const favoritesMenuItem = document.querySelector('.nav-item a[href="#/favorites"]')?.parentElement;
    const addStoryMenuItem = document.querySelector('.nav-item a[href="#/add"]')?.parentElement;
    const mapMenuItem = document.querySelector('.nav-item a[href="#/map"]')?.parentElement;

    if (!loginMenuItem || !registerMenuItem || !logoutMenuItem) {
      console.error('Menu items not found');
      return;
    }

    if (isLoggedIn) {
      console.log('User is logged in');
      loginMenuItem.classList.add('hidden');
      registerMenuItem.classList.add('hidden');
      logoutMenuItem.classList.remove('hidden');
      
      if (favoritesMenuItem) favoritesMenuItem.classList.remove('hidden');
      if (addStoryMenuItem) addStoryMenuItem.classList.remove('hidden');
      if (mapMenuItem) mapMenuItem.classList.remove('hidden');
      
      // Setelah login, coba subscribe ke push notification
      this._subscribeToPushNotification();
    } else {
      console.log('User is not logged in');
      loginMenuItem.classList.remove('hidden');
      registerMenuItem.classList.remove('hidden');
      logoutMenuItem.classList.add('hidden');
      
      if (favoritesMenuItem) favoritesMenuItem.classList.add('hidden');
      if (addStoryMenuItem) addStoryMenuItem.classList.add('hidden');
      if (mapMenuItem) mapMenuItem.classList.add('hidden');
    }

    logoutMenuItem.addEventListener('click', (event) => {
      event.preventDefault();
      this._handleLogout();
    });
  }

  async _subscribeToPushNotification() {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const permission = await NotificationHelper.requestPermission();
        
        if (permission && registration) {
          await NotificationHelper.subscribePushNotification(registration);
        }
      }
    } catch (error) {
      console.error('Error subscribing to push notification:', error);
    }
  }

  async _handleLogout() {
    AuthHelper.logout();
    
    // Clear data from IndexedDB
    try {
      await IdbHelper.clearStories();
      console.log('Stories cleared from IndexedDB after logout');
    } catch (error) {
      console.error('Error clearing stories from IndexedDB:', error);
    }
    
    window.location.href = '#/';
    window.location.reload();
  }

  async _handleRoute() {
    console.log('Handling route...');
    
    const urlParts = window.location.hash.slice(1).split('/');
    if (urlParts.length > 2 && urlParts[1] === 'detail') {
      window.selectedStoryId = urlParts[2];
      window.history.replaceState(null, null, '#/detail');
    }
    
    const url = UrlParser.parseActiveUrlWithCombiner();
    console.log('Current URL:', url);
    let page;
    
    // Check if route exists
    if (routes[url]) {
      page = routes[url];
    } else {
      // If not, use the NotFoundPage
      console.log('Route not found, redirecting to 404 page');
      page = routes['/404'];
    }
    
    console.log('Page to render:', page);
    
    try {
      if (url === '/login' || url === '/register') {
        if (AuthHelper.isLoggedIn()) {
          console.log('User is logged in, redirecting to home');
          window.location.href = '#/';
          return;
        }
      }

      if ((url === '/add' || url === '/map' || url === '/favorites') && !AuthHelper.isLoggedIn()) {
        console.log('Protected route, redirecting to login');
        window.location.href = '#/login';
        return;
      }

      const contentContainer = document.querySelector('#content');
      
      if (!contentContainer) {
        console.error('Content container not found');
        return;
      }
      
      contentContainer.innerHTML = '';

      const view = new page.view();
      console.log('View instantiated');
      const content = await view.render();
      console.log('Content rendered');
      contentContainer.innerHTML = content;
      console.log('Content injected into DOM');
      await view.afterRender();
      console.log('afterRender completed');

      document.getElementById('main-content').focus();
      
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded');
  new App();
});