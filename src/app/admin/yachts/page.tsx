export default function YachtsPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Yachts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the yacht registry.
          </p>
        </div>
        <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors">
          Add Yacht
        </button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm text-gray-500">No yachts yet.</p>
        </div>
      </div>
    </div>
  );
}
