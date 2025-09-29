import { environment } from '../../environments/environment';

export type PhotoInfo = {
  id: number;
  createdAt: Date;
  originalFilename: string;
  filePath: string;
  contentType: string;
  size: number;
};

export function getUrlPhoto(photoInfo: PhotoInfo) {
  return 'http://' + environment.API_URL + '/photos/view/' + photoInfo.id;
}

export function isVideo(contentType: string) {
  return videoFormat.includes(contentType.toLowerCase());
}

export function isImage(contentType: string) {
  return imageFormat.includes(contentType.toLowerCase());
}

const videoFormat: string[] = [
  'video/mp4',
  'video/mpeg',
  'video/ogg',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-ms-wmv',
  'video/3gpp',
  'video/3gpp2',
  'video/mp2t',
  'video/x-matroska',
  'video/x-flv',
  'video/mkv',
];

const imageFormat: string[] = ['image/jpg', 'image/png', 'image/jpeg'];
