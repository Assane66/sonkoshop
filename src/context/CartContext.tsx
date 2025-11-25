
'use client';

import type { Product, CustomizationData } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';


export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  priceInCart: number; // Prix au moment de l'ajout, incluant la promotion
  customization?: CustomizationData | null;
  customizationCost: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number, size?: string, customization?: CustomizationData | null, customizationCost?: number) => void;
  removeFromCart: (productId: string, size?: string, customization?: CustomizationData | null) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, customization?: CustomizationData | null) => void;
  clearCart: () => void;
  getCartTotalItems: () => number;
  getCartSubtotal: () => number; // Renamed from getCartTotalPrice
  getShippingCost: (subtotal: number) => number;
  getCartGrandTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const calculateCurrentPrice = (product: Product): number => {
  const isPromo = typeof product.promotionPrice === 'number' && product.promotionPrice > 0;
  return isPromo ? product.promotionPrice! : product.price;
};

const SHIPPING_COST_THRESHOLD = 25000;
const DEFAULT_SHIPPING_COST = 1000;


export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('sonkoShopCart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      setCartItems([]);
    }
  }, []);

  useEffect(() => {
    const currentStoredCart = localStorage.getItem('sonkoShopCart');
    const newCartJson = JSON.stringify(cartItems);

    if (newCartJson !== currentStoredCart) {
      localStorage.setItem('sonkoShopCart', newCartJson);
    }
  }, [cartItems]);

  const addToCart = (product: Product, quantity: number, size?: string, customization?: CustomizationData | null, customizationCost: number = 0) => {
    const priceInCart = calculateCurrentPrice(product);

    setCartItems(prevItems => {
      // Customized items are always new line items to avoid merging issues.
      const isCustomized = !!customization;

      const existingItemIndex = prevItems.findIndex(
        item => item.id === product.id &&
          item.selectedSize === size &&
          // Only merge if both items are NOT customized.
          !isCustomized && !item.customization
      );

      let newQuantity = quantity;

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        newQuantity = updatedItems[existingItemIndex].quantity + quantity;

        if (newQuantity > product.stock) {
          newQuantity = product.stock;
          toast({
            variant: "destructive",
            title: "Quantité maximale atteinte",
            description: `Vous ne pouvez pas ajouter plus de ${product.stock} unités de ce produit (stock disponible).`,
          });
        }
        updatedItems[existingItemIndex].quantity = newQuantity;
        updatedItems[existingItemIndex].priceInCart = priceInCart;
        updatedItems[existingItemIndex].imageUrls = product.imageUrls; // Ensure images are up to date
        return updatedItems;
      } else {
        if (newQuantity > product.stock) {
          newQuantity = product.stock;
          toast({
            variant: "destructive",
            title: "Quantité limitée par le stock",
            description: `Seulement ${product.stock} unités disponibles. Ajout de ${newQuantity} au panier.`,
          });
        }
        return [...prevItems, { ...product, quantity: newQuantity, selectedSize: size, priceInCart, customization, customizationCost }];
      }
    });
  };

  const removeFromCart = (productId: string, size?: string, customization?: CustomizationData | null) => {
    setCartItems(prevItems =>
      prevItems.filter(item => {
        const isMatch = item.id === productId && item.selectedSize === size;
        if (!isMatch) return true;

        // If customization is a factor, compare them.
        const hasCustomization = !!customization;
        const itemHasCustomization = !!item.customization;
        if (hasCustomization !== itemHasCustomization) return true;

        if (hasCustomization && item.customization) {
          // This is a simple comparison, for complex objects you might need a deep equal function
          return JSON.stringify(item.customization) !== JSON.stringify(customization);
        }

        // If we reach here, it's a match, so we filter it out
        return false;
      })
    );
  };

  const updateQuantity = (productId: string, quantity: number, size?: string, customization?: CustomizationData | null) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        const isMatch = item.id === productId && item.selectedSize === size && JSON.stringify(item.customization) === JSON.stringify(customization);

        if (isMatch) {
          const productStock = item.stock;
          let newQuantity = quantity;

          if (newQuantity < 1) {
            newQuantity = 1;
          }
          if (newQuantity > productStock) {
            newQuantity = productStock;
            toast({
              variant: "destructive",
              title: "Stock insuffisant",
              description: `Seulement ${productStock} unités de ce produit sont disponibles.`,
            });
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const itemTotal = item.priceInCart * item.quantity;
      const customizationTotal = (item.customizationCost || 0) * item.quantity;
      return total + itemTotal + customizationTotal;
    }, 0);
  };

  const getShippingCost = (subtotal: number): number => {
    if (cartItems.length === 0) return 0; // Pas de frais si le panier est vide
    return subtotal < SHIPPING_COST_THRESHOLD ? DEFAULT_SHIPPING_COST : 0;
  };

  const getCartGrandTotal = () => {
    const subtotal = getCartSubtotal();
    const shipping = getShippingCost(subtotal);
    return subtotal + shipping;
  };


  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotalItems,
        getCartSubtotal,
        getShippingCost,
        getCartGrandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
