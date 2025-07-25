
import {onDocumentWritten} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

/**
 * Applies a fixed discount amount to all products in a specific category.
 * @param {string} categoryName - The name of the category.
 * @param {number} discountAmount - The fixed discount amount.
 */
async function applyPromotionToCategory(
  categoryName: string,
  discountAmount: number
): Promise<void> {
  const productsRef = db.collection("products");
  const q = productsRef.where("category", "==", categoryName);

  const querySnapshot = await q.get();
  if (querySnapshot.empty) {
    console.log(`No products found in category "${categoryName}".`);
    return;
  }

  const batch = db.batch();
  querySnapshot.forEach((doc) => {
    const product = doc.data();
    const productRef = db.collection("products").doc(doc.id);

    // Use existing originalPrice if it's already there (from a previous promotion),
    // otherwise use the current base price as the original price.
    const originalPrice = product.originalPrice || product.price;
    const newPrice = originalPrice - discountAmount;
    
    // Ensure the price doesn't drop to 0 or below.
    const finalPromoPrice = newPrice > 0 ? newPrice : 1;

    batch.update(productRef, {
      originalPrice: originalPrice,
      promotionPrice: finalPromoPrice,
    });
  });

  await batch.commit();
  console.log(`Applied promotion to ${querySnapshot.size} products in category "${categoryName}".`);
}

/**
 * Removes a promotion from all products in a specific category.
 * @param {string} categoryName - The name of the category.
 */
async function removePromotionFromCategory(categoryName: string): Promise<void> {
  const productsRef = db.collection("products");
  const q = productsRef.where("category", "==", categoryName);

  const querySnapshot = await q.get();
  if (querySnapshot.empty) {
    console.log(
      `No products found in category "${categoryName}" to remove promotion.`
    );
    return;
  }

  const batch = db.batch();
  querySnapshot.forEach((doc) => {
    const productRef = db.collection("products").doc(doc.id);
    batch.update(productRef, {
      // Use FieldValue.delete() to completely remove the fields
      originalPrice: admin.firestore.FieldValue.delete(),
      promotionPrice: admin.firestore.FieldValue.delete(),
    });
  });

  await batch.commit();
  console.log(`Removed promotion from ${querySnapshot.size} products in category "${categoryName}".`);
}

exports.handlePromotionChange = onDocumentWritten(
  "promotions/{promotionId}",
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    // On document creation
    if (!event.data?.before.exists && event.data?.after.exists) {
      console.log("Promotion created, applying to category:", afterData.category);
      await applyPromotionToCategory(afterData.category, afterData.discountAmount);
      return;
    }

    // On document deletion
    if (event.data?.before.exists && !event.data?.after.exists) {
        console.log("Promotion deleted, removing from category:", beforeData.category);
        await removePromotionFromCategory(beforeData.category);
        return;
    }

    // On document update
    if (event.data?.before.exists && event.data?.after.exists) {
        const hasCategoryChanged = beforeData.category !== afterData.category;
        const hasDiscountChanged = beforeData.discountAmount !== afterData.discountAmount;

        if (hasCategoryChanged) {
            console.log(`Promotion category changed from "${beforeData.category}" to "${afterData.category}".`);
            // Remove promotion from the old category
            await removePromotionFromCategory(beforeData.category);
            // Apply promotion to the new category
            await applyPromotionToCategory(afterData.category, afterData.discountAmount);
        } else if (hasDiscountChanged) {
            console.log(`Promotion discount changed for category "${afterData.category}".`);
            // Just re-apply the promotion with the new discount amount
            await applyPromotionToCategory(afterData.category, afterData.discountAmount);
        } else {
             console.log("Promotion updated, but category and discount are the same. No product changes needed.");
        }
    }
  }
);
