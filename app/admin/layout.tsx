"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { href: "/admin", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { href: "/admin/orders", label: "অর্ডার", icon: ShoppingCart },
  { href: "/admin/products", label: "পণ্য", icon: Package },
  { href: "/admin/categories", label: "ক্যাটাগরি", icon: FolderTree },
  { href: "/admin/customers", label: "কাস্টমার", icon: Users },
  { href: "/admin/analytics", label: "অ্যানালিটিক্স", icon: BarChart3 },
  { href: "/admin/settings", label: "সেটিংস", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const SidebarContent = () => (
    <nav className='space-y-1'>
      {sidebarLinks.map((link) => {
        const Icon = link.icon;
        const isActive =
          pathname === link.href ||
          (link.href !== "/admin" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center justify-between px-4 py-3 rounded-lg transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted",
            )}
          >
            <div className='flex items-center gap-3'>
              <Icon className='h-5 w-5' />
              <span className='font-medium'>{link.label}</span>
            </div>
          </Link>
        );
      })}
      <button className='flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-destructive hover:bg-destructive/10 w-full'>
        <LogOut className='h-5 w-5' />
        <span className='font-medium'>লগআউট</span>
      </button>
    </nav>
  );

  return (
    <div className='min-h-screen bg-muted/30'>
      {/* Admin Header */}
      <header className='sticky top-0 z-50 w-full border-b border-border bg-card'>
        <div className='flex h-16 items-center justify-between px-4 lg:px-6'>
          <div className='flex items-center gap-4'>
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className='lg:hidden'>
                <Button variant='ghost' size='icon'>
                  <Menu className='h-5 w-5' />
                </Button>
              </SheetTrigger>
              <SheetContent side='left' className='w-72 bg-card'>
                <div className='py-6'>
                  <Link
                    href='/admin'
                    className='flex items-center gap-2 px-4 mb-6'
                  >
                    <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
                      <span className='text-primary-foreground font-bold'>
                        M
                      </span>
                    </div>
                    <span className='text-lg font-bold text-foreground'>
                      Admin Panel
                    </span>
                  </Link>
                  <SidebarContent />
                </div>
              </SheetContent>
            </Sheet>

            <Link href='/admin' className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
                <span className='text-primary-foreground font-bold'>M</span>
              </div>
              <span className='text-lg font-bold text-foreground hidden sm:inline'>
                PetBazaar Admin
              </span>
            </Link>
          </div>

          <div className='flex items-center gap-4'>
            <Button variant='ghost' size='icon' className='relative'>
              <Bell className='h-5 w-5' />
              <span className='absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full' />
            </Button>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
                <span className='text-primary font-medium text-sm'>আ</span>
              </div>
              <span className='text-sm font-medium text-foreground hidden sm:inline'>
                Admin
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className='flex'>
        {/* Desktop Sidebar */}
        <aside className='hidden lg:block w-64 shrink-0 border-r border-border bg-card min-h-[calc(100vh-4rem)]'>
          <div className='sticky top-16 p-4'>
            <SidebarContent />
          </div>
        </aside>

        {/* Main Content */}
        <main className='flex-1 p-4 lg:p-6'>{children}</main>
      </div>
    </div>
  );
}
