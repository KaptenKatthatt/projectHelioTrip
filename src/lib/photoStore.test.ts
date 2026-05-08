import { describe, expect, it, vi, beforeEach } from 'vitest';
import { savePhoto, loadAllPhotos, deletePhoto } from './photoStore';
import type { Photo } from './photoStore';
import * as idb from 'idb-keyval';

vi.mock('idb-keyval', () => ({
  get: vi.fn(),
  set: vi.fn(),
  keys: vi.fn(),
  del: vi.fn(),
  getMany: vi.fn(),
}));

describe('photoStore', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const mockPhoto1: Photo = {
    id: '1',
    dataUrl: 'data:image/png;base64,123',
    timestampMs: 1000,
    locationLabel: 'Earth',
  };

  const mockPhoto2: Photo = {
    id: '2',
    dataUrl: 'data:image/png;base64,456',
    timestampMs: 2000,
    locationLabel: 'Mars',
  };

  describe('savePhoto', () => {
    it('saves a photo with the correct key prefix', async () => {
      await savePhoto(mockPhoto1);
      expect(idb.set).toHaveBeenCalledTimes(1);
      expect(idb.set).toHaveBeenCalledWith('heliotrip_photo_1', mockPhoto1);
    });
  });

  describe('loadAllPhotos', () => {
    it('loads all photos and sorts them by timestamp descending', async () => {
      vi.mocked(idb.keys).mockResolvedValue([
        'heliotrip_photo_1',
        'heliotrip_photo_2',
        'other_key',
        123, // Invalid key type to test filtering
      ]);
      vi.mocked(idb.getMany).mockResolvedValue([mockPhoto1, mockPhoto2]);

      const photos = await loadAllPhotos();

      expect(idb.keys).toHaveBeenCalledTimes(1);
      expect(idb.getMany).toHaveBeenCalledTimes(1);
      expect(idb.getMany).toHaveBeenCalledWith(['heliotrip_photo_1', 'heliotrip_photo_2']);

      // Should be sorted by timestamp descending (newest first)
      expect(photos).toEqual([mockPhoto2, mockPhoto1]);
    });

    it('returns an empty array if no photos are found', async () => {
      vi.mocked(idb.keys).mockResolvedValue(['other_key']);
      vi.mocked(idb.getMany).mockResolvedValue([]);

      const photos = await loadAllPhotos();

      expect(idb.keys).toHaveBeenCalledTimes(1);
      expect(idb.getMany).toHaveBeenCalledWith([]);
      expect(photos).toEqual([]);
    });

    it('handles undefined results from idb.get', async () => {
      vi.mocked(idb.keys).mockResolvedValue(['heliotrip_photo_1']);
      vi.mocked(idb.getMany).mockResolvedValue([undefined]);

      const photos = await loadAllPhotos();

      expect(photos).toEqual([]);
    });
  });

  describe('deletePhoto', () => {
    it('deletes a photo with the correct key prefix', async () => {
      await deletePhoto('1');
      expect(idb.del).toHaveBeenCalledTimes(1);
      expect(idb.del).toHaveBeenCalledWith('heliotrip_photo_1');
    });
  });
});
