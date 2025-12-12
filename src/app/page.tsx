import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded overflow-hidden">
            <img src="/img/PFL_Logo.jpeg" alt="MFL" className="w-full h-full object-cover" />
          </div>
          <span className="font-semibold text-gray-900">My Fitness League</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-600">
            Log In
          </Link>
          <Link href="/login?mode=signup">
            <Button className="bg-black text-white text-sm">
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
            Fitness challenges for teams
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Create leagues, build teams, and track workouts together. Simple tools to keep your community motivated and accountable.
          </p>
          <div className="flex gap-4">
            <Link href="/login?mode=signup">
              <Button className="bg-black text-white px-6">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="px-6">
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <h2 className="text-2xl font-semibold text-gray-900 mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="text-sm font-medium text-gray-400 mb-2">01</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Create a league</h3>
              <p className="text-gray-600 text-sm">Set up your fitness challenge with custom rules, duration, and scoring.</p>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-400 mb-2">02</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Invite your team</h3>
              <p className="text-gray-600 text-sm">Add members, form teams, and assign captains to lead the charge.</p>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-400 mb-2">03</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Track and compete</h3>
              <p className="text-gray-600 text-sm">Log workouts, upload proof, and watch the leaderboard update in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Stats */}
      <section className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-semibold text-gray-900">200+</div>
              <div className="text-sm text-gray-500 mt-1">Members</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-gray-900">5+</div>
              <div className="text-sm text-gray-500 mt-1">Leagues</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-gray-900">50+</div>
              <div className="text-sm text-gray-500 mt-1">Workouts</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ready to start?</h2>
          <p className="text-gray-600 mb-8">Create your first league in minutes.</p>
          <Link href="/login?mode=signup">
            <Button className="bg-black text-white px-8">
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-gray-500">
          <span>© 2024 My Fitness League</span>
          <div className="flex gap-6">
            <Link href="/login" className="text-gray-500">Log In</Link>
            <Link href="/login?mode=signup" className="text-gray-500">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
