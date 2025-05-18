
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Sample testimonials data
const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    rating: 5,
    text: 'The biryani here is incredible! Authentic flavors that remind me of my visit to Lahore. The online ordering is so convenient!',
    image: 'https://randomuser.me/api/portraits/women/32.jpg'
  },
  {
    id: 2,
    name: 'Michael Chen',
    rating: 5,
    text: 'Best Pakistani food in Buffalo! The chicken karahi is my go-to dish. Quick pickup and always hot and fresh.',
    image: 'https://randomuser.me/api/portraits/men/36.jpg'
  },
  {
    id: 3,
    name: 'Aisha Malik',
    rating: 4,
    text: 'Finally found authentic Pakistani cuisine that reminds me of home. Love how easy it is to schedule a pickup time.',
    image: 'https://randomuser.me/api/portraits/women/44.jpg'
  }
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const nextTestimonial = () => {
    setActiveIndex((current) => (current + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length);
  };
  
  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <section className="py-12 md:py-20 bg-hero-gradient text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold mb-2">What Our Customers Say</h2>
          <p className="opacity-80">Read reviews from people who love our food</p>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out" 
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id} 
                  className="w-full flex-shrink-0 p-4"
                >
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 md:p-8 text-center">
                    <div className="flex justify-center mb-4">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full border-2 border-rotiOrange"
                      />
                    </div>
                    <div className="flex justify-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-5 h-5 ${i < testimonial.rating ? 'fill-rotiOrange text-rotiOrange' : 'text-gray-400'}`}
                        />
                      ))}
                    </div>
                    <p className="italic mb-4">"{testimonial.text}"</p>
                    <p className="font-semibold">{testimonial.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white text-rotiPurple border-rotiPurple md:flex hidden"
            onClick={prevTestimonial}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white text-rotiPurple border-rotiPurple md:flex hidden"
            onClick={nextTestimonial}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          
          {/* Dots */}
          <div className="flex justify-center mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 mx-1 rounded-full ${activeIndex === index ? 'bg-white' : 'bg-white/40'}`}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
