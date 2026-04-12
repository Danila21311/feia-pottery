'use client';

import { Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Product, useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { state, dispatch } = useStore();
  
  const isInWishlist = state.wishlist.some(item => item.id === product.id);
  const isInCart = state.cart.some(item => item.id === product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInWishlist) {
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: product.id });
    } else {
      dispatch({ type: 'ADD_TO_WISHLIST', payload: product });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  return (
    <div className="group cursor-pointer">
      {/* Product Image with 4:5 aspect ratio */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg pottery-shadow mb-4">
        <Link href={`/product/${product.id}`}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {product.isNew && (
            <Badge className="bg-pottery-sage text-white text-xs">
              Новинка
            </Badge>
          )}
          {!product.inStock && (
            <Badge variant="secondary" className="text-xs">
              Нет в наличии
            </Badge>
          )}
        </div>

        {/* Wishlist Button - Heart in Circle */}
        <button
          className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all flex items-center justify-center pottery-shadow ${
            isInWishlist ? 'text-red-500' : 'text-muted-foreground hover:text-pottery-sage'
          }`}
          onClick={handleWishlistToggle}
        >
          <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-serif text-foreground group-hover:text-pottery-sage transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>
        
        <div className="text-lg font-bold font-sans text-pottery-sage">
          {product.price.toLocaleString()}₽
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link href={`/product/${product.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Подробнее
            </Button>
          </Link>
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            size="sm"
            className="flex-1 sage-gradient"
          >
            Купить
          </Button>
        </div>
      </div>
    </div>
  );
}
