export enum ViewState {
  LOADING = 'LOADING',
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  NOTES = 'NOTES',
  ACCOUNTS = 'ACCOUNTS',
  STORAGE = 'STORAGE',
}

export interface UserProfile {
  $id: string;
  name: string;
  email: string;
}

export interface Note {
  $id: string;
  title: string;
  content: string; // HTML string
  updatedAt: string;
}

export enum PlatformType {
  FACEBOOK = 'Facebook',
  GOOGLE = 'Google',
  GITHUB = 'GitHub',
  OTHER = 'Other',
}

export interface PasswordAccount {
  $id: string;
  platform: PlatformType;
  accountName?: string;
  email?: string;
  password?: string; // In a real app, this should be encrypted server-side
}

export interface StorageCategory {
  $id: string;
  name: string;
  type: 'image' | 'file';
}

export interface StorageFile {
  $id: string; // Database Document ID
  fileId: string; // Bucket File ID
  name: string;
  categoryId: string;
  mimeType: string;
  size: number;
}