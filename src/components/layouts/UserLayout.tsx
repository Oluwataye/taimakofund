import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  LayoutDashboard, 
  Plus, 
  TrendingUp, 
  Search, 
  Bell,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { NavLink } from '@/components/NavLink';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NotificationBell } from '@/components/NotificationBell';

export function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isAdmin, isModerator } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-xl cursor-pointer" onClick={() => navigate('/user/dashboard')}>
            <Heart className="h-6 w-6 text-primary" />
            <span>TaimakoFund</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/user/dashboard"
              className="px-3 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md"
              activeClassName="bg-accent text-accent-foreground"
            >
              <LayoutDashboard className="w-4 h-4 inline mr-2" />
              Dashboard
            </NavLink>
            <NavLink
              to="/user/create-campaign"
              className="px-3 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md"
              activeClassName="bg-accent text-accent-foreground"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create Campaign
            </NavLink>
            <NavLink
              to="/user/analytics"
              className="px-3 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md"
              activeClassName="bg-accent text-accent-foreground"
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Analytics
            </NavLink>
            <NavLink
              to="/public/discover"
              className="px-3 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md"
              activeClassName="bg-accent text-accent-foreground"
            >
              <Search className="w-4 h-4 inline mr-2" />
              Discover
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <NotificationBell />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/user/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                {(isAdmin || isModerator) && (
                  <>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    {isModerator && (
                      <DropdownMenuItem onClick={() => navigate('/moderator')}>
                        Moderator Dashboard
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
