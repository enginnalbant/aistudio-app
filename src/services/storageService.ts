import { supabase } from './supabaseClient';

export class StorageService {
  async uploadFile(userId: string, bucket: 'nexus-media' | 'nexus-documents', path: string, file: File) {
    if (!supabase) {
      console.warn('Supabase not initialized, cannot upload file.');
      return null;
    }

    const userPath = `${userId}/${path}`;

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(userPath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error uploading file:', err);
      throw err;
    }
  }

  async getPublicUrl(userId: string, bucket: 'nexus-media' | 'nexus-documents', path: string) {
    if (!supabase) return null;

    const userPath = `${userId}/${path}`;

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(userPath);

    return data.publicUrl;
  }

  async createSignedUrl(userId: string, bucket: 'nexus-media' | 'nexus-documents', path: string, expiresIn = 3600) {
    if (!supabase) return null;

    const userPath = `${userId}/${path}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(userPath, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  }

  async deleteFile(userId: string, bucket: 'nexus-media' | 'nexus-documents', path: string) {
    if (!supabase) return null;

    const userPath = `${userId}/${path}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([userPath]);

    if (error) throw error;
    return data;
  }

  async listFiles(userId: string, bucket: 'nexus-media' | 'nexus-documents', path: string = '') {
    if (!supabase) return [];

    const userPath = `${userId}/${path}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(userPath);

    if (error) throw error;
    return data;
  }
}

export const storageService = new StorageService();
