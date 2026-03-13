import { redirect } from 'next/navigation'

export default function Home() {
  // Since no login is required, we instantly route the default user to their dashboard
  redirect('/dashboard/event-types')
}