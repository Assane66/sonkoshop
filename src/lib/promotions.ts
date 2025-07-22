
'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, writeBatch, doc, updateDoc, deleteField } from 'firebase/firestore';

/**
 * Applies a fixed discount amount to all products in a specific category.
 * @param categoryName The name of the category to apply the promotion to.
 * @param discountAmount The fixed amount to discount from the price.
 */
export async function applyPromotionToCategory(categoryName: string, discountAmount: number): Promise<void> {
  if (!categoryName || discountAmount <= 0) {
    throw new Error("Category name and a positive discount amount are required.");
  }

  const productsRef = collection(db, 'products');
  const q = query(productsRef, where("category", "==", categoryName));

  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.log(`No products found in category "${categoryName}" to apply promotion.`);
      return;
    }

    const batch = writeBatch(db);
    querySnapshot.forEach((documentSnapshot) => {
      const product = documentSnapshot.data();
      const productRef = doc(db, 'products', documentSnapshot.id);
      
      const originalPrice = product.originalPrice || product.price;
      const newPrice = originalPrice - discountAmount;
      
      // Ensure the promotional price is not zero or negative
      const finalPromoPrice = newPrice > 0 ? newPrice : 1; 

      batch.update(productRef, {
        originalPrice: originalPrice,
        promotionPrice: finalPromoPrice
      });
    });

    await batch.commit();
    console.log(`Promotion of ${discountAmount} FCFA applied to ${querySnapshot.size} products in category "${categoryName}".`);
  } catch (error) {
    console.error("Error applying promotion to category:", error);
    throw new Error("Failed to apply promotion to products.");
  }
}

/**
 * Removes a promotion from all products in a specific category.
 * @param categoryName The name of the category to remove the promotion from.
 */
export async function removePromotionFromCategory(categoryName: string): Promise<void> {
  if (!categoryName) {
    throw new Error("Category name is required.");
  }
  
  const productsRef = collection(db, 'products');
  const q = query(productsRef, where("category", "==", categoryName), where("promotionPrice", ">=", 0));

  try {
    const querySnapshot = await getDocs(q);
     if (querySnapshot.empty) {
      console.log(`No products found with active promotion in category "${categoryName}".`);
      return;
    }

    const batch = writeBatch(db);
    querySnapshot.forEach((documentSnapshot) => {
      const productRef = doc(db, 'products', documentSnapshot.id);
      
      // Use deleteField to completely remove the promotion fields
      batch.update(productRef, {
        originalPrice: deleteField(),
        promotionPrice: deleteField()
      });
    });

    await batch.commit();
    console.log(`Promotion removed from ${querySnapshot.size} products in category "${categoryName}".`);
  } catch (error) {
    console.error("Error removing promotion from category:", error);
    throw new Error("Failed to remove promotion from products.");
  }
}
