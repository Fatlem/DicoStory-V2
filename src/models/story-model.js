import { AuthHelper } from '../utils/auth-helper.js';

class StoryModel {
  constructor() {
    this._baseUrl = 'https://story-api.dicoding.dev/v1';
  }

  async getStories(page = 1, size = 10, location = 0) {
    try {
      const token = AuthHelper.getToken();
      
      if (!token) {
        throw new Error('Anda belum login');
      }

      console.log(`Fetching stories: page=${page}, size=${size}, location=${location}`);
      const response = await fetch(
        `${this._baseUrl}/stories?page=${page}&size=${size}&location=${location}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      console.log('Stories fetched:', responseJson.listStory.length);
      return responseJson.listStory;
    } catch (error) {
      console.error('Error getting stories:', error);
      throw new Error(error.message || 'Gagal mengambil daftar cerita');
    }
  }

  async getStoryDetail(id) {
    try {
      const token = AuthHelper.getToken();
      
      if (!token) {
        throw new Error('Anda belum login');
      }

      console.log('Fetching story detail for ID:', id);
      const response = await fetch(
        `${this._baseUrl}/stories/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      console.log('Story detail fetched');
      return responseJson.story;
    } catch (error) {
      console.error('Error getting story detail:', error);
      throw new Error(error.message || 'Gagal mengambil detail cerita');
    }
  }

  async addStory(description, photoBlob, lat = null, lon = null) {
    try {
      const token = AuthHelper.getToken();
      const formData = new FormData();
      
      formData.append('description', description);
      formData.append('photo', photoBlob);
      
      if (lat !== null && lon !== null) {
        formData.append('lat', lat);
        formData.append('lon', lon);
      }

      const url = token
        ? `${this._baseUrl}/stories`
        : `${this._baseUrl}/stories/guest`;

      const headers = token
        ? { 'Authorization': `Bearer ${token}` }
        : {};

      console.log('Adding new story', token ? 'with auth' : 'as guest');
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      console.log('Story added successfully');
      return responseJson;
    } catch (error) {
      console.error('Error adding story:', error);
      throw new Error(error.message || 'Gagal menambahkan cerita');
    }
  }
}

export { StoryModel };