import { LoginForm } from '@/components/auth/LoginForm';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">YachtBase</h1>
          <p className="mt-2 text-sm text-gray-600">Admin Panel</p>
        </div>
        <Suspense fallback={<div className="bg-white shadow-sm rounded-lg p-8 border border-gray-200 animate-pulse h-32" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
