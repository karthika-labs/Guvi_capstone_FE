import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen righteous-regular bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-white mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-300 mb-8 text-lg">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/recipes"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
          >
            Go to Home
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 bg-white/10 backdrop-blur-lg text-white rounded-lg font-medium hover:bg-white/20 transition-all border border-white/20"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;

