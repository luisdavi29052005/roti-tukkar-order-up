
import { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import PopularDishes from '@/components/PopularDishes';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

const Index = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const openCart = () => {
    setIsCartOpen(true);
  };
  
  const closeCart = () => {
    setIsCartOpen(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <PopularDishes />
        <HowItWorks />
        <Testimonials />
      </main>
      <Footer />
      <Cart isOpen={isCartOpen} onClose={closeCart} />
      
      {/* Floating Cart Button (Mobile) */}
      <div className="md:hidden fixed bottom-6 right-6">
        <Button 
          onClick={openCart} 
          size="icon" 
          className="h-14 w-14 rounded-full bg-rotiOrange hover:bg-rotiOrangeLight shadow-lg"
        >
          <ShoppingCart className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 bg-rotiPurple text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            1
          </span>
        </Button>
      </div>
    </div>
  );
};

export default Index;
