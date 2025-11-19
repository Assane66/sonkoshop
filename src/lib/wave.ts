
'use server';

import { db } from '@/lib/firebase';
import { Order, OrderStatus, type CustomerInfo, type OrderItem } from '@/types';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';

const WAVE_API_URL = 'https://api.wave.com/v1/checkout/sessions';
const WAVE_API_KEY = process.env.WAVE_API_KEY;

interface CreateWaveCheckoutArgs {
    amount: number;
    customerInfo: CustomerInfo;
    orderItems: OrderItem[];
    subtotal: number;
    shippingCost: number;
    shippingAddress: string;
}

export async function createWaveCheckoutSession(args: CreateWaveCheckoutArgs) {
    if (!WAVE_API_KEY) {
        throw new Error("La clé API de Wave n'est pas configurée sur le serveur.");
    }
    
    // 1. Create a temporary order in Firestore with status 'WavePending'
    // This allows us to have a record before redirecting the user
    const tempOrderPayload = {
        customerInfo: args.customerInfo,
        items: args.orderItems, // Already mapped in checkout page
        totalAmount: args.amount,
        subtotal: args.subtotal,
        shippingCost: args.shippingCost,
        shippingAddress: args.shippingAddress,
        status: OrderStatus.WavePending,
        paymentMethod: 'wave',
        orderDate: serverTimestamp(),
        waveSessionId: '', // Will be filled later if needed
    };

    const tempOrderRef = await addDoc(collection(db, 'orders'), tempOrderPayload);
    const orderId = tempOrderRef.id;

    // 2. Prepare the request to Wave API
    const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={checkout_session_id}`;
    const errorUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`;

    const body = JSON.stringify({
        amount: String(args.amount),
        currency: 'XOF',
        success_url: successUrl,
        error_url: errorUrl,
        // Passing orderId in metadata can be useful for reconciliation
        client_reference: orderId,
    });
    
    try {
        const response = await fetch(WAVE_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WAVE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: body,
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Wave API Error:', data);
            // If Wave API fails, we should probably cancel the temp order, but for now, we just throw
            throw new Error(data.message || 'La requête à l\'API Wave a échoué.');
        }
        
        // 3. Update our temporary order with the Wave session ID
        await updateDoc(doc(db, 'orders', orderId), {
            waveSessionId: data.id,
        });
        
        return {
            checkout_url: data.checkout_url,
            wave_session_id: data.id
        };

    } catch (error) {
        console.error("Error in createWaveCheckoutSession:", error);
        // Here too, we might want to handle the created temp order
        throw error;
    }
}


export async function verifyWavePayment(waveSessionId: string): Promise<{ success: boolean; order?: Order; error?: string }> {
  if (!WAVE_API_KEY) {
    return { success: false, error: "La clé API de Wave n'est pas configurée sur le serveur." };
  }

  try {
    const response = await fetch(`${WAVE_API_URL}/${waveSessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${WAVE_API_KEY}`,
      },
    });

    const sessionData = await response.json();

    if (!response.ok) {
      console.error('Wave API Verification Error:', sessionData);
      return { success: false, error: sessionData.message || 'La vérification auprès de Wave a échoué.' };
    }

    // `client_reference` should be our orderId
    const orderId = sessionData.client_reference;
    if (!orderId) {
        return { success: false, error: "Référence de commande manquante dans la réponse de Wave." };
    }
    
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
        return { success: false, error: `Commande ${orderId} non trouvée dans notre système.` };
    }

    const orderData = orderSnap.data() as Omit<Order, 'id'>;

    // Check if the payment was successful according to Wave
    if (sessionData.payment_status === 'succeeded') {
        // If payment is successful, update our order status
        if (orderData.status === OrderStatus.WavePending) {
            await updateDoc(orderRef, {
                status: OrderStatus.Processing, // Or 'Pending' if you want another manual confirmation step
                wavePaymentStatus: 'succeeded',
                lastWaveCheck: serverTimestamp()
            });
        }
        // Return the full order data for the success page
        const finalOrder: Order = {
            ...orderData,
            id: orderId,
            status: OrderStatus.Processing, // Show the new status on the success page
            orderDate: (orderData.orderDate as any).toDate().toISOString() // Convert timestamp for JSON serialization
        };
        return { success: true, order: finalOrder };
    } else {
        // Payment was not successful, update our order status to reflect this
        await updateDoc(orderRef, {
            status: OrderStatus.Cancelled,
            wavePaymentStatus: sessionData.payment_status, // e.g., 'failed', 'pending'
            lastWaveCheck: serverTimestamp()
        });
        return { success: false, error: `Le paiement a échoué. Statut Wave : ${sessionData.payment_status}` };
    }
  } catch (error: any) {
    console.error("Error in verifyWavePayment:", error);
    return { success: false, error: error.message || "Une erreur inattendue est survenue lors de la vérification du paiement." };
  }
}
