import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { PhotoService } from '../../service/photo-service';
import { environment } from '../../../environments/environment';
import {
  ProgressFileResponse,
  UploadFIleResponse as UploadFileResponse,
} from '../../models/MessageResponse';
import { every, Subject } from 'rxjs';

interface SelectedFile {
  file: File;
  name: string;
  size: number;
  type: string;
  uploading?: boolean;
  progress?: number;
  error?: string;
  completed?: boolean;
}

@Component({
  imports: [CommonModule],
  selector: 'app-photo-upload',
  templateUrl: './photo-upload.html',
  styleUrls: ['./photo-upload.css'],
})
export class PhotoUpload {
  @Output() loadPhotos = new EventEmitter<void>();

  selectedFiles: Map<string, SelectedFile> = new Map<string, SelectedFile>();
  isDragOver = false;
  isUploading = false;
  socket!: WebSocket;
  private messageSubject = new Subject<any>();

  // Tipos de arquivo aceitos
  readonly acceptedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/webm',
  ];

  constructor(private photoService: PhotoService) {
    this.connectWebSocket();
  }

  connectWebSocket(): void {
    this.socket = new WebSocket('ws:' + environment.API_URL);

    this.socket.onopen = () => {
      console.log('Conexão estabelecida');
    };

    this.socket.onclose = () => {
      setTimeout(() => {
        this.connectWebSocket();
      }, 5000);
    };

    this.socket.onmessage = (event: MessageEvent) => {
      console.log(event);
      try {
        const data = JSON.parse(event.data);

        if (this.isProgressFileResponse(data)) {
          this.handleProgressResponse(data);
        } else if (this.isUploadFileResponse(data)) {
          this.handleUploadResponse(data);
        } else {
          // Mensagem de texto simples
          console.log('Mensagem chegou: ' + event.data);
        }
      } catch (error) {
        // Se não for JSON, trata como texto simples
        console.log('Mensagem chegou: ' + event.data);
      }
    };

    this.socket.onerror = (error) => {
      console.error('Erro WebSocket:', error);
    };

    this.messageSubject.subscribe((data: any) => {});
  }

  // Type guards
  private isProgressFileResponse(data: any): data is ProgressFileResponse {
    return (
      data &&
      typeof data.filename === 'string' &&
      typeof data.chunksSended === 'number' &&
      typeof data.totalChunks === 'number'
    );
  }

  private isUploadFileResponse(data: any): data is UploadFileResponse {
    return (
      data &&
      data.photo &&
      typeof data.photo.originalFilename === 'string' &&
      typeof data.message === 'string'
    );
  }

  // Handlers específicos
  private handleProgressResponse(response: ProgressFileResponse): void {
    console.log('Progress response:', response);

    const selectedFile = this.selectedFiles.get(response.filename);
    if (selectedFile) {
      // Corrigindo o cálculo do progresso
      selectedFile.progress = Math.round((response.chunksSended / response.totalChunks) * 100);
    }
  }

  private handleUploadResponse(response: UploadFileResponse): void {
    console.log('Upload response:', response);

    const selectedFile = this.selectedFiles.get(response.photo.originalFilename);
    if (selectedFile) {
      selectedFile.completed = true;
      selectedFile.uploading = false;
      selectedFile.progress = 100;
    }

    if (this.getUploadingCount() == this.selectedFiles.size) {
      this.isUploading = false;
      this.selectedFiles.clear();
      this.loadPhotos.emit();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFiles(Array.from(input.files));
      input.value = ''; // Reset input para permitir selecionar os mesmos arquivos novamente
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.processFiles(Array.from(event.dataTransfer.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  private processFiles(files: File[]): void {
    const validFiles = files.filter((file) => this.isValidFileType(file));

    if (validFiles.length === 0) {
      alert('Por favor, selecione apenas arquivos de imagem ou vídeo.');
      return;
    }

    validFiles.map((file) =>
      this.selectedFiles.set(file.name, {
        file,
        name: file.name,
        size: file.size,
        type: this.getFileType(file.type),
      })
    );
  }

  private isValidFileType(file: File): boolean {
    return this.acceptedTypes.includes(file.type.toLowerCase());
  }

  private getFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) {
      return 'Imagem';
    } else if (mimeType.startsWith('video/')) {
      return 'Vídeo';
    }
    return 'Arquivo';
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) {
      return '🖼️';
    } else if (mimeType.startsWith('video/')) {
      return '🎥';
    }
    return '📄';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  removeFile(filename: string): void {
    this.selectedFiles.delete(filename);
  }

  clearAllFiles(): void {
    this.selectedFiles.clear();
  }

  getUploadingCount(): number {
    let count = 0;
    this.selectedFiles.forEach((file) => {
      if (file.completed) {
        count++;
      }
    });
    return count;
  }

  uploadFiles(): void {
    if (this.selectedFiles.size === 0 || this.isUploading) {
      return;
    }

    this.isUploading = true;

    const files = Array.from(this.selectedFiles.values()).map((file) => {
      file.uploading = true
      return file.file;
    });

    // Upload dos arquivos via WebSocket
    this.photoService.sendFiles(this.socket, files);
  }
}
