import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagePhoto } from '../models/PagePhoto';
import { MessageResponse } from '../models/MessageResponse';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  private apiUrl = 'http://' + environment.API_URL + '/photos';

  constructor(private http: HttpClient) {}

  getPhotos(pageNumber: number = 0, pageSize: number = 50): Observable<PagePhoto> {
    const params = new HttpParams()
      .set('page_size', pageSize.toString())
      .set('page_number', pageNumber.toString());

    return this.http.get<PagePhoto>(`${this.apiUrl}/view`, { params });
  }

  deletePhoto(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(this.apiUrl + '/delete/' + id);
  }

  downloadPhoto(id: number): string {
    return this.apiUrl + "/download/"+ id;
  }

  sendFiles(session: WebSocket, files: File[]) {
    files.forEach((file) => {
      if (file.size > environment.MAX_SIZE_FILE * 1024 * 1024) {
        this.sendFileByPackage(session, file);
      } else {
        this.sendPhoto(session, file);
      }
    });
  }

  async sendPhoto(session: WebSocket, file: File) {
    const filenameBytes: Uint8Array = new TextEncoder().encode(file.name);
    const contentTypeBytes: Uint8Array = new TextEncoder().encode(file.type);
    const fileSize = BigInt(file.size);
    const content: Uint8Array = await this.readFileAsUint8Array(file);

    const buffer: ArrayBuffer = this.createPhotoBuffer(
      filenameBytes.length,
      contentTypeBytes.length,
      fileSize
    );

    const view = new DataView(buffer);
    let offset = 0;

    view.setInt32(offset, 1);
    offset += 4;

    view.setInt32(offset, filenameBytes.length);
    offset += 4;

    new Uint8Array(buffer, offset, filenameBytes.length).set(filenameBytes);
    offset += filenameBytes.length;

    view.setInt32(offset, contentTypeBytes.length);
    offset += 4;

    new Uint8Array(buffer, offset, contentTypeBytes.length).set(contentTypeBytes);
    offset += contentTypeBytes.length;

    view.setBigInt64(offset, fileSize);
    offset += 8;

    new Uint8Array(buffer, offset, content.length).set(content);

    if (session.readyState === WebSocket.OPEN) {
      session.send(buffer);
    }
  }

  async readFileAsUint8Array(file: File): Promise<Uint8Array> {
    const array = await file.arrayBuffer();
    return new Uint8Array(array);
  }

  createPhotoBuffer(
    filenameSize: number,
    contentTypeSize: number,
    contentSize: bigint
  ): ArrayBuffer {
    const totalSize: number =
      4 + // Protocol
      4 +
      filenameSize + // Filename
      4 +
      contentTypeSize + // FileType
      8 +
      Number(contentSize); // content file

    return new ArrayBuffer(totalSize);
  }

  async sendFileByPackage(session: WebSocket, file: File) {
    const uuid = new TextEncoder().encode(crypto.randomUUID());
    const fileSize: number = file.size;
    const filenameBytes: Uint8Array = new TextEncoder().encode(file.name);
    const contentTypeBytes: Uint8Array = new TextEncoder().encode(file.type);
    const totalChunkNumber: number = Math.ceil(
      fileSize / (environment.MAX_SIZE_FILE * 1024 * 1024)
    );

    const content = await file.arrayBuffer();
    const chunkSize = environment.MAX_SIZE_FILE * 1024 * 1024;
    let fileOffset = 0;

    console.log('Quantidade de chunks a serem enviados: ' + totalChunkNumber);

    for (let index = 0; index < totalChunkNumber; index++) {
      let chunkContent: ArrayBuffer;

      if (fileOffset + chunkSize >= fileSize) {
        chunkContent = content.slice(fileOffset);
      } else {
        chunkContent = content.slice(fileOffset, fileOffset + chunkSize);
      }
      fileOffset += chunkContent.byteLength;

      // preenche os dados do buffer
      const chunkBuffer = this.fillVideoBuffer(
        uuid,
        filenameBytes,
        contentTypeBytes,
        fileSize,
        index,
        totalChunkNumber,
        chunkContent
      );

      if (session.readyState === WebSocket.OPEN) {
        session.send(chunkBuffer);
      }

      console.log(file.name + ' chunk nº' + (index + 1) + ' enviado com sucesso');
    }
  }

  createVideoBuffer(
    uuidSize: number,
    filenameSize: number,
    contentTypeSize: number,
    chunkContentsize: bigint
  ): ArrayBuffer {
    const totalSize: number =
      4 + // Protocol
      uuidSize +
      4 +
      filenameSize + // Filename size and Filename
      4 +
      contentTypeSize + // FileType size and FileType
      8 + // total content size
      4 + // chunkNumber
      4 + // total chunk
      Number(chunkContentsize); // chunk content
    return new ArrayBuffer(totalSize);
  }

  fillVideoBuffer(
    uuid: Uint8Array,
    filenameBytes: Uint8Array,
    contentTypeBytes: Uint8Array,
    fileSize: number,
    index: number,
    totalChunkNumber: number,
    chunkContent: ArrayBuffer
  ): ArrayBuffer {
    // Cria um buffer vazio para enviar o chunk
    const chunkBuffer: ArrayBuffer = this.createVideoBuffer(
      uuid.length,
      filenameBytes.length,
      contentTypeBytes.length,
      BigInt(chunkContent.byteLength)
    );

    const view: DataView = new DataView(chunkBuffer);
    let chunkOffset: number = 0;

    // Protocolo
    view.setInt32(chunkOffset, 2);
    chunkOffset += 4;

    // UUID do video
    new Uint8Array(chunkBuffer, chunkOffset, uuid.length).set(uuid);
    chunkOffset += uuid.length;

    // Tamanho do filename e seus bytes
    view.setInt32(chunkOffset, filenameBytes.length);
    chunkOffset += 4;
    new Uint8Array(chunkBuffer, chunkOffset, filenameBytes.length).set(filenameBytes);
    chunkOffset += filenameBytes.length;

    // Tamanho do contentType e seus bytes
    view.setInt32(chunkOffset, contentTypeBytes.length);
    chunkOffset += 4;
    new Uint8Array(chunkBuffer, chunkOffset, contentTypeBytes.length).set(contentTypeBytes);
    chunkOffset += contentTypeBytes.length;

    // tamanho total do vídeo
    view.setBigInt64(chunkOffset, BigInt(fileSize));
    chunkOffset += 8;

    // Nº do chunk
    view.setInt32(chunkOffset, index + 1);
    chunkOffset += 4;

    // Total de chunks
    view.setInt32(chunkOffset, totalChunkNumber);
    chunkOffset += 4;

    new Uint8Array(chunkBuffer, chunkOffset, chunkContent.byteLength).set(
      new Uint8Array(chunkContent)
    );

    return chunkBuffer;
  }
}
