import { AuthHelper } from '../utils/auth-helper.js';

class LoginPresenter {
  constructor(model, view) {
    this._model = model;
    this._view = view;
  }

  async login(email, password) {
    try {
      this._view.clearAlert();
      this._view.showLoading();
      
      if (!email || !password) {
        throw new Error('Email dan password harus diisi');
      }
      
      if (password.length < 8) {
        throw new Error('Password minimal 8 karakter');
      }
      
      console.log('Login validation passed, calling API');
      const loginResult = await this._model.login(email, password);
      
      console.log('Login successful, saving user data');
      AuthHelper.setUserData(loginResult);
      
      console.log('Redirecting to home page');
      window.location.href = '#/';
      window.location.reload();
      
    } catch (error) {
      console.error('Login presenter error:', error);
      this._view.hideLoading();
      this._view.showAlert(error.message);
    }
  }
}

export { LoginPresenter };