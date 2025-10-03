import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { getUrlPhoto, isImage, isVideo, PhotoInfo } from '../../models/PhotoInfo';
import { PhotoService } from '../../service/photo-service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-photo-view',
  imports: [CommonModule],
  templateUrl: './photo-view.html',
  styleUrl: './photo-view.css',
})
export class PhotoView {
  @Input() photos: PhotoInfo[] = [];
  @Input() selectedIndex: number = 0;
  @Output() close = new EventEmitter<void>();
  @Output() delete = new EventEmitter<number>();
  @Output() addTag = new EventEmitter<number>();

  constructor(private photoService: PhotoService) {}

  ngOnInit(): void {
    window.addEventListener('keydown', this.onKeyDown);
  }

  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  // ⌨️ Teclas do teclado
  onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'ArrowRight') {
      this.next();
    } else if (event.key === 'ArrowLeft') {
      this.prev();
    } else if (event.key === 'Escape') {
      this.close.emit();
    }
  };

  next(): void {
    if (this.selectedIndex < this.photos.length - 1) {
      this.selectedIndex++;
    }
  }

  prev(): void {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
    }
  }

  emitDelete(): void {
    const photoId = this.photos[this.selectedIndex]?.id;
    this.photoService.deletePhoto(photoId).subscribe({
      next: (resp) => {
        alert(resp.message);
        this.photos.splice(this.selectedIndex, 1);
        this.close.emit();
      },
      error: (err) => console.log(err),
    });
  }

  emitDownload(): void {
    const photoId = this.photos[this.selectedIndex]?.id;
    let url = this.photoService.downloadPhoto(photoId)


    let a = document.createElement('a');
        a.download = url.replace(/^.*[\\\/]/, '');
        a.href = url;
        document.body.appendChild(a);
        a.click();
        a.remove();

  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }

  getUrl() {
    return getUrlPhoto(this.photos[this.selectedIndex]);
  }

  isImage(photo: PhotoInfo) {
    return isImage(photo.contentType);
  }

  isVideo(photo: PhotoInfo) {
    return isVideo(photo.contentType);
  }
}
