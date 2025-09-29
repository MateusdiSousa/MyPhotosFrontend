import { Component } from '@angular/core';
import { PhotoGrid } from '../../components/photo-grid/photo-grid';
import { PhotoInfo } from '../../models/PhotoInfo';
import { PhotoService } from '../../service/photo-service';
import { CommonModule } from '@angular/common';
import { PhotoUpload } from '../../components/photo-upload/photo-upload';
import { PaginationComponent } from '../../components/pagination/pagination';

@Component({
  selector: 'app-home',
  imports: [PhotoGrid, CommonModule, PhotoUpload, PaginationComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  photos: PhotoInfo[] = [];

  currentPage: number = 0;
  pageSize: number = 12;
  totalPages: number = 0;
  totalElements: number = 0;
  maxVisiblePages: number = 5;

  constructor(private photoService: PhotoService) {}

  ngOnInit(): void {
    this.loadPhotos();
  }

  onPageChange(data: { page: number; size: number }): void {
    this.currentPage = data.page;
    this.pageSize = data.size
    this.loadPhotos()
  }

  loadPhotos(): void {
    this.photoService.getPhotos(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.photos = data.photos;
        this.currentPage = data.pageNumber;
        this.pageSize = data.pageSize;
        this.totalPages = data.totalPages;
        this.totalElements = data.totalPhotos;
        this.maxVisiblePages = this.totalPages - this.currentPage;
        console.log(data);
      },
      error: (err) => console.error('Erro ao buscar fotos: ' + err),
    });
  }
}
