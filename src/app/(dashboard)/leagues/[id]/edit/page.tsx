// Edit league page
export default async function EditLeaguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-rfl-navy mb-4">Edit League</h1>
      <p className="text-gray-600">Edit league ID: {id}</p>
    </div>
  );
}

