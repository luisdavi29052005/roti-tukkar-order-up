
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="bg-hero-gradient text-white">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="font-poppins font-semibold text-3xl md:text-5xl leading-tight mb-4">
              Authentic Homemade Pakistani Food
            </h1>
            <p className="mb-6 text-lg opacity-90 max-w-md">
              Experience authentic flavors and traditional recipes made with love. Order now for pickup at our Buffalo, NY location.
            </p>
            <Button asChild className="btn-primary text-lg px-8 py-3">
              <Link to="/menu">Order Now</Link>
            </Button>
          </div>
          
          <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center md:justify-end">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1631452180539-96aca7d48617?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Chicken Biryani" 
                className="w-[320px] h-[320px] md:w-[420px] md:h-[420px] object-cover rounded-full shadow-2xl"
              />
              <div className="absolute inset-0 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.15)]"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
