'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  description: string;
  dimensions: string;
  care: string;
  inStock: boolean;
  isNew: boolean;
  collection: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface GiftCard {
  id: string;
  type: 'giftCard';
  amount: number;
  recipientName: string;
  message?: string;
  quantity: number;
}

type CartItemType = (Product & { quantity: number }) | GiftCard;

interface StoreState {
  cart: CartItemType[];
  wishlist: Product[];
  isCartOpen: boolean;
  isWishlistOpen: boolean;
}

type StoreAction =
  | { type: 'ADD_TO_CART'; payload: Product | GiftCard }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_TO_WISHLIST'; payload: Product }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'TOGGLE_CART' }
  | { type: 'TOGGLE_WISHLIST' }
  | { type: 'CLOSE_MODALS' }
  | { type: 'LOAD_STATE'; payload: Partial<StoreState> };

const initialState: StoreState = {
  cart: [],
  wishlist: [],
  isCartOpen: false,
  isWishlistOpen: false,
};

function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity: 1 }],
      };
    }
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload),
      };
      
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0),
      };
      
    case 'CLEAR_CART':
      return {
        ...state,
        cart: [],
      };
      
    case 'ADD_TO_WISHLIST': {
      const exists = state.wishlist.find(item => item.id === action.payload.id);
      if (exists) return state;
      return {
        ...state,
        wishlist: [...state.wishlist, action.payload],
      };
    }
    
    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.filter(item => item.id !== action.payload),
      };
      
    case 'TOGGLE_CART':
      return {
        ...state,
        isCartOpen: !state.isCartOpen,
        isWishlistOpen: false,
      };
      
    case 'TOGGLE_WISHLIST':
      return {
        ...state,
        isWishlistOpen: !state.isWishlistOpen,
        isCartOpen: false,
      };
      
    case 'CLOSE_MODALS':
      return {
        ...state,
        isCartOpen: false,
        isWishlistOpen: false,
      };
      
    case 'LOAD_STATE':
      return {
        ...state,
        ...action.payload,
      };
      
    default:
      return state;
  }
}

const StoreContext = createContext<{
  state: StoreState;
  dispatch: React.Dispatch<StoreAction>;
} | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('feiaCart');
    const savedWishlist = localStorage.getItem('feiaWishlist');
    
    if (savedCart || savedWishlist) {
      dispatch({
        type: 'LOAD_STATE',
        payload: {
          cart: savedCart ? JSON.parse(savedCart) : [],
          wishlist: savedWishlist ? JSON.parse(savedWishlist) : [],
        },
      });
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('feiaCart', JSON.stringify(state.cart));
    localStorage.setItem('feiaWishlist', JSON.stringify(state.wishlist));
  }, [state.cart, state.wishlist]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}