import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Clock, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

// Update the props to expect params as a Promise (Next.js 15 standard)
export default async function PublicProfilePage({ 
  params 
}: { 
  params: Promise<{ username: string }> | { username: string } 
}) {
  // THE FIX: Await the params object properly before extracting the username
  const resolvedParams = await params
  
  // Also fallback to 'slug' just in case your folder is named [slug] instead of [username]
  const targetUsername = resolvedParams.username || (resolvedParams as any).slug

  if (!targetUsername) {
    return notFound()
  }

  // 1. Fetch the user and ONLY their active events
  const user = await prisma.user.findUnique({
    where: { username: targetUsername },
    include: {
      eventTypes: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' } 
      }
    }
  })

  // 2. If someone types a random username, show 404
  if (!user) return notFound()

  // Capitalize the first letter for a clean display name
  const displayName = user.username.charAt(0).toUpperCase() + user.username.slice(1)
  const initials = displayName.charAt(0)

  return (
    <div className="min-h-screen bg-muted/10 flex flex-col items-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-2xl space-y-8">
        
        {/* Profile Header Section */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-24 w-24 rounded-full border-4 border-background shadow-md bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm sm:text-base">
              Welcome to my scheduling page. Please select an event below to book a time with me.
            </p>
          </div>
        </div>

        {/* Event Types List */}
        <div className="space-y-4 mt-8">
          {user.eventTypes.length === 0 ? (
            <div className="text-center p-8 bg-card rounded-xl border border-dashed shadow-sm">
              <p className="text-muted-foreground">No public event types available right now.</p>
            </div>
          ) : (
            user.eventTypes.map((event) => (
              <Link key={event.id} href={`/${user.username}/${event.slug}`} className="block">
                <Card className="group transition-all hover:border-primary/50 shadow-sm hover:shadow-md cursor-pointer border-border overflow-hidden rounded-xl">
                  <CardContent className="p-0 flex items-stretch bg-card">
                    <div 
                      className="w-2.5 shrink-0 transition-colors" 
                      style={{ backgroundColor: event.color || '#0f172a' }} 
                    />
                    
                    <div className="p-5 sm:p-6 flex-1 flex items-center justify-between">
                      <div className="space-y-1.5">
                        <h2 className="text-lg sm:text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                          {event.title}
                        </h2>
                        <div className="flex items-center text-sm text-muted-foreground gap-4 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {event.duration} min
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0 ml-4">
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

        {/* Branding Footer */}
        <div className="text-center pt-8 pb-12">
           <Link href="/" className="text-xs text-muted-foreground hover:underline">
             Powered by your Cal.com Clone
           </Link>
        </div>

      </div>
    </div>
  )
}