class AddStoryPresenter {
  constructor(model, view) {
    this._model = model;
    this._view = view;
  }

  async addStory(description, photoBlob, lat, lon) {
    try {
      this._view.clearAlert();
      this._view.showLoading();
      
      if (!description) {
        throw new Error('Deskripsi cerita wajib diisi');
      }
      
      if (!photoBlob) {
        throw new Error('Foto wajib diambil');
      }
      
      console.log('Adding story with', lat && lon ? 'location' : 'no location');
      const response = await this._model.addStory(description, photoBlob, lat, lon);
      
      console.log('Story added successfully');
      this._view.showAlert('Cerita berhasil dibagikan!', 'success');
      
      setTimeout(() => {
        window.location.href = '#/';
      }, 1500);
      
    } catch (error) {
      console.error('Add story presenter error:', error);
      this._view.hideLoading();
      this._view.showAlert(error.message);
    }
  }
}

export { AddStoryPresenter };