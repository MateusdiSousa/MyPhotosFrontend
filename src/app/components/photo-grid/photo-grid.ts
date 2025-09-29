import { Component, Input } from '@angular/core';
import { PhotoItem } from '../photo-item/photo-item';
import { PhotoInfo } from '../../models/PhotoInfo';
import { CommonModule } from '@angular/common';
import { PhotoView } from '../photo-view/photo-view';
import { PhotoService } from '../../service/photo-service';
import { isVideo, isImage } from '../../models/PhotoInfo';

@Component({
  selector: 'app-photo-grid',
  imports: [PhotoItem, CommonModule, PhotoView],
  templateUrl: './photo-grid.html',
  styleUrl: './photo-grid.css',
})
export class PhotoGrid {
  @Input() photos: PhotoInfo[] = [];
  selectedPhotos: Set<number> = new Set();
  isSelectionMode: boolean = false;
  modalVisible: boolean = false;
  selectedPhotoIndex: number = 0;

  constructor(private photoService: PhotoService) {}

  // Selection mode
  toggleSelectionMode() {
    this.isSelectionMode = !this.isSelectionMode;
    if (!this.isSelectionMode) {
      this.selectedPhotos.clear();
    }
  }

  togglePhotoSelection(index: number) {
    if (this.selectedPhotos.has(index)) {
      this.selectedPhotos.delete(index);
    } else {
      this.selectedPhotos.add(index);
    }
  }

  deleteSelectedPhotos() {
    this.selectedPhotos.forEach((photoIndex) => {
      console.log(photoIndex);
      this.photoService.deletePhoto(this.photos[photoIndex].id).subscribe({
        next: () => {
          console.log('Foto deletada');
        },
        error: (err) => {
          console.log('Erro ao deletar foto: ' + err);
        },
      });
    });
    this.photos = this.photos.filter((_, index) => !this.selectedPhotos.has(index));
    this.selectedPhotos.clear();
  }

  selectAll() {
    if (this.selectedPhotos.size === this.photos.length) {
      this.selectedPhotos.clear(); // Desseleciona todas
    } else {
      this.photos.forEach((_, index) => this.selectedPhotos.add(index));
    }
  }

  get selectedCount(): number {
    return this.selectedPhotos.size;
  }

  isPhotoSelected(index: number): boolean {
    return this.selectedPhotos.has(index);
  }

  isImage(photo: PhotoInfo) {
    return isImage(photo.contentType);
  }

  isVideo(photo: PhotoInfo) {
    return isVideo(photo.contentType);
  }

  // Normal Mode
  openModal(index: number): void {
    if (!this.isSelectionMode) {
      this.selectedPhotoIndex = index;
      this.modalVisible = true;
    }
  }

  handleSelection(index: number) {
    if (this.isSelectionMode) {
      this.togglePhotoSelection(index);
    } else {
      this.openModal(index);
    }
  }

  closeModal(): void {
    this.modalVisible = false;
  }

  handleDelete(id: number): void {
    // Aqui você pode emitir um evento ou chamar um serviço para deletar
    this.photos = this.photos.filter((photo) => photo.id !== id);
    this.closeModal();
  }
}
