
'use client';

import type { Product } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';


export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  priceInCart: number; // Prix au moment de l'ajout, incluant la promotion
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number, size?: string) => void;
  removeFromCart: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  getCartTotalItems: () => number;
  getCartSubtotal: () => number; // Renamed from getCartTotalPrice
  getShippingCost: (subtotal: number) => number;
  getCartGrandTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const calculateDiscountedPrice = (product: Product): number => {
  let finalPrice = product.price;
  if (product.promotionPercentage && product.promotionPercentage > 0) {
    let promotionIsValid = true;
    if (product.promotionEndDate) {
      const endDate = product.promotionEndDate instanceof Timestamp ? product.promotionEndDate.toDate().getTime() : new Date(product.promotionEndDate as any).getTime();
      if (new Date().getTime() >= endDate) {
        promotionIsValid = false;
      }
    }
    if (promotionIsValid) {
      finalPrice = product.price * (1 - product.promotionPercentage / 100);
    }
  }
  return finalPrice;
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

  const addToCart = (product: Product, quantity: number, size?: string) => {
    const priceInCart = calculateDiscountedPrice(product);

    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.id === product.id && item.selectedSize === size
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
        return [...prevItems, { ...product, quantity: newQuantity, selectedSize: size, priceInCart }];
      }
    });
  };

  const removeFromCart = (productId: string, size?: string) => {
    setCartItems(prevItems =>
      prevItems.filter(item => !(item.id === productId && item.selectedSize === size))
    );
  };

  const updateQuantity = (productId: string, quantity: number, size?: string) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === productId && item.selectedSize === size) {
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
    return cartItems.reduce((total, item) => total + item.priceInCart * item.quantity, 0);
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
