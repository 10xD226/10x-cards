import { cn } from '../../lib/utils'

interface AvatarProps {
  src?: string
  alt: string
  fallback: string
  className?: string
}

export function Avatar({ src, alt, fallback, className }: AvatarProps) {
  return (
    <div className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className
    )}>
      {src ? (
        <img
          className="aspect-square h-full w-full"
          src={src}
          alt={alt}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
          <span className="text-sm font-medium text-muted-foreground">
            {fallback}
          </span>
        </div>
      )}
    </div>
  )
} 