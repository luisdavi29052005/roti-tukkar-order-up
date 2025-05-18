
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, ShoppingCart } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/4c42dd62-f876-444d-b287-52c91d7b5dfd.png" 
              alt="Roti Tukkar Logo" 
              className="h-12 w-auto" 
            />
            <span className="ml-2 text-xl font-semibold hidden md:block">Roti Tukkar</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-800 hover:text-rotiOrange transition-colors">Home</Link>
          <Link to="/menu" className="text-gray-800 hover:text-rotiOrange transition-colors">Menu</Link>
          <Link to="/orders" className="text-gray-800 hover:text-rotiOrange transition-colors">Orders</Link>
        </nav>
        
        {/* Authentication & Cart */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline" size="sm" className="border-rotiPurple text-rotiPurple hover:bg-rotiPurple hover:text-white">
            Login
          </Button>
          <Button size="sm" className="bg-rotiPurple text-white hover:bg-rotiPurple/90">
            Register
          </Button>
          <Link to="/cart" className="relative p-2">
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute top-0 right-0 bg-rotiOrange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              0
            </span>
          </Link>
        </div>
        
        {/* Mobile Toggle */}
        <div className="flex items-center md:hidden">
          <Link to="/cart" className="relative p-2 mr-2">
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute top-0 right-0 bg-rotiOrange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              0
            </span>
          </Link>
          <button onClick={toggleMenu} className="p-2">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-3 flex flex-col">
            <Link to="/" className="py-3 text-gray-800 hover:text-rotiOrange transition-colors" onClick={toggleMenu}>Home</Link>
            <Link to="/menu" className="py-3 text-gray-800 hover:text-rotiOrange transition-colors" onClick={toggleMenu}>Menu</Link>
            <Link to="/orders" className="py-3 text-gray-800 hover:text-rotiOrange transition-colors" onClick={toggleMenu}>Orders</Link>
            <div className="flex space-x-4 py-3">
              <Button variant="outline" size="sm" className="border-rotiPurple text-rotiPurple hover:bg-rotiPurple hover:text-white">
                Login
              </Button>
              <Button size="sm" className="bg-rotiPurple text-white hover:bg-rotiPurple/90">
                Register
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
