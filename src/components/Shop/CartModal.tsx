import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useStore, Product } from '@/context/StoreContext';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function CartModal() {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [state.isCartOpen]);

  if (!state.isCartOpen) return null;

  const totalAmount = state.cart.reduce((sum, item) => {
    if ('type' in item && item.type === 'giftCard') {
      return sum + item.amount * item.quantity;
    }
    return sum + (item as Product & { quantity: number }).price * item.quantity;
  }, 0);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: id });
    } else {
      dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { id, quantity: newQuantity } });
    }
  };

  const handleCheckout = () => {
    dispatch({ type: 'CLOSE_MODALS' });
    navigate('/checkout');
  };

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
              <ShoppingBag className="w-5 h-5" />
              Корзина
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

          {state.cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Корзина пуста</p>
              <Button 
                onClick={() => dispatch({ type: 'CLOSE_MODALS' })}
                variant="outline"
              >
                Продолжить покупки
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {state.cart.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-accent/50 rounded-lg">
                    {('type' in item && item.type === 'giftCard') ? (
                      <div className="w-16 h-16 bg-gradient-to-br from-pottery-sage to-pottery-sageLight rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">GIFT</span>
                      </div>
                    ) : (
                      <img
                        src={(item as Product & { quantity: number }).images[0]}
                        alt={(item as Product & { quantity: number }).name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm mb-1 truncate">
                        {('type' in item && item.type === 'giftCard') ? `Сертификат на ${item.amount}₽` : (item as Product & { quantity: number }).name}
                      </h3>
                      {('type' in item && item.type === 'giftCard') && (
                        <p className="text-xs text-muted-foreground mb-1">
                          Для: {item.recipientName}
                        </p>
                      )}
                      <p className="text-sm font-semibold text-primary">
                        {('type' in item && item.type === 'giftCard') ? item.amount : (item as Product & { quantity: number }).price}₽
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-7 h-7 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-7 h-7 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item.id })}
                          className="ml-auto text-xs text-muted-foreground hover:text-destructive"
                        >
                          Удалить
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Итого:</span>
                  <span className="text-primary">{totalAmount.toLocaleString()}₽</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button onClick={handleCheckout} className="w-full sage-gradient">
                  Оформить заказ
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => dispatch({ type: 'CLEAR_CART' })}
                    className="flex-1"
                  >
                    Очистить
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => dispatch({ type: 'CLOSE_MODALS' })}
                    className="flex-1"
                  >
                    Продолжить
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}