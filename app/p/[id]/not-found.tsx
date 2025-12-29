import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Paste Not Found
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          The paste you're looking for doesn't exist or has expired.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
        >
          Create a new paste
        </Link>
      </div>
    </div>
  );
}

