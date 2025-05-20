
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Search, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Static category data
const menuCategories = [
  { id: 'all', name: 'All' },
  { id: 'biryani', name: 'Biryani' },
  { id: 'curry', name: 'Curry' },
  { id: 'kebab', name: 'Kebabs' },
  { id: 'bread', name: 'Bread' },
  { id: 'dessert', name: 'Desserts' },
  { id: 'drinks', name: 'Drinks' }
];

const Menu = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  // Fetch menu items from database
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const { data, error } = await supabase
          .from('dishes')
          .select('*')
          .eq('active', true)
          .order('name');
          
        if (error) throw error;
        
        setMenuItems(data || []);
      } catch (error) {
        console.error('Error fetching menu items:', error);
        toast({
          title: "Error",
          description: "Could not load menu items. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenuItems();
    
    // Subscribe to dish updates
    const channel = supabase
      .channel('public:dishes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dishes' },
        (payload) => {
          console.log('Dish update received:', payload);
          fetchMenuItems();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);
  
  const openCart = () => {
    setIsCartOpen(true);
  };
  
  const closeCart = () => {
    setIsCartOpen(false);
  };

  const handleAddToCart = (item: any) => {
    addToCart(item);
    
    // Show added animation
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    
    // Reset after animation
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [item.id]: false }));
    }, 1500);
    
    // Show toast notification
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    });
  };
  
  // Filter menu items based on search term and category
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
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
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rotiPurple"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuItems.length > 0 ? (
                filteredMenuItems.map(item => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={item.image_url || '/placeholder.svg'} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform hover:scale-105" 
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description || 'No description available'}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">${item.price.toFixed(2)}</span>
                        <Button 
                          size="sm" 
                          className={`transition-all ${
                            addedItems[item.id] 
                              ? "bg-green-500 hover:bg-green-600" 
                              : "bg-rotiOrange hover:bg-rotiOrangeLight"
                          }`}
                          onClick={() => handleAddToCart(item)}
                        >
                          {addedItems[item.id] ? (
                            <>
                              <Check className="h-5 w-5 mr-1" /> Added
                            </>
                          ) : (
                            <>
                              <PlusCircle className="h-5 w-5 mr-1" /> Add to Cart
                            </>
                          )}
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
          )}
        </div>
      </main>
      <Footer />
      
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
