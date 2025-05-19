class HomePresenter {
  constructor(model, view) {
    this._model = model;
    this._view = view;
  }

  async getStories() {
    try {
      this._view.showLoading();
      const stories = await this._model.getStories(1, 10, 1);
      this._view.renderStories(stories);
    } catch (error) {
      console.error('Home presenter error:', error);
      this._view.showError(error.message);
    }
  }
}

export { HomePresenter };