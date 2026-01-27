'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, Users, Briefcase, ShoppingCart, Layers, FileText, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  onLogout?: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const menuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/admin',
    },
    {
      label: 'Users',
      icon: Users,
      href: '/admin/users',
    },
    {
      label: 'Industry',
      icon: Briefcase,
      href: '/admin/industry',
    },
    {
      label: 'Product',
      icon: ShoppingCart,
      href: '/admin/product',
    },
    {
      label: 'Category',
      icon: Layers,
      href: '/admin/category',
    },
    {
      label: 'Post',
      icon: FileText,
      href: '/admin/post',
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/admin/settings',
    },
  ];

  const isActive = (href: string) => {
    if (href === '/admin' && pathname === '/admin') return true;
    if (href !== '/admin' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`relative bg-secondary border-r border-border transition-all duration-300 flex flex-col ${isOpen ? 'w-64' : 'w-20'
          }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border h-16">
          {isOpen ? (
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-foreground tex-center">SUNTECH CMS</h1>
            </div>
          ) : (
            <div className="mx-auto">
              <span className="text-lg font-bold text-foreground">S</span>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-secondary-foreground hover:bg-primary/10'
                    }`}
                >
                  <div className={`flex items-center justify-center ${isOpen ? '' : 'flex-1'}`}>
                    <Icon size={20} className="p-0 m-0 w-[fit-content]" />
                  </div>
                  {isOpen && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        {/* Sidebar Footer */}
        <div className="border-t border-border p-3 space-y-2">
          <button
            onClick={onLogout}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-secondary-foreground hover:bg-destructive/10 transition-colors ${!isOpen ? 'justify-center px-0' : ''}`}
          >
            <LogOut size={20} />
            {isOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
        <div className="absolute right-[-15px] top-[10px] w-5 h-10 bg-secondary rounded-r-lg">
          <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-center w-full h-full">
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
