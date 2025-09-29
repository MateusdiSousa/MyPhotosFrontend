import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { PhotoService } from '../../service/photo-service';
import { environment } from '../../../environments/environment';

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

  selectedFiles: SelectedFile[] = [];
  isDragOver = false;
  isUploading = false;
  socket!: WebSocket;

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

    this.socket.onmessage = (event: MessageEvent<string>) => {
      console.log('Mensagem chegou: ' + event.data);
    };

    this.socket.onerror = (error) => {
      console.error('Erro WebSocket:', error);
    };
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

    // Adicionar apenas arquivos novos (evitar duplicatas por nome)
    const newFiles = validFiles.filter(
      (newFile) =>
        !this.selectedFiles.some(
          (existingFile) => existingFile.name === newFile.name && existingFile.size === newFile.size
        )
    );

    const newSelectedFiles: SelectedFile[] = newFiles.map((file) => ({
      file,
      name: file.name,
      size: file.size,
      type: this.getFileType(file.type),
    }));

    this.selectedFiles = [...this.selectedFiles, ...newSelectedFiles];

    // Mostrar alerta se alguns arquivos foram filtrados
    if (validFiles.length !== files.length) {
      const invalidCount = files.length - validFiles.length;
      alert(
        `${invalidCount} arquivo(s) inválido(s) foram ignorados. Apenas imagens e vídeos são permitidos.`
      );
    }
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

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  clearAllFiles(): void {
    this.selectedFiles = [];
  }

  getUploadingCount(): number {
    return this.selectedFiles.filter((file) => file.completed).length;
  }

  uploadFiles(): void {
    if (this.selectedFiles.length === 0 || this.isUploading) {
      return;
    }

    this.isUploading = true;

    const files = this.selectedFiles.map((item) => item.file);

    // Upload dos arquivos via WebSocket
    this.photoService.sendFiles(this.socket, files)

    this.isUploading = false

    this.clearAllFiles()

    setTimeout(() => this.loadPhotos.emit(), 5000)

  }
}
