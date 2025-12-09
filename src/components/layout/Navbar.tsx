import { User, FolderOpen, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, isAuthenticated, hasUnreadPostcards } = useAuth();

  if (!isAuthenticated) return null;

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const navItems = [
    { icon: User, label: 'Profile', path: '/profile', showBadge: false },
    { icon: FolderOpen, label: 'My Collection', path: '/collection', showBadge: hasUnreadPostcards },
  ];

  return (
    <TooltipProvider>
      <nav className="fixed top-0 right-0 z-50 p-6">
        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-4 py-2 soft-shadow">
          {navItems.map(({ icon: Icon, label, path, showBadge }) => (
            <Tooltip key={path}>
              <TooltipTrigger asChild>
                <Button
                  variant={location.pathname === path ? 'default' : 'ghost'}
                  size="icon"
                  className={`rounded-full transition-all duration-200 relative ${
                    location.pathname === path
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-primary/10'
                  }`}
                  onClick={() => navigate(path)}
                >
                  <Icon className="h-5 w-5" />
                  {showBadge && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-body">{label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          <div className="w-px h-6 bg-border mx-1" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-body">Sign Out</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </nav>
    </TooltipProvider>
  );
}
