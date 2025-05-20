
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { PlusCircle, Pencil, X, BarChart, ClipboardList, UtensilsCrossed } from 'lucide-react';

const StaffPage = () => {
  const navigate = useNavigate();
  const { user, isStaff, loading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newDish, setNewDish] = useState({
    name: '',
    description: '',
    price: '',
    category: 'biryani',
    image_url: ''
  });
  const [editingDish, setEditingDish] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    monthlySales: {} as Record<string, number> // Type annotation to ensure TypeScript knows this is a record of string to number
  });
  
  const categories = [
    { id: 'biryani', name: 'Biryani' },
    { id: 'curry', name: 'Curry' },
    { id: 'kebab', name: 'Kebabs' },
    { id: 'bread', name: 'Bread' },
    { id: 'dessert', name: 'Desserts' },
    { id: 'drinks', name: 'Drinks' }
  ];
  
  // Check if user is authorized to access this page
  useEffect(() => {
    if (!loading && (!user || !isStaff)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [user, isStaff, loading, navigate, toast]);
  
  // Subscribe to order updates and fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items:order_items(
              *,
              dish:dishes(*)
            ),
            user:users(name, email)
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setOrders(data || []);
        
        // Calculate metrics
        if (data) {
          const completed = data.filter(order => order.status === 'completed').length;
          const cancelled = data.filter(order => order.status === 'cancelled').length;
          
          // Calculate total sales
          const totalSales = data
            .filter(order => order.status === 'completed')
            .reduce((sum, order) => sum + order.total, 0);
            
          // Process monthly sales
          const monthlySales = {};
          data
            .filter(order => order.status === 'completed')
            .forEach(order => {
              const date = new Date(order.created_at);
              const monthYear = format(date, 'MMM yyyy');
              
              if (!monthlySales[monthYear]) {
                monthlySales[monthYear] = 0;
              }
              
              monthlySales[monthYear] += order.total;
            });
            
          setMetrics({
            totalSales,
            completedOrders: completed,
            cancelledOrders: cancelled,
            monthlySales
          });
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Error",
          description: "Could not load orders. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchDishes = async () => {
      try {
        const { data, error } = await supabase
          .from('dishes')
          .select('*')
          .order('name');
          
        if (error) throw error;
        setDishes(data || []);
      } catch (error) {
        console.error('Error fetching dishes:', error);
        toast({
          title: "Error",
          description: "Could not load dishes. Please try again.",
          variant: "destructive"
        });
      }
    };
    
    fetchOrders();
    fetchDishes();
    
    // Subscribe to order updates
    const orderChannel = supabase
      .channel('custom-orders-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Order update received:', payload);
          fetchOrders();
        }
      )
      .subscribe();
      
    // Subscribe to dish updates
    const dishChannel = supabase
      .channel('custom-dishes-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dishes' },
        (payload) => {
          console.log('Dish update received:', payload);
          fetchDishes();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(dishChannel);
    };
  }, [toast]);
  
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast({
        title: "Status Updated",
        description: `Order status has been updated to ${newStatus}.`
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Could not update order status. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (editingDish) {
      setEditingDish({
        ...editingDish,
        [name]: name === 'price' ? parseFloat(value) || '' : value
      });
    } else {
      setNewDish({
        ...newDish,
        [name]: name === 'price' ? parseFloat(value) || '' : value
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      if (editingDish) {
        // Update existing dish
        const { error } = await supabase
          .from('dishes')
          .update({
            name: editingDish.name,
            description: editingDish.description,
            price: parseFloat(editingDish.price),
            category: editingDish.category,
            image_url: editingDish.image_url
          })
          .eq('id', editingDish.id);
          
        if (error) throw error;
        
        toast({
          title: "Dish Updated",
          description: `The dish "${editingDish.name}" has been updated.`
        });
        
        setEditingDish(null);
      } else {
        // Create new dish
        const { error } = await supabase
          .from('dishes')
          .insert({
            name: newDish.name,
            description: newDish.description, 
            price: parseFloat(newDish.price),
            category: newDish.category,
            image_url: newDish.image_url,
            active: true
          });
          
        if (error) throw error;
        
        toast({
          title: "Dish Added",
          description: `The dish "${newDish.name}" has been added to the menu.`
        });
        
        setNewDish({
          name: '',
          description: '',
          price: '',
          category: 'biryani',
          image_url: ''
        });
      }
      
      setIsFormVisible(false);
    } catch (error) {
      console.error('Error saving dish:', error);
      toast({
        title: "Error",
        description: "Could not save dish. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditDish = (dish) => {
    setEditingDish(dish);
    setIsFormVisible(true);
  };
  
  const handleToggleDishActive = async (dish) => {
    try {
      const { error } = await supabase
        .from('dishes')
        .update({ active: !dish.active })
        .eq('id', dish.id);
        
      if (error) throw error;
      
      toast({
        title: dish.active ? "Dish Deactivated" : "Dish Activated",
        description: `The dish "${dish.name}" has been ${dish.active ? 'removed from' : 'added to'} the menu.`
      });
    } catch (error) {
      console.error('Error toggling dish active status:', error);
      toast({
        title: "Error",
        description: "Could not update dish status. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const resetForm = () => {
    setEditingDish(null);
    setNewDish({
      name: '',
      description: '',
      price: '',
      category: 'biryani',
      image_url: ''
    });
    setIsFormVisible(false);
  };
  
  if (loading || (!user && loading)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rotiPurple"></div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-semibold mb-6">Staff Dashboard</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-white border rounded-lg p-1">
              <TabsTrigger value="orders" className="data-[state=active]:bg-rotiPurple data-[state=active]:text-white">
                <ClipboardList className="w-4 h-4 mr-2" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="menu" className="data-[state=active]:bg-rotiPurple data-[state=active]:text-white">
                <UtensilsCrossed className="w-4 h-4 mr-2" />
                Menu Management
              </TabsTrigger>
              <TabsTrigger value="metrics" className="data-[state=active]:bg-rotiPurple data-[state=active]:text-white">
                <BarChart className="w-4 h-4 mr-2" />
                Metrics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="orders" className="mt-6">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b">
                  <h2 className="text-xl font-medium">Active Orders</h2>
                </div>
                
                {isLoading ? (
                  <div className="p-8 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rotiPurple"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No orders found.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {orders.filter(order => ['pending', 'preparing', 'ready'].includes(order.status)).map((order) => (
                      <div key={order.id} className="p-4 hover:bg-gray-50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-semibold">Order #{order.id.substring(0, 8)}</h3>
                              <span className={`ml-3 text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Customer: {order.user?.name || 'Guest'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Pickup: {format(new Date(order.pickup_time), 'MMM d, h:mm a')}
                            </p>
                          </div>
                          
                          <div className="mt-2 md:mt-0 space-x-2 flex">
                            {order.status === 'pending' && (
                              <Button 
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, 'preparing')}
                                className="bg-blue-500 hover:bg-blue-600"
                              >
                                Start Preparing
                              </Button>
                            )}
                            {order.status === 'preparing' && (
                              <Button 
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, 'ready')}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                Mark as Ready
                              </Button>
                            )}
                            {order.status === 'ready' && (
                              <Button 
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, 'completed')}
                                className="bg-gray-500 hover:bg-gray-600"
                              >
                                Mark as Delivered
                              </Button>
                            )}
                            {['pending', 'preparing'].includes(order.status) && (
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                className="text-red-500 border-red-500 hover:bg-red-50"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="border p-3 rounded-md bg-gray-50">
                          <h4 className="text-sm font-medium mb-2">Order Items:</h4>
                          <div className="space-y-1">
                            {order.order_items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.quantity}x {item.dish.name}</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                              <span>Total</span>
                              <span>${order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="p-4 border-t border-b">
                  <h2 className="text-xl font-medium">Order History</h2>
                </div>
                
                {isLoading ? (
                  <div className="p-8 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rotiPurple"></div>
                  </div>
                ) : orders.filter(order => ['completed', 'cancelled'].includes(order.status)).length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No order history found.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {orders.filter(order => ['completed', 'cancelled'].includes(order.status)).map((order) => (
                      <div key={order.id} className="p-4 hover:bg-gray-50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-semibold">Order #{order.id.substring(0, 8)}</h3>
                              <span className={`ml-3 text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Customer: {order.user?.name || 'Guest'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Date: {format(new Date(order.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                          
                          <div className="mt-2 md:mt-0">
                            <span className="font-medium text-lg">${order.total.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="border p-3 rounded-md bg-gray-50">
                          <h4 className="text-sm font-medium mb-2">Order Items:</h4>
                          <div className="space-y-1">
                            {order.order_items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.quantity}x {item.dish.name}</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="menu" className="mt-6">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-xl font-medium">Menu Management</h2>
                  <Button 
                    onClick={() => { resetForm(); setIsFormVisible(!isFormVisible) }}
                    className="bg-rotiOrange hover:bg-rotiOrangeLight"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add New Dish
                  </Button>
                </div>
                
                {isFormVisible && (
                  <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-medium mb-4">{editingDish ? 'Edit Dish' : 'Add New Dish'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Dish Name*
                          </label>
                          <Input
                            id="name"
                            name="name"
                            value={editingDish ? editingDish.name : newDish.name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                            Price*
                          </label>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={editingDish ? editingDish.price : newDish.price}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                            Category*
                          </label>
                          <select
                            id="category"
                            name="category"
                            value={editingDish ? editingDish.category : newDish.category}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rotiPurple"
                            required
                          >
                            {categories.map(category => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                            Image URL
                          </label>
                          <Input
                            id="image_url"
                            name="image_url"
                            value={editingDish ? editingDish.image_url : newDish.image_url}
                            onChange={handleInputChange}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <Textarea
                          id="description"
                          name="description"
                          value={editingDish ? editingDish.description : newDish.description}
                          onChange={handleInputChange}
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetForm}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-rotiPurple hover:bg-rotiPurple/90"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Saving...' : editingDish ? 'Update Dish' : 'Add Dish'}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
                
                {isLoading && dishes.length === 0 ? (
                  <div className="p-8 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rotiPurple"></div>
                  </div>
                ) : dishes.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No dishes found. Add your first dish to the menu.</p>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dishes.map(dish => (
                        <div 
                          key={dish.id} 
                          className={`border rounded-lg overflow-hidden ${dish.active ? '' : 'opacity-60'}`}
                        >
                          {dish.image_url ? (
                            <div className="h-40 overflow-hidden">
                              <img 
                                src={dish.image_url} 
                                alt={dish.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-40 bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500">No image</span>
                            </div>
                          )}
                          
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium">{dish.name}</h3>
                              <span className="text-rotiOrange font-semibold">${dish.price.toFixed(2)}</span>
                            </div>
                            
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {dish.description || 'No description'}
                            </p>
                            
                            <div className="flex items-center justify-between mt-4">
                              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                                {categories.find(c => c.id === dish.category)?.name || dish.category}
                              </span>
                              
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleEditDish(dish)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                
                                <Button 
                                  size="sm"
                                  variant={dish.active ? "outline" : "default"}
                                  className={`h-8 w-8 p-0 ${
                                    dish.active 
                                      ? "text-red-500 border-red-500 hover:bg-red-50" 
                                      : "bg-green-500 hover:bg-green-600"
                                  }`}
                                  onClick={() => handleToggleDishActive(dish)}
                                >
                                  {dish.active ? <X className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="metrics" className="mt-6">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b">
                  <h2 className="text-xl font-medium">Performance Metrics</h2>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-100">
                      <h3 className="text-gray-500 text-sm mb-1">Total Sales</h3>
                      <p className="text-3xl font-bold text-rotiPurple">
                        ${metrics.totalSales.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-lg border border-green-100">
                      <h3 className="text-gray-500 text-sm mb-1">Completed Orders</h3>
                      <p className="text-3xl font-bold text-green-600">
                        {metrics.completedOrders}
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-lg border border-red-100">
                      <h3 className="text-gray-500 text-sm mb-1">Cancelled Orders</h3>
                      <p className="text-3xl font-bold text-red-500">
                        {metrics.cancelledOrders}
                      </p>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-lg mb-4">Monthly Sales</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Month
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sales
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(metrics.monthlySales).length > 0 ? (
                          Object.entries(metrics.monthlySales).map(([month, sales]) => (
                            <tr key={month} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {month}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-semibold">
                                ${(sales as number).toFixed(2)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">
                              No sales data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StaffPage;
