'use client'

// Root error boundary
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-rfl-navy mb-4">Something went wrong!</h2>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-rfl-navy text-white rounded-lg hover:bg-rfl-navy/90"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

