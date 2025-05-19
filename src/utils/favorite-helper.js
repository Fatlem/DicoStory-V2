import { IdbHelper } from './idb-helper.js';

class FavoriteHelper {
  static DB_NAME = 'dicostory-favorite-db';
  static DB_VERSION = 1;
  static STORE_NAME = 'favorites';

  static async openDB() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('Browser tidak mendukung IndexedDB'));
        return;
      }

      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        reject(new Error('Gagal membuka database favorites'));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          console.log(`Object store ${this.STORE_NAME} berhasil dibuat`);
        }
      };
    });
  }

  static async addToFavorites(story) {
    const db = await this.openDB();
    const tx = db.transaction(this.STORE_NAME, 'readwrite');
    const store = tx.objectStore(this.STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.put(story);
      
      request.onsuccess = () => {
        resolve(true);
        console.log(`Story berhasil ditambahkan ke favorit`);
      };
      
      request.onerror = () => {
        reject(new Error('Gagal menambahkan story ke favorit'));
      };
    });
  }

  static async removeFromFavorites(id) {
    const db = await this.openDB();
    const tx = db.transaction(this.STORE_NAME, 'readwrite');
    const store = tx.objectStore(this.STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve(true);
        console.log(`Story berhasil dihapus dari favorit`);
      };
      
      request.onerror = () => {
        reject(new Error('Gagal menghapus story dari favorit'));
      };
    });
  }

  static async getFavorites() {
    const db = await this.openDB();
    const tx = db.transaction(this.STORE_NAME, 'readonly');
    const store = tx.objectStore(this.STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(new Error('Gagal mengambil daftar favorit'));
      };
    });
  }

  static async isFavorite(id) {
    const db = await this.openDB();
    const tx = db.transaction(this.STORE_NAME, 'readonly');
    const store = tx.objectStore(this.STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      
      request.onsuccess = () => {
        resolve(!!request.result);
      };
      
      request.onerror = () => {
        reject(new Error('Gagal memeriksa status favorit'));
      };
    });
  }
}

export { FavoriteHelper };