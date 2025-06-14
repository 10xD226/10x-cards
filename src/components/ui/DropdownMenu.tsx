'use client'

import { useState, useRef, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { cn } from '../../lib/utils'

interface DropdownMenuItem {
  label: string
  action: string
  variant?: 'default' | 'destructive'
}

interface DropdownMenuProps {
  trigger: React.ReactNode
  items: DropdownMenuItem[]
}

export function DropdownMenu({ trigger, items }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleItemClick = async (action: string) => {
    setIsOpen(false)
    
    if (action === 'signOut') {
      await supabase.auth.signOut()
      router.refresh()
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center"
      >
        {trigger}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border bg-popover p-1 shadow-md">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemClick(item.action)}
              className={cn(
                'w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground',
                item.variant === 'destructive' && 'text-destructive hover:bg-destructive hover:text-destructive-foreground'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 