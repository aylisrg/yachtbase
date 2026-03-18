import { APP_NAME } from '@/lib/constants';

const stats = [
  { label: 'Total Yachts', value: '—' },
  { label: 'Media Assets', value: '—' },
  { label: 'Media in Inbox', value: '—' },
  { label: 'API Clients', value: '—' },
];

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to {APP_NAME} admin panel.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="bg-white rounded-lg border border-gray-200 p-5"
          >
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-sm font-medium text-gray-900 mb-3">
          Recent Activity
        </h2>
        <p className="text-sm text-gray-500">No recent activity.</p>
      </div>
    </div>
  );
}
