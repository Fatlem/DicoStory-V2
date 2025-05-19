import { HomePage } from '../views/pages/home.js';
import { AddStoryPage } from '../views/pages/add-story.js';
import { MapPage } from '../views/pages/map.js';
import { DetailPage } from '../views/pages/detail.js';
import { LoginPage } from '../views/pages/login.js';
import { RegisterPage } from '../views/pages/register.js';
import { NotFoundPage } from '../views/pages/not-found.js';
import { FavoritesPage } from '../views/pages/favorites.js';

const routes = {
  '/': {
    view: HomePage,
  },
  '/add': {
    view: AddStoryPage,
  },
  '/map': {
    view: MapPage,
  },
  '/detail': {
    view: DetailPage,
  },
  '/login': {
    view: LoginPage,
  },
  '/register': {
    view: RegisterPage,
  },
  '/favorites': {
    view: FavoritesPage,
  },
  '/404': {
    view: NotFoundPage,
  }
};

export { routes };