import { Component, Input } from '@angular/core';
import { getUrlPhoto, PhotoInfo } from '../../models/PhotoInfo';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-photo-item',
  imports: [CommonModule],
  templateUrl: './photo-item.html',
  styleUrl: './photo-item.css',
  standalone: true,
})
export class PhotoItem {
  @Input() photo!: PhotoInfo;
  @Input() isSelectionMode!: boolean;
  @Input() isPhotoSelected!: boolean;
  @Input() isImage: boolean = false;
  @Input() isVideo: boolean = false;

  public getUrl() {
    return getUrlPhoto(this.photo);
  }

  public formatSize(size: number): string {
  if (size === 0) return '0 Bytes';

  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const base = 1024;
  const exponent = Math.floor(Math.log(size) / Math.log(base));
  const formattedSize = (size / Math.pow(base, exponent)).toFixed(2);

  return `${formattedSize} ${units[exponent]}`;
}
}
