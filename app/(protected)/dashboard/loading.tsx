export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin mx-auto mb-4 rounded-full border-2 border-purple-600 border-t-transparent"></div>
        <p className="text-gray-600">Loading Dashboard...</p>
      </div>
    </div>
  )
}
