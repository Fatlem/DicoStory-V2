class AuthHelper {
  static getUserData() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  static setUserData(userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  static getToken() {
    const userData = this.getUserData();
    return userData ? userData.token : null;
  }

  static getUserId() {
    const userData = this.getUserData();
    return userData ? userData.userId : null;
  }

  static getUserName() {
    const userData = this.getUserData();
    return userData ? userData.name : null;
  }

  static isLoggedIn() {
    return !!this.getToken();
  }

  static logout() {
    localStorage.removeItem('userData');
  }
}

export { AuthHelper };