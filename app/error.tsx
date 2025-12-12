'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-amber-50 to-red-50 px-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="text-6xl">😕</div>
        <h2 className="text-2xl font-bold text-gray-900">Algo salió mal</h2>
        <p className="text-gray-600">
          Hubo un problema al cargar la aplicación. Por favor, intenta de nuevo.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  )
}
