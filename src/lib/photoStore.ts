import { set, keys, del, getMany } from 'idb-keyval';

export type Photo = {
  id: string;
  dataUrl: string;
  timestampMs: number;
  locationLabel: string;
};

const PHOTO_PREFIX = 'heliotrip_photo_';

export const savePhoto = async (photo: Photo): Promise<void> => {
  await set(`${PHOTO_PREFIX}${photo.id}`, photo);
};

export const loadAllPhotos = async (): Promise<Photo[]> => {
  const allKeys = await keys();
  const photoKeys = allKeys.filter(
    (key) => typeof key === 'string' && key.startsWith(PHOTO_PREFIX)
  );

  const loadedPhotos = await getMany<Photo>(photoKeys);
  const photos = loadedPhotos.filter((photo): photo is Photo => photo !== undefined);

  // Sortera nyast först
  return photos.sort((a, b) => b.timestampMs - a.timestampMs);
};

export const deletePhoto = async (id: string): Promise<void> => {
  await del(`${PHOTO_PREFIX}${id}`);
};
