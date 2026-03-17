import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">YachtBase</h1>
          <p className="mt-2 text-sm text-gray-600">Admin Panel</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
