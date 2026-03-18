import type { AuthUser } from '@/lib/auth';

interface AdminHeaderProps {
  user: AuthUser;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {user.email}
        </span>
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
