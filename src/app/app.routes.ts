import { Routes } from '@angular/router';
import { PhotoUpload } from './components/photo-upload/photo-upload';
import { Home } from './page/home/home';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  { path: 'upload', component: PhotoUpload },
];
