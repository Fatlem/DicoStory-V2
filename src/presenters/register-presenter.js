class RegisterPresenter {
  constructor(model, view) {
    this._model = model;
    this._view = view;
  }

  async register(name, email, password, confirmPassword) {
    try {
      this._view.clearAlert();
      this._view.showLoading();
      
      if (!name || !email || !password || !confirmPassword) {
        throw new Error('Semua field harus diisi');
      }
      
      if (password.length < 8) {
        throw new Error('Password minimal 8 karakter');
      }
      
      if (password !== confirmPassword) {
        throw new Error('Password dan konfirmasi password tidak cocok');
      }
      
      console.log('Register validation passed, calling API');
      await this._model.register(name, email, password);
      
      console.log('Registration successful');
      this._view.showAlert('Registrasi berhasil. Silakan login.', 'success');
      
      setTimeout(() => {
        window.location.href = '#/login';
      }, 2000);
      
    } catch (error) {
      console.error('Register presenter error:', error);
      this._view.hideLoading();
      this._view.showAlert(error.message);
    }
  }
}

export { RegisterPresenter };