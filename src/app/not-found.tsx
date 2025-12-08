// 404 page
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-rfl-navy mb-4">404</h1>
        <p className="text-gray-600 mb-4">Page not found</p>
        <a href="/" className="text-rfl-navy underline">Go back home</a>
      </div>
    </div>
  );
}

