
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

    // Use existing originalPrice if available, otherwise use current price as base
    const originalPrice = product.originalPrice || product.price;
    const newPrice = originalPrice - discountAmount;
    const finalPromoPrice = newPrice > 0 ? newPrice : 1;

    batch.update(productRef, {
      originalPrice: originalPrice,
      promotionPrice: finalPromoPrice,
    });
  });

  await batch.commit();
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
      originalPrice: admin.firestore.FieldValue.delete(),
      promotionPrice: admin.firestore.FieldValue.delete(),
    });
  });

  await batch.commit();
}

exports.handlePromotionChange = onDocumentWritten(
  "promotions/{promotionId}",
  async (event) => {
    // On document creation or update
    if (event.data?.after.exists) {
      const promotionData = event.data.after.data();
      const category = promotionData.category;
      const discountAmount = promotionData.discountAmount;

      // Handle category change if applicable
      if (
        event.data.before.exists &&
        event.data.before.data().category !== category
      ) {
        await removePromotionFromCategory(event.data.before.data().category);
      }

      await applyPromotionToCategory(category, discountAmount);
    } else if (event.data?.before.exists && !event.data?.after.exists) {
      // On document deletion
      const promotionData = event.data.before.data();
      const category = promotionData.category;
      await removePromotionFromCategory(category);
    }
  }
);
