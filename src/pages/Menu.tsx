
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Search, ShoppingCart } from 'lucide-react';

// Sample menu data
const menuCategories = [
  { id: 'all', name: 'All' },
  { id: 'biryani', name: 'Biryani' },
  { id: 'curry', name: 'Curry' },
  { id: 'kebab', name: 'Kebabs' },
  { id: 'bread', name: 'Bread' },
  { id: 'dessert', name: 'Desserts' },
  { id: 'drinks', name: 'Drinks' }
];

const menuItems = [
  {
    id: 1,
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice cooked with tender chicken pieces and aromatic spices',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1631452180539-96aca7d48617?q=80&w=1974&auto=format&fit=crop',
    category: 'biryani'
  },
  {
    id: 2,
    name: 'Vegetable Biryani',
    description: 'Mixed vegetables cooked with basmati rice and traditional spices',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1974&auto=format&fit=crop',
    category: 'biryani'
  },
  {
    id: 3,
    name: 'Butter Chicken',
    description: 'Tender chicken in a rich buttery tomato sauce with cream',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=1984&auto=format&fit=crop',
    category: 'curry'
  },
  {
    id: 4,
    name: 'Seekh Kebab',
    description: 'Grilled minced meat skewers with aromatic spices',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1600688640154-9619e002df30?q=80&w=2030&auto=format&fit=crop',
    category: 'kebab'
  },
  {
    id: 5,
    name: 'Naan',
    description: 'Traditional oven-baked flatbread',
    price: 2.99,
    image: 'https://images.unsplash.com/photo-1595587870672-c79b47875c6a?q=80&w=2075&auto=format&fit=crop',
    category: 'bread'
  },
  {
    id: 6,
    name: 'Garlic Naan',
    description: 'Flatbread topped with garlic and butter',
    price: 3.99,
    image: 'https://plus.unsplash.com/premium_photo-1675451537771-0dd5b06b3985?q=80&w=1974&auto=format&fit=crop',
    category: 'bread'
  },
  {
    id: 7,
    name: 'Gulab Jamun',
    description: 'Sweet milk solid balls soaked in rose sugar syrup',
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1627823600577-1f91d3a4a118?q=80&w=1964&auto=format&fit=crop',
    category: 'dessert'
  },
  {
    id: 8,
    name: 'Mango Lassi',
    description: 'Sweet yogurt drink blended with mango and cardamom',
    price: 4.99,
    image: 'https://plus.unsplash.com/premium_photo-1664202526047-809793949aee?q=80&w=1974&auto=format&fit=crop',
    category: 'drinks'
  }
];

const Menu = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  const openCart = () => {
    setIsCartOpen(true);
  };
  
  const closeCart = () => {
    setIsCartOpen(false);
  };
  
  // Filter menu items based on search term and category
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50">
        {/* Menu Hero */}
        <div className="bg-hero-gradient text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-semibold mb-4">Our Menu</h1>
            <p className="opacity-90 max-w-xl mx-auto">
              Authentic Pakistani dishes made with traditional recipes and fresh ingredients
            </p>
          </div>
        </div>
        
        {/* Menu Filters */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  type="text" 
                  placeholder="Search our menu..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Tabs value={activeCategory} className="w-full md:w-auto">
                <TabsList className="overflow-x-auto w-full md:w-auto flex pb-1">
                  {menuCategories.map(category => (
                    <TabsTrigger 
                      key={category.id}
                      value={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className="whitespace-nowrap"
                    >
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {/* Menu Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenuItems.length > 0 ? (
              filteredMenuItems.map(item => (
                <div key={item.id} className="card-dish">
                  <div className="h-48 overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">${item.price.toFixed(2)}</span>
                      <Button size="sm" className="bg-rotiOrange hover:bg-rotiOrangeLight">
                        <PlusCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No items found. Try a different search term or category.</p>
              </div>
            )}
          </div>
        </div>
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

export default Menu;
