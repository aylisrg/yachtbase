export default function UsersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage admin users and their roles.
        </p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm text-gray-500">No users yet.</p>
        </div>
      </div>
    </div>
  );
}
