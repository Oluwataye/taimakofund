import { 
  LayoutDashboard, 
  Flag, 
  MessageSquare, 
  CheckCircle,
  LogOut 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const menuItems = [
  { title: 'Dashboard', url: '/moderator', icon: LayoutDashboard },
  { title: 'Reports', url: '/moderator/reports', icon: Flag },
  { title: 'Comments', url: '/moderator/comments', icon: MessageSquare },
  { title: 'Campaign Reviews', url: '/moderator/campaigns', icon: CheckCircle },
];

export function ModeratorSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b px-6 py-4">
        <h2 className={`font-semibold ${state === 'collapsed' ? 'text-center' : ''}`}>
          {state === 'collapsed' ? 'M' : 'Moderator'}
        </h2>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-4">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <NavLink
                to={item.url}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                activeClassName="bg-accent text-accent-foreground"
              >
                <item.icon className="w-5 h-5" />
                {state !== 'collapsed' && <span>{item.title}</span>}
              </NavLink>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t px-3 py-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5" />
          {state !== 'collapsed' && <span>Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
