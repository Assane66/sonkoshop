
'use client';

import type { Product } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';


export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string; 
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number, size?: string) => void;
  removeFromCart: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  getCartTotalItems: () => number;
  getCartTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast(); // Initialize toast

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('sonkoShopCart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
        setCartItems([]); // Fallback to empty cart on error
    }
  }, []);

  useEffect(() => {
    // Only write to localStorage if cartItems has been initialized and potentially changed
    // This avoids overwriting on initial load if localStorage is empty or becomes empty
    const currentStoredCart = localStorage.getItem('sonkoShopCart');
    const newCartJson = JSON.stringify(cartItems);

    if (newCartJson !== currentStoredCart) { // Only update if there's a change
        localStorage.setItem('sonkoShopCart', newCartJson);
    }
  }, [cartItems]);

  const addToCart = (product: Product, quantity: number, size?: string) => {
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
        return [...prevItems, { ...product, quantity: newQuantity, selectedSize: size }];
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

          if (newQuantity < 1) { // Should ideally be handled by removing the item
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
      }).filter(item => item.quantity > 0) // Remove item if quantity becomes 0 or less
    );
  };

  const clearCart = () => {
    setCartItems([]);
    // localStorage.removeItem('sonkoShopCart'); // This will be handled by the useEffect
  };

  const getCartTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
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
        getCartTotalPrice,
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
