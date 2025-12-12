"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* NAV - mobile-first: brand + login visible on mobile */}
      <nav className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
            <img src="/img/PFL_Logo.jpeg" alt="MFL" className="w-full h-full object-cover" />
          </div>
          <div className="block">
            <span className="font-semibold text-lg">My Fitness League</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-600 inline">
            Log In
          </Link>
          <Link href="/login?mode=signup">
            <Button className="px-4 py-2 text-sm">Sign Up</Button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <header className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-md md:flex md:items-center md:gap-8">
          {/* Left: copy */}
          <div className="md:flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight mb-2">
              Fitness Challenges For Teams
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
            Create leagues, build teams, and track workouts together. Simple tools to keep your community motivated and accountable.
            </p>

            <div className="flex gap-3 items-center flex-wrap">
              <Link href="/login?mode=signup">
                <Button className="px-5 py-2">Get started</Button>
              </Link>
            </div>

            <div className="mt-4 text-xs text-gray-500 flex gap-3 sm:gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-amber-100 text-amber-700 text-xs">Fast</span>
                <span className="text-xs">Setup in minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-rose-100 text-rose-700 text-xs">Social</span>
                <span className="text-xs">Team leaderboards</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-sky-100 text-sky-700 text-xs">Tracking</span>
                <span className="text-xs">Live Tracking</span>
              </div>
            </div>
          </div>

          {/* Right: clean app mock (dashboard vibe) */}
          {/* <div className="mt-4 md:mt-0 md:w-80 lg:w-96 mx-auto">
            <div className="bg-black rounded-2xl text-white overflow-hidden shadow-xl">
              <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
                <div className="text-sm font-medium">Summer Sprint</div>
                <div className="text-xs text-white/60">Team Phoenix</div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-semibold">3,200</div>
                    <div className="text-xs text-white/60">Points</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold">#2</div>
                    <div className="text-xs text-white/60">Rank</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div className="h-2 rounded-full bg-amber-400 w-3/4" />
                  </div>
                  <div className="mt-3 text-xs text-white/70">24 workouts logged • 8 active members</div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button className="flex-1 px-3 py-2 rounded-md bg-white text-black text-sm font-medium">Log workout</button>
                  <button className="px-3 py-2 rounded-md border border-white/10 text-sm">Invite</button>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </header>
      <section className="max-w-5xl mx-auto px-4 py-10">
  <h2 className="text-xl font-semibold mb-4">What you can do with MFL</h2>

  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
    <div className="p-4 bg-white rounded-xl shadow-sm border">
      <div className="text-3xl mb-2">🏆</div>
      <div className="text-sm font-medium">Compete</div>
      <p className="text-xs text-gray-500">Join weekly or seasonal leagues.</p>
    </div>

    <div className="p-4 bg-white rounded-xl shadow-sm border">
      <div className="text-3xl mb-2">💪</div>
      <div className="text-sm font-medium">Track</div>
      <p className="text-xs text-gray-500">Log your daily workouts.</p>
    </div>

    <div className="p-4 bg-white rounded-xl shadow-sm border">
      <div className="text-3xl mb-2">🔥</div>
      <div className="text-sm font-medium">Stay Motivated</div>
      <p className="text-xs text-gray-500">Streaks & progress bars.</p>
    </div>

    <div className="p-4 bg-white rounded-xl shadow-sm border">
      <div className="text-3xl mb-2">👥</div>
      <div className="text-sm font-medium">Connect</div>
      <p className="text-xs text-gray-500">Fitness with friends & coworkers.</p>
    </div>
  </div>
</section>

      {/* STATS + quick actions */}
      <section className="max-w-5xl mx-auto px-4 py-6">
        {/* <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <div className="text-xl font-semibold">200+</div>
            <div className="text-xs text-gray-500">Members</div>
          </div>
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <div className="text-xl font-semibold">5+</div>
            <div className="text-xs text-gray-500">Leagues</div>
          </div>
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <div className="text-xl font-semibold">50+</div>
            <div className="text-xs text-gray-500">Workouts</div>
          </div>
        </div> */}

        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-amber-100 flex items-center justify-center font-bold text-amber-700">J</div>
            <div>
              <div className="text-sm font-medium">Join any league</div>
              <div className="text-xs text-gray-500">Perfect for connecting with people.</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-sky-100 flex items-center justify-center font-bold text-sky-700">P</div>
            <div>
            <div className="text-sm font-medium">Start a private league</div>
            <div className="text-xs text-gray-500">Invite teammates and set rules.</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES - scrollable cards for mobile */}
      <section className="max-w-5xl mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold mb-3">How it works</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[
            { title: "Create a league", subtitle: "Custom rules & scoring" },
            { title: "Build your team", subtitle: "Add members & captains" },
            { title: "Track workouts", subtitle: "Upload proof & points" },
            { title: "Compete & Win", subtitle: "Crush your goals" },
          ].map((f, i) => (
            <div key={i} className="min-w-[200px] flex-shrink-0 bg-white rounded-xl p-4 shadow-sm border">
              <div className="text-xs text-gray-400">0{i + 1}</div>
              <div className="font-medium mt-2">{f.title}</div>
              <div className="text-xs text-gray-500 mt-1">{f.subtitle}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-5xl mx-auto px-4 py-8">
  <h3 className="text-lg font-semibold mb-4">How MFL helps you win</h3>

  <div className="grid sm:grid-cols-2 gap-4">
    <div className="bg-white rounded-xl p-4 shadow-sm border">
      <div className="font-medium">Clear Scoring System</div>
      <p className="text-xs text-gray-500 mt-1">
        Every workout earns points. Leaderboards keep motivation high.
      </p>
    </div>

    <div className="bg-white rounded-xl p-4 shadow-sm border">
      <div className="font-medium">Weekly Check-ins</div>
      <p className="text-xs text-gray-500 mt-1">
        Teams stay active with weekly goals and progress tracking.
      </p>
    </div>

    <div className="bg-white rounded-xl p-4 shadow-sm border">
      <div className="font-medium">Instant Team Updates</div>
      <p className="text-xs text-gray-500 mt-1">
        See who logged workouts and how your team is ranking.
      </p>
    </div>

    <div className="bg-white rounded-xl p-4 shadow-sm border">
      <div className="font-medium">Zero Admin Work</div>
      <p className="text-xs text-gray-500 mt-1">
        MFL handles scoring, proof verification, and calculations.
      </p>
    </div>
  </div>
</section>


      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-amber-400 to-rose-500 rounded-2xl p-5 text-white text-center shadow-lg">
          <div className="text-lg font-semibold">Ready to motivate your team?</div>
          <div className="text-sm mt-2">Create a league, invite teammates, and get competing today.</div>
          <div className="mt-4">
            <Link href="/login?mode=signup">
              <Button className="px-6 py-2">Get started</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-5xl mx-auto px-4 py-6 text-sm text-gray-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} My Fitness League</div>
          <div className="flex gap-4">
            <Link href="/login" className="text-gray-500">Log In</Link>
            <Link href="/login?mode=signup" className="text-gray-500">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}