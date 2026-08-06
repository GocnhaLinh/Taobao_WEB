import { useRef, useCallback } from 'react';
import { deleteImageApi } from '../services/uploadService';

/**
 * Custom hook to track newly uploaded image URLs during a modal form session.
 * If the user cancels or closes the modal without saving (submitting),
 * `cleanupUnsavedImages()` automatically deletes all newly uploaded unsaved images from the server/Cloudinary.
 *
 * Performance: Uses `useRef` (Set<string>) to prevent unnecessary React re-renders.
 */
export function useAutoDeleteUnsavedImage() {
  const unsavedUrlsRef = useRef<Set<string>>(new Set());

  /**
   * Track a newly uploaded image URL.
   */
  const trackUploadedUrl = useCallback((url: string) => {
    if (url && (url.includes('cloudinary.com') || url.includes('res.cloudinary.com'))) {
      unsavedUrlsRef.current.add(url);
    }
  }, []);

  /**
   * Remove a URL from tracking (e.g. when manually deleted by user via [X] button).
   */
  const untrackUrl = useCallback((url: string) => {
    if (url) {
      unsavedUrlsRef.current.delete(url);
    }
  }, []);

  /**
   * Commit all tracked images (e.g. on successful form Submit).
   * Prevents tracked images from being deleted when modal closes.
   */
  const commitUploadedImages = useCallback(() => {
    unsavedUrlsRef.current.clear();
  }, []);

  /**
   * Delete all unsaved tracked image URLs from server/Cloudinary.
   * Executed on Cancel or Modal Close.
   */
  const cleanupUnsavedImages = useCallback(() => {
    if (unsavedUrlsRef.current.size === 0) return;

    const urlsToDelete = Array.from(unsavedUrlsRef.current);
    unsavedUrlsRef.current.clear();

    // Fire-and-forget delete calls so modal closes instantly
    urlsToDelete.forEach((url) => {
      deleteImageApi(url).catch((err) => {
        console.warn('[useAutoDeleteUnsavedImage] Failed to delete unsaved image:', url, err);
      });
    });
  }, []);

  return {
    trackUploadedUrl,
    untrackUrl,
    commitUploadedImages,
    cleanupUnsavedImages,
  };
}
