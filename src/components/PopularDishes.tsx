
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from '@/hooks/useCart';

const PopularDishes = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [popularDishes, setPopularDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { addToCart } = useCart();
  
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const { data, error } = await supabase
          .from('dishes')
          .select('*')
          .limit(4);
        
        if (error) {
          throw error;
        }
        
        setPopularDishes(data);
      } catch (error) {
        console.error('Error fetching dishes:', error);
        toast({
          title: "Error loading dishes",
          description: "Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDishes();
  }, [toast]);
  
  const scrollLeft = () => {
    if (scrollPosition > 0) {
      setScrollPosition(scrollPosition - 1);
    }
  };
  
  const scrollRight = () => {
    if (scrollPosition < popularDishes.length - 1) {
      setScrollPosition(scrollPosition + 1);
    }
  };

  const handleAddToCart = (dish) => {
    addToCart(dish);
    toast({
      title: "Added to cart",
      description: `${dish.name} has been added to your cart.`,
    });
  };

  if (loading) {
    return (
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-semibold mb-2">Popular Dishes</h2>
            <p className="text-gray-600">Loading our customer favorites...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card-dish bg-white shadow-md rounded-lg animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold mb-2">Popular Dishes</h2>
          <p className="text-gray-600">Our customers' favorites, made with love</p>
        </div>
        
        {/* Mobile Scrollable Dish Cards */}
        <div className="md:hidden relative">
          <div className="overflow-x-auto pb-6 scrollbar-none flex snap-x snap-mandatory">
            <div className="flex space-x-4">
              {popularDishes.map((dish) => (
                <div 
                  key={dish.id}
                  className="card-dish bg-white shadow-md rounded-lg overflow-hidden min-w-[280px] flex-shrink-0 snap-center hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 overflow-hidden">
                    <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{dish.name}</h3>
                    <p className="text-gray-600 text-sm mb-2 truncate">{dish.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">${dish.price.toFixed(2)}</span>
                      <Button 
                        size="sm" 
                        onClick={() => handleAddToCart(dish)}
                        className="bg-rotiOrange hover:bg-rotiOrangeLight transition-colors"
                      >
                        <PlusCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Desktop Grid View */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularDishes.map((dish) => (
            <div key={dish.id} className="card-dish bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 overflow-hidden">
                <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg">{dish.name}</h3>
                <p className="text-gray-600 text-sm mb-2 truncate">{dish.description}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">${dish.price.toFixed(2)}</span>
                  <Button 
                    size="sm" 
                    onClick={() => handleAddToCart(dish)}
                    className="bg-rotiOrange hover:bg-rotiOrangeLight transition-colors"
                  >
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Button asChild className="btn-primary px-8 bg-rotiOrange hover:bg-rotiOrangeLight transition-colors shadow-md">
            <a href="/menu">View Full Menu</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PopularDishes;
