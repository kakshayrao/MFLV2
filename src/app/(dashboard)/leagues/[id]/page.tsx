// League detail page
export default async function LeagueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-rfl-navy mb-4">League Details</h1>
      <p className="text-gray-600">League ID: {id}</p>
    </div>
  );
}

