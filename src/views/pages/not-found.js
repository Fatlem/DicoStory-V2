class NotFoundPage {
  constructor() {
    this._title = 'Halaman Tidak Ditemukan - DicoStory';
  }
  
  async render() {
    document.title = this._title;
    
    return `
      <section class="not-found-page page-transition">
        <div class="not-found-container">
          <div class="not-found-content">
            <h1>404</h1>
            <h2>Halaman Tidak Ditemukan</h2>
            <p>Maaf, halaman yang Anda cari tidak tersedia atau mungkin telah dipindahkan.</p>
            <a href="#/" class="btn btn-primary">Kembali ke Beranda</a>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const notFoundContent = document.querySelector('.not-found-content');
    if (notFoundContent) {
      notFoundContent.classList.add('animate-fade-in');
    }
  }
}

export { NotFoundPage };