import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';

interface Course {
  id: string;
  title: string;
  instructor: string;
  field: string;
  price: number;
  originalPrice?: number;
  image: string;
  duration: string;
  level: string;
  rating: number;
  studentsCount: number;
  description: string;
}

interface CartItem extends Course {
  addedAt: Date;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (course: Course) => void;
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  isInCart: (courseId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { t } = useLanguage();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cognerax_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        })));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cognerax_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (course: Course) => {
    const existingItem = cartItems.find(item => item.id === course.id);
    
    if (existingItem) {
      toast.info(t('cart.alreadyInCart', 'Course is already in your cart'));
      return;
    }

    const cartItem: CartItem = {
      ...course,
      addedAt: new Date()
    };

    setCartItems(prev => [...prev, cartItem]);
    toast.success(t('cart.addedToCart', 'Course added to cart'));
  };

  const removeFromCart = (courseId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== courseId));
    toast.success(t('cart.removedFromCart', 'Course removed from cart'));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cognerax_cart');
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  const getTotalItems = () => {
    return cartItems.length;
  };

  const isInCart = (courseId: string) => {
    return cartItems.some(item => item.id === courseId);
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
    isInCart
  };

  return (
    <CartContext.Provider value={value}>
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