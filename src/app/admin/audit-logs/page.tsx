export default function AuditLogsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Audit Logs</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track all admin actions and changes.
        </p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm text-gray-500">No audit logs yet.</p>
        </div>
      </div>
    </div>
  );
}
