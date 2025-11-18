import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function PublicLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/public" className="flex items-center gap-2 font-semibold text-xl">
            <Heart className="h-6 w-6 text-primary" />
            <span>TaimakoFund</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/public" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link to="/public/discover" className="text-sm font-medium transition-colors hover:text-primary">
              Discover
            </Link>
            <Link to="/public/about" className="text-sm font-medium transition-colors hover:text-primary">
              About
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <Button onClick={() => navigate('/user/dashboard')}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/auth')} className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
                <Button onClick={() => navigate('/auth')}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t py-8 bg-muted/50">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 TaimakoFund. Empowering Nigerian communities.
          </p>
          <div className="flex gap-4">
            <Link to="/public/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="/public/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
