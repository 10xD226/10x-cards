import Link from 'next/link'
import { User } from '@supabase/auth-helpers-nextjs'
import { Avatar } from '../ui/Avatar'
import { DropdownMenu } from '../ui/DropdownMenu'
import { ThemeToggle } from '../ui/ThemeToggle'

interface TopBarProps {
  user: User
}

export function TopBar({ user }: TopBarProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="text-xl font-bold">InterviewPrep</div>
        </Link>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <DropdownMenu
            trigger={
              <Avatar
                src={user.user_metadata?.avatar_url}
                alt={user.user_metadata?.full_name || user.email || 'User'}
                fallback={user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U'}
              />
            }
            items={[
              {
                label: 'Wyloguj',
                action: 'signOut',
                variant: 'destructive'
              }
            ]}
          />
        </div>
      </div>
    </header>
  )
} 