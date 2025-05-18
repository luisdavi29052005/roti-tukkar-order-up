
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format, addMinutes, isAfter, isBefore, parse } from 'date-fns';

// You can move these to environment variables
const STORE_OPEN_TIME = '11:00';
const STORE_CLOSE_TIME = '22:00';
const TIME_SLOT_MINUTES = 15;

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if cart is empty
  if (items.length === 0) {
    navigate('/menu');
    return null;
  }
  
  const getAvailableTimeSlots = () => {
    const now = new Date();
    const currentDate = new Date();
    
    // Parse opening and closing times
    const openTime = parse(STORE_OPEN_TIME, 'HH:mm', currentDate);
    const closeTime = parse(STORE_CLOSE_TIME, 'HH:mm', currentDate);
    
    let startTime = new Date(now);
    // Round to the next 15-minute slot
    startTime.setMinutes(Math.ceil(startTime.getMinutes() / TIME_SLOT_MINUTES) * TIME_SLOT_MINUTES);
    startTime.setSeconds(0);
    startTime.setMilliseconds(0);
    
    // If current time is before opening, start from opening time
    if (isBefore(startTime, openTime)) {
      startTime = openTime;
    }
    
    // If current time is after closing, start from opening time tomorrow
    if (isAfter(startTime, closeTime)) {
      startTime = new Date(openTime);
      startTime.setDate(startTime.getDate() + 1);
    }
    
    // Generate time slots until closing time
    const timeSlots = [];
    let currentSlot = new Date(startTime);
    
    while (isBefore(currentSlot, closeTime)) {
      timeSlots.push({
        value: format(currentSlot, 'HH:mm'),
        label: format(currentSlot, 'h:mm a')
      });
      currentSlot = addMinutes(currentSlot, TIME_SLOT_MINUTES);
    }
    
    return timeSlots;
  };
  
  const timeSlots = getAvailableTimeSlots();
  
  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTime) {
      toast({
        title: "Please select a pickup time",
        variant: "destructive"
      });
      return;
    }
    
    if (!name || !phone) {
      toast({
        title: "Please enter your name and phone number",
        variant: "destructive"
      });
      return;
    }
    
    setStep(2);
  };
  
  const handlePlaceOrder = async () => {
    try {
      setIsSubmitting(true);
      
      // Generate a random QR code (in production, use a real QR code generator)
      const qrCode = `order-${Math.random().toString(36).substring(2, 10)}`;
      
      // Create pickup time as a Date object
      const [hours, minutes] = selectedTime.split(':');
      const pickupTime = new Date();
      pickupTime.setHours(parseInt(hours, 10));
      pickupTime.setMinutes(parseInt(minutes, 10));
      pickupTime.setSeconds(0);
      pickupTime.setMilliseconds(0);
      
      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user?.id || null,
            total: totalPrice,
            status: 'pending',
            pickup_time: pickupTime.toISOString(),
            notes,
            qr_code: qrCode
          }
        ])
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        dish_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      toast({
        title: "Order placed successfully!",
        description: `Your order #${order.id.substring(0, 8)} has been placed.`,
      });
      
      // Clear the cart
      clearCart();
      
      // Redirect to orders page
      navigate('/orders');
      
    } catch (error: any) {
      toast({
        title: "Error placing order",
        description: error.message,
        variant: "destructive"
      });
      console.error('Error placing order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-semibold mb-6 text-center">Checkout</h1>
            
            {/* Step Indicators */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1 ? 'bg-rotiOrange text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  1
                </div>
                <div className={`h-1 w-16 ${
                  step >= 2 ? 'bg-rotiOrange' : 'bg-gray-300'
                }`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2 ? 'bg-rotiOrange text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </div>
              </div>
            </div>
            
            {step === 1 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Order Details</h2>
                
                <form onSubmit={handleSubmitDetails} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Select Pickup Time</Label>
                    <RadioGroup 
                      value={selectedTime} 
                      onValueChange={setSelectedTime}
                      className="grid grid-cols-3 gap-2 pt-2"
                    >
                      {timeSlots.map((slot) => (
                        <div key={slot.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={slot.value} id={`time-${slot.value}`} />
                          <Label htmlFor={`time-${slot.value}`}>{slot.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Special Instructions (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special requests or allergies?"
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-rotiOrange hover:bg-rotiOrangeLight">
                    Continue to Review
                  </Button>
                </form>
              </div>
            )}
            
            {step === 2 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="font-medium text-gray-700 mb-2">Customer Information</h3>
                    <p className="text-sm">Name: {name}</p>
                    <p className="text-sm">Phone: {phone}</p>
                    <p className="text-sm">Pickup Time: {format(parse(selectedTime, 'HH:mm', new Date()), 'h:mm a')}</p>
                    {notes && <p className="text-sm">Notes: {notes}</p>}
                  </div>
                  
                  <div className="border-b pb-4">
                    <h3 className="font-medium text-gray-700 mb-2">Order Items</h3>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <span>
                            {item.quantity} x {item.name}
                          </span>
                          <span className="font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pb-4">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total Amount</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Payment will be collected at the restaurant during pickup.
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Button 
                      onClick={handlePlaceOrder} 
                      className="bg-rotiOrange hover:bg-rotiOrangeLight"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Processing...' : 'Place Order'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setStep(1)}
                      disabled={isSubmitting}
                    >
                      Back to Details
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
