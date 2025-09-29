import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

export interface PageResponse {
  content: any[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.html',
  styleUrls: ['./pagination.css'],
  imports: [CommonModule]
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage: number = 0;
  @Input() pageSize: number = 50;
  @Input() totalPages: number = 0;
  @Input() totalElements: number = 0;
  @Input() maxVisiblePages: number = 5;

  @Output() pageChange = new EventEmitter<{ page: number, size: number }>();

  visiblePages: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentPage'] || changes['totalPages'] || changes['maxVisiblePages']) {
      this.updateVisiblePages();
    }
  }

  private updateVisiblePages(): void {
    this.visiblePages = this.calculateVisiblePages();
  }

  private calculateVisiblePages(): number[] {
    if (this.totalPages <= 1) {
      return [];
    }

    const pages: number[] = [];
    const half = Math.floor(this.maxVisiblePages / 2);
    let start = Math.max(0, this.currentPage - half);
    let end = Math.min(this.totalPages, start + this.maxVisiblePages);

    // Ajustar o início se estiver perto do final
    if (end - start < this.maxVisiblePages) {
      start = Math.max(0, end - this.maxVisiblePages);
    }

    // Primeira página
    if (start > 0) {
      pages.push(0);
      if (start > 1) {
        pages.push(-1); // Indicador de ellipsis
      }
    }

    // Páginas do meio
    for (let i = start; i < end; i++) {
      pages.push(i);
    }

    // Última página
    if (end < this.totalPages) {
      if (end < this.totalPages - 1) {
        pages.push(-1); // Indicador de ellipsis
      }
      pages.push(this.totalPages - 1);
    }

    return pages;
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.emitPageChange();
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.emitPageChange();
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.emitPageChange();
    }
  }

  goToFirstPage(): void {
    if (this.currentPage !== 0) {
      this.currentPage = 0;
      this.emitPageChange();
    }
  }

  goToLastPage(): void {
    if (this.currentPage !== this.totalPages - 1) {
      this.currentPage = this.totalPages - 1;
      this.emitPageChange();
    }
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newSize = parseInt(select.value, 10);

    if (newSize !== this.pageSize) {
      this.pageSize = newSize;
      this.currentPage = 0; // Reset para primeira página ao mudar o tamanho
      this.emitPageChange();
    }
  }

  private emitPageChange(): void {
    this.pageChange.emit({
      page: this.currentPage,
      size: this.pageSize
    });
    this.updateVisiblePages();
  }
}
