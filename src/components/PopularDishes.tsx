
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

// Sample dishes data
const popularDishes = [
  {
    id: 1,
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice cooked with tender chicken pieces and spices',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1631452180539-96aca7d48617?q=80&w=1974&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'Butter Chicken',
    description: 'Tender chicken in a rich buttery tomato sauce',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=1984&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'Seekh Kebab',
    description: 'Grilled minced meat skewers with aromatic spices',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1600688640154-9619e002df30?q=80&w=2030&auto=format&fit=crop'
  },
  {
    id: 4,
    name: 'Chicken Karahi',
    description: 'Spicy chicken cooked in a traditional wok with tomatoes',
    price: 16.99,
    image: 'https://plus.unsplash.com/premium_photo-1673809798970-30c14cfd0ab6?q=80&w=1974&auto=format&fit=crop'
  }
];

const PopularDishes = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  
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
                  className="card-dish min-w-[280px] flex-shrink-0 snap-center"
                >
                  <div className="h-48 overflow-hidden">
                    <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{dish.name}</h3>
                    <p className="text-gray-600 text-sm mb-2 truncate">{dish.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">${dish.price.toFixed(2)}</span>
                      <Button size="sm" className="bg-rotiOrange hover:bg-rotiOrangeLight">
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
            <div key={dish.id} className="card-dish">
              <div className="h-48 overflow-hidden">
                <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg">{dish.name}</h3>
                <p className="text-gray-600 text-sm mb-2 truncate">{dish.description}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">${dish.price.toFixed(2)}</span>
                  <Button size="sm" className="bg-rotiOrange hover:bg-rotiOrangeLight">
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Button asChild className="btn-primary px-8">
            <a href="/menu">View Full Menu</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PopularDishes;
