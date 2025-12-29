import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          Paste Not Found
        </h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          The paste you&apos;re looking for doesn&apos;t exist or has expired.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Create a new paste
        </Link>
      </div>
    </div>
  );
}

