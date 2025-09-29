import { PhotoInfo } from "./PhotoInfo";

export type MessageResponse = {
  message : string
}

export type UploadFIleResponse = {
    photo : PhotoInfo;
    message : string;
}

export type ProgressFileResponse =  {
    filename : string;
    chunksSended : number;
    totalChunks : number;
}
