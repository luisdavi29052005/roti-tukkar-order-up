
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, ShoppingCart, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type CartProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Sample cart items
const initialCartItems = [
  {
    id: 1,
    name: 'Chicken Biryani',
    price: 14.99,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1631452180539-96aca7d48617?q=80&w=1974&auto=format&fit=crop'
  }
];

const Cart = ({ isOpen, onClose }: CartProps) => {
  const [cartItems, setCartItems] = useState(initialCartItems);
  
  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };
  
  const removeItem = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };
  
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return (
    <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-xl transform transition-transform duration-300 z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-rotiPurple text-white p-4 flex justify-between items-center">
          <div className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            <h3 className="font-semibold text-lg">Your Cart</h3>
          </div>
          <button onClick={onClose} className="p-2">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Cart Items */}
        <div className="flex-grow overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingCart className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg">Your cart is empty</p>
              <Button variant="link" className="text-rotiOrange mt-2" onClick={onClose}>
                Browse Menu
              </Button>
            </div>
          ) : (
            <ul className="divide-y">
              {cartItems.map((item) => (
                <li key={item.id} className="py-4 flex">
                  <div className="h-20 w-20 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover rounded-md" />
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
                        onClick={() => removeItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Cart Summary */}
        {cartItems.length > 0 && (
          <div className="border-t p-4">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Subtotal</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">Taxes calculated at checkout</p>
            <Button asChild className="w-full bg-rotiOrange hover:bg-rotiOrangeLight">
              <Link to="/checkout" className="flex items-center justify-center" onClick={onClose}>
                Checkout
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full mt-2" onClick={onClose}>
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
