import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Product, useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/Shop/ProductCard';
import productsData from '@/data/products.json';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const products = productsData as Product[];
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🏺</div>
        <h1 className="text-2xl font-serif font-bold mb-4">Товар не найден</h1>
        <p className="text-muted-foreground mb-8">Возможно, товар был удален или перемещен.</p>
        <Link to="/catalog">
          <Button>Вернуться в каталог</Button>
        </Link>
      </div>
    );
  }

  const isInWishlist = state.wishlist.some(item => item.id === product.id);
  const isInCart = state.cart.some(item => item.id === product.id);
  
  // Related products from same category
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: product.id });
    } else {
      dispatch({ type: 'ADD_TO_WISHLIST', payload: product });
    }
  };

  const handleAddToCart = () => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      // Fallback - copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm mb-8 text-muted-foreground">
        <Link to="/" className="hover:text-primary transition-colors">Главная</Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-primary transition-colors">Каталог</Link>
        <span>/</span>
        <Link 
          to={`/catalog?category=${encodeURIComponent(product.category)}`} 
          className="hover:text-primary transition-colors"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-6 -ml-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Назад
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg bg-secondary">
            <img
              src={product.images[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square overflow-hidden rounded border-2 transition-colors ${
                    currentImageIndex === index 
                      ? 'border-primary' 
                      : 'border-transparent hover:border-primary/50'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-serif font-bold">{product.name}</h1>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-pottery-sage font-medium">{product.category}</p>
          </div>

          {/* Badges */}
          <div className="flex gap-2">
            {product.isNew && (
              <Badge className="bg-pottery-sage text-white">Новинка</Badge>
            )}
            {!product.inStock && (
              <Badge variant="secondary">Нет в наличии</Badge>
            )}
            {product.collection && (
              <Badge variant="outline">Коллекция: {product.collection}</Badge>
            )}
          </div>

          {/* Price */}
          <div className="text-3xl font-bold text-primary">
            {product.price.toLocaleString()}₽
          </div>

          {/* Description */}
          <div>
            <h3 className="font-serif font-semibold mb-2">Описание</h3>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          {/* Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-secondary/50 rounded-lg">
            <div>
              <h4 className="font-medium mb-1">Размеры</h4>
              <p className="text-sm text-muted-foreground">{product.dimensions}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Уход</h4>
              <p className="text-sm text-muted-foreground">{product.care}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="flex-1 sage-gradient"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {isInCart ? 'Добавить еще' : 'Добавить в корзину'}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={handleWishlistToggle}
              className={isInWishlist ? 'text-red-500 border-red-500' : ''}
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t pt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-serif font-bold mb-2">Похожие товары</h2>
            <p className="text-muted-foreground">Другие изделия из категории "{product.category}"</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}