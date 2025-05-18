
import { MapPin, Phone, Mail, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-rotiPurple text-white">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Roti Tukkar</h3>
            <p className="mb-4 opacity-80">
              Authentic Pakistani cuisine in Buffalo, NY. Our recipes are made with love, using traditional spices and techniques to bring you the true taste of Pakistan.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-rotiOrange transition-colors">
                <Facebook />
              </a>
              <a href="#" className="hover:text-rotiOrange transition-colors">
                <Instagram />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="opacity-80 hover:opacity-100 hover:text-rotiOrange transition-colors">Home</a></li>
              <li><a href="/menu" className="opacity-80 hover:opacity-100 hover:text-rotiOrange transition-colors">Menu</a></li>
              <li><a href="/about" className="opacity-80 hover:opacity-100 hover:text-rotiOrange transition-colors">About Us</a></li>
              <li><a href="/orders" className="opacity-80 hover:opacity-100 hover:text-rotiOrange transition-colors">My Orders</a></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-rotiOrange" />
                <span className="opacity-80">123 Main Street, Buffalo, NY 14201</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-rotiOrange" />
                <span className="opacity-80">(716) 555-1234</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-rotiOrange" />
                <span className="opacity-80">info@rotitukkar.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8 text-center opacity-70">
          <p>&copy; {new Date().getFullYear()} Roti Tukkar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
