
import { Utensils, Clock, Pizza } from 'lucide-react';

const steps = [
  {
    icon: <Utensils className="h-10 w-10 text-rotiOrange" />,
    title: 'Choose Your Meal',
    description: 'Browse our menu and select your favorite Pakistani dishes'
  },
  {
    icon: <Clock className="h-10 w-10 text-rotiOrange" />,
    title: 'Schedule Pickup',
    description: 'Select a convenient 15-minute pickup window'
  },
  {
    icon: <Pizza className="h-10 w-10 text-rotiOrange" />,
    title: 'Pickup & Enjoy',
    description: 'Show your QR code at our counter and enjoy!'
  }
];

const HowItWorks = () => {
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-2">How It Works</h2>
          <p className="text-gray-600">Three simple steps to enjoy our authentic Pakistani cuisine</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6 rounded-lg bg-white shadow-sm border border-gray-100">
              <div className="mb-4 p-3 bg-gray-50 rounded-full">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
