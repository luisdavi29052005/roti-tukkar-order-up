
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ShoppingCart, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);
  
  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in or continue as guest to proceed to checkout",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    navigate('/checkout');
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Your Cart</h1>
          
          {items.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="flex flex-col items-center justify-center text-gray-500">
                <ShoppingCart className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-lg mb-6">Your cart is empty</p>
                <Button asChild className="bg-rotiOrange hover:bg-rotiOrangeLight">
                  <Link to="/menu">Browse Menu</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md">
                  <ul className="divide-y">
                    {items.map((item) => (
                      <li key={item.id} className="p-4 flex items-center">
                        <div className="h-20 w-20 flex-shrink-0">
                          <img 
                            src={item.image_url || '/placeholder.svg'} 
                            alt={item.name} 
                            className="h-full w-full object-cover rounded-md"
                          />
                        </div>
                        <div className="ml-4 flex-grow">
                          <h4 className="font-medium">{item.name}</h4>
                          <div className="text-rotiOrange font-semibold mt-1">${item.price.toFixed(2)}</div>
                          <div className="flex items-center mt-2">
                            <button 
                              className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <span className="mx-3">{item.quantity}</span>
                            <button 
                              className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                            <button 
                              className="ml-auto text-gray-400 hover:text-red-500"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal ({totalItems} items)</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-rotiOrange">${totalPrice.toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Taxes calculated at checkout</p>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-rotiOrange hover:bg-rotiOrangeLight" 
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button asChild variant="outline" className="w-full mt-2">
                    <Link to="/menu">Continue Shopping</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;
