import { useContext, useEffect, useState } from "react";
import ApiContext from "./context/ApiContext";
import Card from "./Card";
import { Link, useNavigate } from "react-router-dom";

export default function FavoritesPage() {
  const { recipes = [], isFavorite, favoritesCount } = useContext(ApiContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Stop loading when recipes fetched
  useEffect(() => {
    if (recipes.length > 0 || recipes.length === 0) { 
      setTimeout(() => {
        setLoading(false);
      }, 500); 
    }
  }, [recipes]);

  const favoriteRecipes = recipes.filter((recipe) => isFavorite(recipe._id));

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a] flex flex-col justify-center items-center z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
        <p className="mt-4 text-purple-400 text-lg font-semibold">Loading favorites... Please wait</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a] text-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/recipes")}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-all duration-200 group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 group-hover:-translate-x-1 transition-transform"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">Back to Recipes</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Saved Recipes
              </h1>
              <p className="text-gray-400 mt-2">
                Your collection of favorite recipes
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 flex items-center gap-6">
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-purple-500/20 rounded-lg px-6 py-3 shadow-lg">
              <div className="text-2xl font-bold text-purple-400">{favoriteRecipes.length}</div>
              <div className="text-sm text-gray-400">Saved Recipes</div>
            </div>
            {/* <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-pink-500/20 rounded-lg px-6 py-3 shadow-lg">
              <div className="text-2xl font-bold text-pink-400">{favoritesCount || favoriteRecipes.length}</div>
              <div className="text-sm text-gray-400">Total Favorites</div>
            </div> */}
          </div>
        </div>

        {/* Content */}
        {favoriteRecipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] rounded-2xl border border-purple-500/20">
            <div className="text-8xl mb-6 animate-bounce">💔</div>
            <h2 className="text-2xl font-bold text-white mb-3">No Saved Recipes Yet</h2>
            <p className="text-gray-400 text-center max-w-md mb-6">
              Start exploring recipes and save your favorites to see them here!
            </p>
            <Link
              to="/recipes"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/30"
            >
              Browse Recipes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favoriteRecipes.map((recipe) => (
              <Card key={recipe._id} recipe={recipe} setLoading={setLoading}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
