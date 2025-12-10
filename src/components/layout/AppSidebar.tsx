import { LayoutDashboard, Calendar, Users, Package, Settings, Kanban } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useBusiness } from '@/contexts/BusinessContext';
import { useTerminology } from '@/hooks/useTerminology';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function AppSidebar() {
  const { settings } = useBusiness();
  const terms = useTerminology();

  const menuItems = [
    { title: terms.dashboard, url: '/', icon: LayoutDashboard },
    { title: terms.crm, url: '/crm', icon: Kanban },
    { title: terms.meetings, url: '/agenda', icon: Calendar },
    { title: terms.clients, url: '/clientes', icon: Users },
    { title: terms.services, url: '/servicos', icon: Package },
    { title: 'Configurações', url: '/configuracoes', icon: Settings },
  ];


  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-10 w-10 shrink-0">
            {settings.logo ? (
              <AvatarImage src={settings.logo} alt={settings.businessName} />
            ) : null}
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {settings.businessName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-sm text-foreground">{settings.businessName}</span>
            <span className="text-xs text-muted-foreground">{settings.ownerName}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-8 w-8 shrink-0">
            {settings.photo ? (
              <AvatarImage src={settings.photo} alt={settings.ownerName} />
            ) : null}
            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
              {settings.ownerName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-medium text-foreground">{settings.ownerName}</span>
            <span className="text-xs text-muted-foreground">{settings.email}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
