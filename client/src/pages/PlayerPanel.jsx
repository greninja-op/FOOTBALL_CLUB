import Navbar from '../components/Navbar'

const PlayerPanel = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Player Panel</h2>
          <p className="text-gray-600">
            Welcome to the Player Panel. This is where you'll view your profile, stats, schedule, and submit leave requests.
          </p>
        </div>
      </main>
    </div>
  )
}

export default PlayerPanel
