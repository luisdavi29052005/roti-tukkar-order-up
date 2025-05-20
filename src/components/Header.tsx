
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, ShoppingCart, User, ClipboardList } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import Cart from '@/components/Cart';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  // Function to check if a path is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 transition-all">
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
          <Link 
            to="/" 
            className={`transition-colors ${isActive('/') ? 'text-rotiOrange font-medium' : 'text-gray-800 hover:text-rotiOrange'}`}
          >
            Home
          </Link>
          <Link 
            to="/menu" 
            className={`transition-colors ${isActive('/menu') ? 'text-rotiOrange font-medium' : 'text-gray-800 hover:text-rotiOrange'}`}
          >
            Menu
          </Link>
          {user && (
            <Link 
              to="/orders" 
              className={`transition-colors ${isActive('/orders') ? 'text-rotiOrange font-medium' : 'text-gray-800 hover:text-rotiOrange'}`}
            >
              Orders
            </Link>
          )}
          {user?.is_staff && (
            <Link 
              to="/staff" 
              className={`transition-colors ${isActive('/staff') ? 'text-rotiOrange font-medium' : 'text-gray-800 hover:text-rotiOrange'} flex items-center`}
            >
              <ClipboardList className="h-4 w-4 mr-1" />
              Staff Panel
            </Link>
          )}
        </nav>
        
        {/* Authentication & Cart */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2 text-rotiPurple" />
                <span className="text-sm font-medium text-gray-700">
                  {user.name || 'User'}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="border-rotiPurple text-rotiPurple hover:bg-rotiPurple hover:text-white transition-colors"
              >
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="border-rotiPurple text-rotiPurple hover:bg-rotiPurple hover:text-white transition-colors"
              >
                <Link to="/auth">Login</Link>
              </Button>
              <Button 
                size="sm" 
                asChild
                className="bg-rotiPurple text-white hover:bg-rotiPurple/90 transition-colors"
              >
                <Link to="/auth?tab=register">Register</Link>
              </Button>
            </>
          )}
          <button onClick={toggleCart} className="relative p-2 group">
            <ShoppingCart className="h-6 w-6 group-hover:text-rotiOrange transition-colors" />
            <span className="absolute top-0 right-0 bg-rotiOrange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {totalItems}
            </span>
          </button>
        </div>
        
        {/* Mobile Toggle */}
        <div className="flex items-center md:hidden">
          <button onClick={toggleCart} className="relative p-2 mr-2 group">
            <ShoppingCart className="h-6 w-6 group-hover:text-rotiOrange transition-colors" />
            <span className="absolute top-0 right-0 bg-rotiOrange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {totalItems}
            </span>
          </button>
          <button onClick={toggleMenu} className="p-2">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="container mx-auto px-4 py-3 flex flex-col">
            <Link 
              to="/" 
              className={`py-3 transition-colors ${isActive('/') ? 'text-rotiOrange font-medium' : 'text-gray-800'}`} 
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link 
              to="/menu" 
              className={`py-3 transition-colors ${isActive('/menu') ? 'text-rotiOrange font-medium' : 'text-gray-800'}`}
              onClick={toggleMenu}
            >
              Menu
            </Link>
            {user && (
              <Link 
                to="/orders" 
                className={`py-3 transition-colors ${isActive('/orders') ? 'text-rotiOrange font-medium' : 'text-gray-800'}`}
                onClick={toggleMenu}
              >
                Orders
              </Link>
            )}
            {user?.is_staff && (
              <Link 
                to="/staff" 
                className={`py-3 transition-colors ${isActive('/staff') ? 'text-rotiOrange font-medium' : 'text-gray-800'} flex items-center`}
                onClick={toggleMenu}
              >
                <ClipboardList className="h-4 w-4 mr-1" />
                Staff Panel
              </Link>
            )}
            <div className="flex items-center space-x-4 py-3">
              {user ? (
                <>
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-rotiPurple" />
                    <span className="text-sm font-medium text-gray-700">
                      {user.name || 'User'}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSignOut}
                    className="border-rotiPurple text-rotiPurple hover:bg-rotiPurple hover:text-white transition-colors"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild
                    className="border-rotiPurple text-rotiPurple hover:bg-rotiPurple hover:text-white transition-colors"
                    onClick={toggleMenu}
                  >
                    <Link to="/auth">Login</Link>
                  </Button>
                  <Button 
                    size="sm" 
                    asChild
                    className="bg-rotiPurple text-white hover:bg-rotiPurple/90 transition-colors"
                    onClick={toggleMenu}
                  >
                    <Link to="/auth?tab=register">Register</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Header;
