import MapComponent from '@/components/map/MapComponent';

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-gray-900">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 bg-gray-900 bg-opacity-95 backdrop-blur-sm border-b border-gray-700">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⚡</div>
              <div>
                <h1 className="text-xl font-bold text-white">Lightning Tracker</h1>
                <p className="text-xs text-gray-400">Real-time lightning detection</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-green-600 text-white text-xs rounded-full font-medium">
                LIVE
              </div>
              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors">
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Map Component */}
      <div className="pt-16 h-full">
        <MapComponent className="h-full" />
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-95 backdrop-blur-sm border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-gray-300">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Connected
            </span>
            <span>Last update: {new Date().toLocaleTimeString()}</span>
          </div>
          
          <div className="flex items-center gap-4 text-gray-300">
            <span>Lightning strikes: 0</span>
            <span>Risk level: Low</span>
          </div>
        </div>
      </div>
    </main>
  );
}
