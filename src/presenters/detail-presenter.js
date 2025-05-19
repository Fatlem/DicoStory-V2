class DetailPresenter {
  constructor(model, view) {
    this._model = model;
    this._view = view;
  }

  async getStoryDetail(id) {
    try {
      this._view.showLoading();
      const story = await this._model.getStoryDetail(id);
      this._view.renderStoryDetail(story);
    } catch (error) {
      console.error('Detail presenter error:', error);
      this._view.showError(error.message);
    }
  }
}

export { DetailPresenter };