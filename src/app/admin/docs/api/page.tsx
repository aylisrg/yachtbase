import { API_VERSION } from '@/lib/constants';

export default function ApiDocsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">API Documentation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Current API version: {API_VERSION}
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Authentication</h2>
          <p className="text-sm text-gray-600">
            All API requests must include an{' '}
            <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">
              Authorization: Bearer {'<api-key>'}
            </code>{' '}
            header.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Base URL</h2>
          <code className="font-mono bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">
            /api/v1
          </code>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Endpoints</h2>
          <div className="space-y-2">
            {[
              { method: 'GET', path: '/api/v1/meta', desc: 'API metadata and version info' },
              { method: 'GET', path: '/api/v1/yachts', desc: 'List all yachts' },
              { method: 'GET', path: '/api/v1/yachts/:id', desc: 'Get yacht by ID' },
              { method: 'GET', path: '/api/v1/yachts/:id/media', desc: 'Get yacht media assets' },
              { method: 'GET', path: '/api/v1/yachts/:id/specifications', desc: 'Get yacht specifications' },
            ].map(({ method, path, desc }) => (
              <div key={path} className="flex items-center gap-3 text-sm">
                <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded w-12 text-center">
                  {method}
                </span>
                <code className="font-mono text-xs text-gray-600 flex-1">{path}</code>
                <span className="text-gray-500 text-xs">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Scopes</h2>
          <div className="flex flex-wrap gap-2">
            {['read:yachts', 'read:media', 'read:specifications', 'read:locations', 'write:yachts', 'write:media'].map((scope) => (
              <code
                key={scope}
                className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {scope}
              </code>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
