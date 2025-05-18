
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample order data
const sampleOrders = [
  {
    id: 'ORD-1234',
    date: new Date(2025, 4, 17, 18, 30), // May 17, 2025, 6:30 PM
    status: 'ready',
    total: 29.98,
    items: [
      { name: 'Chicken Biryani', quantity: 1, price: 14.99 },
      { name: 'Garlic Naan', quantity: 2, price: 3.99 },
      { name: 'Mango Lassi', quantity: 1, price: 4.99 }
    ]
  },
  {
    id: 'ORD-1233',
    date: new Date(2025, 4, 15, 12, 45), // May 15, 2025, 12:45 PM
    status: 'completed',
    total: 18.98,
    items: [
      { name: 'Vegetable Biryani', quantity: 1, price: 12.99 },
      { name: 'Naan', quantity: 2, price: 2.99 }
    ]
  }
];

const orderStatusLabels: Record<string, { label: string, color: string }> = {
  'pending': { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  'preparing': { label: 'Preparing', color: 'bg-blue-100 text-blue-800' },
  'ready': { label: 'Ready for Pickup', color: 'bg-green-100 text-green-800' },
  'completed': { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
  'cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
};

const Orders = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // Filter orders for each tab
  const upcomingOrders = sampleOrders.filter(order => 
    ['pending', 'preparing', 'ready'].includes(order.status)
  );
  
  const pastOrders = sampleOrders.filter(order => 
    ['completed', 'cancelled'].includes(order.status)
  );
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
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
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8 text-center">
            <p className="mb-4">Please log in to view your full order history.</p>
            <div className="flex justify-center space-x-4">
              <Button className="bg-rotiPurple hover:bg-rotiPurple/90">Log In</Button>
              <Button variant="outline" className="border-rotiPurple text-rotiPurple hover:bg-rotiPurple hover:text-white">Register</Button>
            </div>
          </div>
          
          {/* Order Tabs */}
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="upcoming">Upcoming Orders</TabsTrigger>
              <TabsTrigger value="past">Past Orders</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              {upcomingOrders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <p className="text-gray-500">You have no upcoming orders.</p>
                  <Button asChild className="mt-4 bg-rotiOrange hover:bg-rotiOrangeLight">
                    <a href="/menu">Order Now</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {upcomingOrders.map(order => (
                    <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      {/* Order Header */}
                      <div className="bg-gray-50 p-4 border-b flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                            <span className={`ml-4 text-xs px-2 py-1 rounded-full ${orderStatusLabels[order.status]?.color || 'bg-gray-100'}`}>
                              {orderStatusLabels[order.status]?.label || 'Processing'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{formatDate(order.date)}</p>
                        </div>
                        <div className="mt-2 md:mt-0">
                          <Button variant="outline" size="sm" className="mr-2 border-rotiPurple text-rotiPurple">
                            View Details
                          </Button>
                          <Button size="sm" className="bg-rotiOrange hover:bg-rotiOrangeLight">
                            {order.status === 'ready' ? 'View QR Code' : 'Track Order'}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Order Items */}
                      <div className="p-4">
                        <div className="space-y-2 mb-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>{item.quantity}x {item.name}</span>
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
              {pastOrders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <p className="text-gray-500">You have no past orders.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pastOrders.map(order => (
                    <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      {/* Order Header */}
                      <div className="bg-gray-50 p-4 border-b flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                            <span className={`ml-4 text-xs px-2 py-1 rounded-full ${orderStatusLabels[order.status]?.color || 'bg-gray-100'}`}>
                              {orderStatusLabels[order.status]?.label || 'Processing'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{formatDate(order.date)}</p>
                        </div>
                        <div className="mt-2 md:mt-0">
                          <Button variant="outline" size="sm" className="border-rotiPurple text-rotiPurple">
                            View Details
                          </Button>
                          <Button size="sm" className="ml-2 bg-rotiOrange hover:bg-rotiOrangeLight">
                            Reorder
                          </Button>
                        </div>
                      </div>
                      
                      {/* Order Items */}
                      <div className="p-4">
                        <div className="space-y-2 mb-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>{item.quantity}x {item.name}</span>
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
