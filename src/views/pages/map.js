import { StoryModel } from '../../models/story-model.js';
import { MapPresenter } from '../../presenters/map-presenter.js';

class MapPage {
  constructor() {
    this._model = new StoryModel();
    this._presenter = null;
    this._map = null;
    this._markers = [];
    this._markerCluster = null;
  }

  async render() {
    console.log('Rendering map page');
    return `
      <section class="map-page page-transition">
        <div class="coordinator-layout">
          <div class="coordinator-header">
            <div>
              <h2 class="coordinator-title">Peta Cerita</h2>
              <p>Jelajahi cerita berdasarkan lokasi di seluruh dunia</p>
            </div>
            <div class="map-controls">
              <div class="map-info">
                <span class="map-stats">
                  <i class="fas fa-map-marker-alt"></i> <span id="stories-count">0</span> Cerita dengan Lokasi
                </span>
              </div>
            </div>
          </div>
          
          <div class="map-container-wrapper">
            <div id="stories-map-container" class="stories-map-container">
              <!-- Map will be rendered here -->
            </div>
            <div id="map-loading-overlay" class="map-loading-overlay">
              <div class="loader"></div>
            </div>
          </div>
          
          <div id="error-container" class="error-container hidden"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    console.log('Map page afterRender');
    this._presenter = new MapPresenter(this._model, this);
    
    setTimeout(() => {
      this._initMap();
    
      this._presenter.getStoriesWithLocation();
    }, 100);
  }

  _initMap() {
    try {
      console.log('Initializing stories map');
      this._map = L.map('stories-map-container').setView([-2.5489, 118.0149], 5); // Indonesia center
      
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      });
      
      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
      });
      
      const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        maxZoom: 17
      });

      const cartoDBLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      });

      const stamenLayer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 18,
        ext: 'png'
      });
      
      const baseMaps = {
        "OpenStreetMap": osmLayer,
        "CartoDB Light": cartoDBLayer,
        "Stamen Terrain": stamenLayer,
        "Satelit": satelliteLayer,
        "Topografi": topoLayer
      };
      
      L.control.layers(baseMaps).addTo(this._map);
      
      L.control.scale().addTo(this._map);
      
      osmLayer.addTo(this._map);
      
      this._map.locate({ setView: true, maxZoom: 6 });
    
      this._markerCluster = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 50,
        iconCreateFunction: function(cluster) {
          const count = cluster.getChildCount();
          let size = 'small';
          
          if (count > 10) {
            size = 'medium';
          }
          if (count > 25) {
            size = 'large';
          }
          
          return L.divIcon({
            html: `<div class="cluster-icon"><span>${count}</span></div>`,
            className: `marker-cluster marker-cluster-${size}`,
            iconSize: L.point(40, 40)
          });
        }
      });
      
      this._map.addLayer(this._markerCluster);
      
      setTimeout(() => {
        this._map.invalidateSize();
      }, 100);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  showLoading() {
    const mapLoadingOverlay = document.getElementById('map-loading-overlay');
    if (mapLoadingOverlay) {
      mapLoadingOverlay.classList.add('active');
    }
    
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
      errorContainer.classList.add('hidden');
    }
  }

  hideLoading() {
    const mapLoadingOverlay = document.getElementById('map-loading-overlay');
    if (mapLoadingOverlay) {
      mapLoadingOverlay.classList.remove('active');
    }
  }

  renderStoriesOnMap(stories) {
    console.log('Rendering stories on map:', stories.length);
    this.hideLoading();
    
    this._clearMarkers();
    
    if (stories.length === 0) {
      this.showError('Tidak ada cerita dengan lokasi yang tersedia');
      return;
    }
    
    const storiesCountElement = document.getElementById('stories-count');
    if (storiesCountElement) {
      storiesCountElement.textContent = stories.length;
    }
    
    stories.forEach((story) => {
      if (story.lat && story.lon) {
        try {
          const marker = L.marker([story.lat, story.lon], {
            icon: L.divIcon({
              html: `<div class="custom-marker"><i class="fas fa-map-marker-alt"></i></div>`,
              className: 'custom-marker-container',
              iconSize: [30, 42],
              iconAnchor: [15, 42]
            })
          });
          
          const popupContent = `
            <div class="map-popup">
              <img src="${story.photoUrl}" alt="${story.name}" width="100%">
              <h3>${story.name}</h3>
              <p>${this._truncateText(story.description, 100)}</p>
              <button class="btn view-details-btn" data-id="${story.id}">
                <i class="fas fa-eye"></i> View Details
              </button>
            </div>
          `;
          
          marker.bindPopup(popupContent, {
            maxWidth: 300,
            minWidth: 200,
            className: 'custom-popup'
          });
          
          this._markerCluster.addLayer(marker);
          this._markers.push(marker);
          
          marker.on('popupopen', () => {
            const btn = document.querySelector(`.view-details-btn[data-id="${story.id}"]`);
            if (btn) {
              btn.addEventListener('click', () => {
                window.selectedStoryId = story.id;
                window.location.href = '#/detail';
              });
            }
          });
        } catch (error) {
          console.error('Error adding marker for story:', story.id, error);
        }
      }
    });
    
    if (this._markers.length > 0 && this._markerCluster.getLayers().length > 0) {
      this._map.fitBounds(this._markerCluster.getBounds().pad(0.1));
    }
  }

  _clearMarkers() {
    if (this._markerCluster) {
      this._markerCluster.clearLayers();
    }
    this._markers = [];
  }

  showError(message) {
    this.hideLoading();
    
    const errorContainer = document.getElementById('error-container');
    if (!errorContainer) {
      console.error('Error container not found');
      return;
    }
    
    errorContainer.classList.remove('hidden');
    errorContainer.innerHTML = `
      <div class="error-content">
        <i class="fas fa-exclamation-triangle fa-3x"></i>
        <h3>Tidak ada cerita dengan lokasi</h3>
        <p>${message}</p>
        <button id="retry-button" class="btn">
          <i class="fas fa-sync-alt"></i> Coba Lagi
        </button>
      </div>
    `;
    
    const retryButton = document.getElementById('retry-button');
    if (retryButton) {
      retryButton.addEventListener('click', async () => {
        await this._presenter.getStoriesWithLocation();
      });
    }
  }

  _truncateText(text, maxLength) {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substr(0, maxLength) + '...';
  }

  beforeUnload() {
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
  }
}

export { MapPage };