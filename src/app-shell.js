class AppShell {
  static init() {
    this._renderAppShell();
    this._setupEventListeners();
  }

  static _renderAppShell() {
    document.body.innerHTML = `
      <a href="#main-content" class="skip-link">Langsung ke konten</a>

      <header>
        <div class="header-container">
          <div class="brand">
            <h1><a href="#/">DicoStory</a></h1>
          </div>
          <nav id="drawer" class="nav">
            <ul class="nav-list">
              <li class="nav-item"><a href="#/"><i class="fas fa-home"></i> Beranda</a></li>
              <li class="nav-item"><a href="#/add"><i class="fas fa-plus-circle"></i> Tambah Cerita</a></li>
              <li class="nav-item"><a href="#/map"><i class="fas fa-map-marked-alt"></i> Peta Cerita</a></li>
              <li class="nav-item" id="login-menu"><a href="#/login"><i class="fas fa-sign-in-alt"></i> Login</a></li>
              <li class="nav-item" id="register-menu"><a href="#/register"><i class="fas fa-user-plus"></i> Register</a></li>
              <li class="nav-item" id="logout-menu"><a href="#/"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
            </ul>
          </nav>
          <button id="menu" class="header-menu" aria-label="Toggle navigation menu">☰</button>
        </div>
      </header>

      <main id="main-content" tabindex="-1">
        <div id="content" class="content"></div>
      </main>

      <footer>
        <div class="footer-content">
          <p>&copy; 2025 Fatlem DicoStory - Berbagi Cerita Dicoding</p>
        </div>
      </footer>
    `;
  }

  static _setupEventListeners() {
    const hamburgerButton = document.getElementById('menu');
    const drawer = document.getElementById('drawer');
    
    hamburgerButton.addEventListener('click', (event) => {
      drawer.classList.toggle('open');
      event.stopPropagation();
    });
    
    document.addEventListener('click', (event) => {
      if (drawer.classList.contains('open') && !drawer.contains(event.target) && event.target !== hamburgerButton) {
        drawer.classList.remove('open');
      }
    });
  }
}

export { AppShell };