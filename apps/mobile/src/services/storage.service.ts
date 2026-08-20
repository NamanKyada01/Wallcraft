import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library/legacy';

export const storageService = {
  async requestPermissions(): Promise<boolean> {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  },

  async downloadAndSave(uri: string, filename: string): Promise<string | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Storage permission denied');
    }

    const fileUri = `${FileSystem.cacheDirectory}${filename}`;
    const { uri: localUri } = await FileSystem.downloadAsync(uri, fileUri);

    await MediaLibrary.saveToLibraryAsync(localUri);
    await FileSystem.deleteAsync(fileUri, { idempotent: true });

    return localUri;
  },
};
