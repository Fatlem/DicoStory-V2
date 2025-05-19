import { AuthModel } from '../../models/auth-model.js';
import { LoginPresenter } from '../../presenters/login-presenter.js';

class LoginPage {
  constructor() {
    this._model = new AuthModel();
    this._presenter = null;
  }

  async render() {
    console.log('Rendering login page');
    return `
      <section class="login-page page-transition">
        <div class="form-container">
          <h2 class="form-title">Login</h2>
          
          <div id="alert-container"></div>
          
          <form id="login-form">
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                class="form-input" 
                required
                placeholder="Masukkan email Anda"
              >
            </div>
            
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                class="form-input" 
                required
                placeholder="Masukkan password"
                minlength="8"
              >
            </div>
            
            <button type="submit" class="btn btn-block">
              <i class="fas fa-sign-in-alt"></i> Login
            </button>
          </form>
          
          <div class="form-footer">
            <p>Belum memiliki akun? <a href="#/register">Daftar Sekarang</a></p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    console.log('Login page afterRender');
    this._presenter = new LoginPresenter(this._model, this);
    
    const loginForm = document.getElementById('login-form');
    if (!loginForm) {
      console.error('Login form not found in DOM');
      return;
    }
    
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      await this._presenter.login(email, password);
    });
  }

  showLoading() {
    const submitButton = document.querySelector('#login-form button[type="submit"]');
    if (submitButton) {
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
      submitButton.disabled = true;
    }
  }

  hideLoading() {
    const submitButton = document.querySelector('#login-form button[type="submit"]');
    if (submitButton) {
      submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
      submitButton.disabled = false;
    }
  }

  showAlert(message, type = 'danger') {
    const alertContainer = document.getElementById('alert-container');
    if (alertContainer) {
      alertContainer.innerHTML = `
        <div class="alert alert-${type}">
          ${message}
        </div>
      `;
      
      alertContainer.scrollIntoView({ behavior: 'smooth' });
    }
  }

  clearAlert() {
    const alertContainer = document.getElementById('alert-container');
    if (alertContainer) {
      alertContainer.innerHTML = '';
    }
  }
}

export { LoginPage };