import { supabase } from './supabaseClient';

export class StorageService {
  async uploadFile(bucket: 'nexus-media' | 'nexus-documents', path: string, file: File) {
    if (!supabase) {
      console.warn('Supabase not initialized, cannot upload file.');
      return null;
    }

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
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

  async getPublicUrl(bucket: 'nexus-media' | 'nexus-documents', path: string) {
    if (!supabase) return null;

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async createSignedUrl(bucket: 'nexus-media' | 'nexus-documents', path: string, expiresIn = 3600) {
    if (!supabase) return null;

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  }

  async deleteFile(bucket: 'nexus-media' | 'nexus-documents', path: string) {
    if (!supabase) return null;

    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
    return data;
  }

  async listFiles(bucket: 'nexus-media' | 'nexus-documents', path: string = '') {
    if (!supabase) return [];

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path);

    if (error) throw error;
    return data;
  }
}

export const storageService = new StorageService();
