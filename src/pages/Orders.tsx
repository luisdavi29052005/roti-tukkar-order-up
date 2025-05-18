
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import QRCode from 'react-qr-code';

const Orders = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQR, setShowQR] = useState(null);
  
  // Fetch orders when user changes
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        
        if (!user && !loading) {
          setOrders([]);
          setIsLoading(false);
          return;
        }
        
        if (user) {
          const { data, error } = await supabase
            .from('orders')
            .select(`
              *,
              order_items:order_items(
                *,
                dish:dishes(*)
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          setOrders(data || []);
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
    
    fetchOrders();
    
    // Subscribe to order updates for this user
    if (user) {
      const channel = supabase
        .channel('custom-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
          (payload) => {
            console.log('Order update received:', payload);
            fetchOrders();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, loading, toast]);
  
  // Filter orders for each tab
  const upcomingOrders = orders.filter(order => 
    ['pending', 'preparing', 'ready'].includes(order.status)
  );
  
  const pastOrders = orders.filter(order => 
    ['completed', 'cancelled'].includes(order.status)
  );
  
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, h:mm a');
  };
  
  const orderStatusLabels = {
    'pending': { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    'preparing': { label: 'Preparing', color: 'bg-blue-100 text-blue-800' },
    'ready': { label: 'Ready for Pickup', color: 'bg-green-100 text-green-800' },
    'completed': { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
    'cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50">
        {/* Orders Hero */}
        <div className="bg-hero-gradient text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-semibold mb-4">My Orders</h1>
            <p className="opacity-90 max-w-xl mx-auto">
              Track your current orders and view your order history
            </p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          {/* Login Message for Guest Users */}
          {!loading && !user && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8 text-center">
              <p className="mb-4">Please log in to view your full order history.</p>
              <div className="flex justify-center space-x-4">
                <Button 
                  className="bg-rotiPurple hover:bg-rotiPurple/90"
                  onClick={() => navigate('/auth')}
                >
                  Log In
                </Button>
                <Button 
                  variant="outline" 
                  className="border-rotiPurple text-rotiPurple hover:bg-rotiPurple hover:text-white"
                  onClick={() => navigate('/auth?tab=register')}
                >
                  Register
                </Button>
              </div>
            </div>
          )}
          
          {/* Order Tabs */}
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="upcoming">Upcoming Orders</TabsTrigger>
              <TabsTrigger value="past">Past Orders</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              {isLoading ? (
                <div className="bg-white rounded-lg shadow-sm p-6 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rotiPurple"></div>
                </div>
              ) : upcomingOrders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <p className="text-gray-500">You have no upcoming orders.</p>
                  <Button asChild className="mt-4 bg-rotiOrange hover:bg-rotiOrangeLight">
                    <a href="/menu">Order Now</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {upcomingOrders.map((order) => (
                    <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      {/* Order Header */}
                      <div className="bg-gray-50 p-4 border-b flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-semibold text-lg">Order #{order.id.substring(0, 8)}</h3>
                            <span className={`ml-4 text-xs px-2 py-1 rounded-full ${orderStatusLabels[order.status]?.color || 'bg-gray-100'}`}>
                              {orderStatusLabels[order.status]?.label || 'Processing'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{formatDate(order.pickup_time)}</p>
                        </div>
                        <div className="mt-2 md:mt-0">
                          {showQR === order.id ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mr-2 border-rotiPurple text-rotiPurple"
                              onClick={() => setShowQR(null)}
                            >
                              Hide QR Code
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mr-2 border-rotiPurple text-rotiPurple"
                              onClick={() => setShowQR(order.id)}
                            >
                              {order.status === 'ready' ? 'Show QR Code' : 'View Details'}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* QR Code Display */}
                      {showQR === order.id && (
                        <div className="p-4 bg-gray-50 flex justify-center">
                          <div className="text-center">
                            <div className="p-4 bg-white rounded-lg shadow-sm inline-block">
                              <QRCode value={order.qr_code || 'no-qr-code'} size={200} />
                            </div>
                            <p className="mt-3 text-gray-600">
                              Show this QR code at the restaurant to pick up your order
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Order Items */}
                      <div className="p-4">
                        <div className="space-y-2 mb-4">
                          {order.order_items.map((item) => (
                            <div key={item.id} className="flex justify-between">
                              <span>{item.quantity}x {item.dish.name}</span>
                              <span className="text-gray-600">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="border-t pt-3 flex justify-between font-semibold">
                          <span>Total</span>
                          <span>${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="past">
              {isLoading ? (
                <div className="bg-white rounded-lg shadow-sm p-6 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rotiPurple"></div>
                </div>
              ) : pastOrders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <p className="text-gray-500">You have no past orders.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pastOrders.map((order) => (
                    <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      {/* Order Header */}
                      <div className="bg-gray-50 p-4 border-b flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-semibold text-lg">Order #{order.id.substring(0, 8)}</h3>
                            <span className={`ml-4 text-xs px-2 py-1 rounded-full ${orderStatusLabels[order.status]?.color || 'bg-gray-100'}`}>
                              {orderStatusLabels[order.status]?.label || 'Processing'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="mt-2 md:mt-0">
                          <Button 
                            size="sm" 
                            className="ml-2 bg-rotiOrange hover:bg-rotiOrangeLight"
                            onClick={() => navigate('/menu')}
                          >
                            Reorder
                          </Button>
                        </div>
                      </div>
                      
                      {/* Order Items */}
                      <div className="p-4">
                        <div className="space-y-2 mb-4">
                          {order.order_items.map((item) => (
                            <div key={item.id} className="flex justify-between">
                              <span>{item.quantity}x {item.dish.name}</span>
                              <span className="text-gray-600">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="border-t pt-3 flex justify-between font-semibold">
                          <span>Total</span>
                          <span>${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
