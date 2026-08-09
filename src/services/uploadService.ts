import { axiosClient } from './axiosClient';
import { compressImage, compressImages } from '../utils/imageCompressor';

export interface UploadResponse {
  url: string;
  public_id: string;
}

export const uploadSingleImageApi = async (file: File): Promise<UploadResponse> => {
  const compressedFile = await compressImage(file);
  const formData = new FormData();
  formData.append('image', compressedFile);

  return axiosClient.post<any, UploadResponse>('/upload/single', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const uploadMultipleImagesApi = async (files: File[]): Promise<UploadResponse[]> => {
  const compressedFiles = await compressImages(files);
  const formData = new FormData();
  compressedFiles.forEach((file) => {
    formData.append('images', file);
  });

  return axiosClient.post<any, UploadResponse[]>('/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const uploadImage = async (file: File): Promise<string> => {
  const response = await uploadSingleImageApi(file);
  return response.url;
};

export const deleteImageApi = async (url: string): Promise<any> => {
  return axiosClient.delete<any, any>('/upload', {
    params: { url },
  });
};
