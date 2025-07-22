
'use server';

// This file is no longer needed for client-side logic.
// The promotion application logic has been moved to a Cloud Function
// located in /functions/src/index.ts.
// Keeping this file to avoid breaking imports, but its functions are deprecated.

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, writeBatch, doc, updateDoc, deleteField } from 'firebase/firestore';

/**
 * @deprecated This function is now handled by the `handlePromotionChange` Cloud Function.
 */
export async function applyPromotionToCategory(categoryName: string, discountAmount: number): Promise<void> {
  console.warn("applyPromotionToCategory is deprecated and should not be called from the client. This logic is now in a Cloud Function.");
  return Promise.resolve();
}

/**
 * @deprecated This function is now handled by the `handlePromotionChange` Cloud Function.
 */
export async function removePromotionFromCategory(categoryName: string): Promise<void> {
    console.warn("removePromotionFromCategory is deprecated and should not be called from the client. This logic is now in a Cloud Function.");
    return Promise.resolve();
}
