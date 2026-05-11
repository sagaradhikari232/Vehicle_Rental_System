/**
 * ProfileSkeleton.jsx
 * src/components/pages/account/ProfileSkeleton.jsx
 *
 * Full-page loading skeleton shown while the initial GET /users/current-user
 * request is in flight. Mirrors the exact layout of AccountPage so the
 * transition from skeleton → real content is seamless.
 */
import React from 'react';

function Bone({ className = '' }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />;
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  );
}

export default function ProfileSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Header card skeleton */}
      <Card>
        <Bone className="h-32 sm:h-44 w-full rounded-2xl mb-0" />
        <div className="flex items-end gap-4 -mt-12 sm:-mt-16 mb-4">
          <Bone className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl flex-shrink-0 ring-4 ring-white" />
          <div className="flex-1 space-y-2 pb-2">
            <Bone className="h-5 w-44" />
            <Bone className="h-3.5 w-28" />
            <Bone className="h-3 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-px border border-gray-100 rounded-2xl overflow-hidden">
          {[1, 2, 3].map((i) => <Bone key={i} className="h-14 rounded-none" />)}
        </div>
      </Card>

      {/* Stats skeleton */}
      <Card>
        <Bone className="h-5 w-40 mb-5" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Bone key={i} className="h-24 rounded-2xl" />)}
        </div>
      </Card>

      {/* Form skeleton */}
      <Card>
        <Bone className="h-5 w-48 mb-2" />
        <Bone className="h-3 w-72 mb-6" />
        <Bone className="h-16 rounded-2xl mb-5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-1.5">
              <Bone className="h-3.5 w-24" />
              <Bone className="h-10 rounded-xl" />
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
          <Bone className="h-10 w-36 rounded-lg" />
        </div>
      </Card>

      {/* Security skeleton */}
      <Card>
        <div className="flex gap-3 mb-6">
          <Bone className="w-10 h-10 rounded-xl flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <Bone className="h-5 w-24" />
            <Bone className="h-3 w-64" />
          </div>
        </div>
        <div className="space-y-4 max-w-md">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <Bone className="h-3.5 w-28" />
              <Bone className="h-10 rounded-xl" />
            </div>
          ))}
          <Bone className="h-10 w-40 rounded-lg mt-2" />
        </div>
      </Card>
    </div>
  );
}