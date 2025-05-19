class NotificationHelper {
  static async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker tidak didukung di browser ini');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      console.log('Service Worker berhasil didaftarkan', registration);
      return registration;
    } catch (error) {
      console.error('Registrasi Service Worker gagal:', error);
      return null;
    }
  }

  static async requestPermission() {
    if (!('Notification' in window)) {
      console.log('Browser tidak mendukung notifikasi');
      return false;
    }

    const result = await Notification.requestPermission();
    if (result === 'denied') {
      console.log('Fitur notifikasi tidak diizinkan');
      return false;
    }

    if (result === 'default') {
      console.log('Pengguna menutup kotak dialog permintaan izin');
      return false;
    }

    return true;
  }

  static async getVapidPublicKey() {
    try {
      const response = await fetch('https://story-api.dicoding.dev/v1/stories/vapidPublicKey');
      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }
      
      return responseJson.data.vapidPublicKey;
    } catch (error) {
      console.error('Gagal mendapatkan VAPID public key:', error);
      return null;
    }
  }

  static async subscribePushNotification(registration) {
    const vapidPublicKey = await this.getVapidPublicKey();
    
    if (!vapidPublicKey) {
      console.error('VAPID public key tidak tersedia');
      return null;
    }

    const convertedVapidKey = this._urlBase64ToUint8Array(vapidPublicKey);
    
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      console.log('Berhasil melakukan subscribe dengan endpoint:', subscription.endpoint);
      await this._sendSubscriptionToServer(subscription);
      return subscription;
    } catch (error) {
      console.error('Gagal melakukan subscribe:', error);
      return null;
    }
  }

  static async _sendSubscriptionToServer(subscription) {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('User perlu login untuk menerima notifikasi');
      return;
    }

    try {
      const response = await fetch('https://story-api.dicoding.dev/v1/stories/pushNotificationSubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscription: subscription,
        }),
      });

      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }
      
      console.log('Subscription berhasil dikirim ke server:', responseJson);
    } catch (error) {
      console.error('Gagal mengirim subscription ke server:', error);
    }
  }

  static _urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i++) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }

  static showNotification(title, options) {
    if (!('Notification' in window)) {
      console.log('Browser tidak mendukung notifikasi');
      return;
    }

    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, options);
      });
    } else {
      console.log('Izin notifikasi tidak diberikan');
    }
  }
}

export { NotificationHelper };