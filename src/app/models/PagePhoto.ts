import { PhotoInfo } from "./PhotoInfo";

export type PagePhoto = {
  photos: PhotoInfo[]
  pageSize: number;
  pageNumber: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalPhotos: number;
  totalPages: number;
  firstPage: boolean;
  lastPage: boolean;
};
