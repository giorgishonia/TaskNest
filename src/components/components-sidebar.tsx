'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Home, 
  Calendar, 
  CheckSquare, 
  List, 
  Settings,
  Menu
} from 'lucide-react'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean
}

export function Sidebar({ className, isOpen = true }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const navItems = [
    { name: 'Dashboard', icon: Home, href: '/' },
    { name: 'All Tasks', icon: List, href: '/tasks' },
    { name: 'Today', icon: Calendar, href: '/today' },
    { name: 'Completed', icon: CheckSquare, href: '/completed' },
    { name: 'Settings', icon: Settings, href: '/settings' },
  ]

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-40 md:hidden"
        onClick={toggleMobileSidebar}
      >
        <Menu className="h-4 w-4" />
      </Button>
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 flex h-screen w-64 flex-col bg-background transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <h2 className="text-lg font-semibold">Todo App</h2>
        </div>
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </ScrollArea>
      </aside>
    </>
  )
}