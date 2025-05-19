class AuthModel {
  constructor() {
    this._baseUrl = 'https://story-api.dicoding.dev/v1';
  }

  async login(email, password) {
    try {
      console.log('Trying to login with:', email);
      const response = await fetch(`${this._baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      console.log('Login successful:', responseJson);
      return responseJson.loginResult;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Gagal melakukan login');
    }
  }

  async register(name, email, password) {
    try {
      console.log('Registering new user:', email);
      const response = await fetch(`${this._baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      console.log('Registration successful');
      return responseJson;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Gagal melakukan registrasi');
    }
  }

  async subscribeNotification(subscription) {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Anda belum login');
      }

      const response = await fetch(`${this._baseUrl}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(subscription),
      });

      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson;
    } catch (error) {
      console.error('Notification subscription error:', error);
      throw new Error(error.message || 'Gagal berlangganan notifikasi');
    }
  }

  async unsubscribeNotification(endpoint) {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Anda belum login');
      }

      const response = await fetch(`${this._baseUrl}/notifications/subscribe`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ endpoint }),
      });

      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson;
    } catch (error) {
      console.error('Unsubscribe error:', error);
      throw new Error(error.message || 'Gagal berhenti berlangganan notifikasi');
    }
  }
}

export { AuthModel };