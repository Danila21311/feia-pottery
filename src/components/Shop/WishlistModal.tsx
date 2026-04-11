import { X, Heart, ShoppingCart } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export function WishlistModal() {
  const { state, dispatch } = useStore();

  useEffect(() => {
    if (state.isWishlistOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [state.isWishlistOpen]);

  if (!state.isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => dispatch({ type: 'CLOSE_MODALS' })}
      />
      
      {/* Modal */}
      <div className="relative ml-auto w-full max-w-md bg-background h-full overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif font-semibold flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Избранное
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: 'CLOSE_MODALS' })}
              className="p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {state.wishlist.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">В избранном пока ничего нет</p>
              <Button 
                onClick={() => dispatch({ type: 'CLOSE_MODALS' })}
                variant="outline"
              >
                Посмотреть каталог
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {state.wishlist.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-accent/50 rounded-lg">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm mb-1 truncate">{item.name}</h3>
                    <p className="text-sm font-semibold text-primary mb-2">{item.price}₽</p>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          dispatch({ type: 'ADD_TO_CART', payload: item });
                          dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: item.id });
                        }}
                        className="flex-1 text-xs sage-gradient"
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        В корзину
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: item.id })}
                        className="px-3"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}