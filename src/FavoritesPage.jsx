import { useContext, useEffect, useState } from "react";
import ApiContext from "./context/ApiContext";
import Card from "./Card";
import { Link } from "react-router-dom";

export default function FavoritesPage() {
  const { recipes = [], isFavorite } = useContext(ApiContext);
  const [loading, setLoading] = useState(true);


// Stop loading whjen recipes  fetched
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
      <div className="fixed inset-0 bg-black flex flex-col justify-center items-center z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#A100FF] border-t-transparent"></div>
        <p className="mt-4 text-[#A100FF] text-lg font-semibold">Loading... Please wait</p>
      </div>
    );
  }

  return (
    <div className="relative  bg-[#181818] min-h-screen p-6">

      {/* Close button - always visible */}
      <Link
        to="/recipes"
        className="absolute fixed top-5 right-5 text-white text-2xl hover:text-gray-400"
      >
        ✖
      </Link>

      {favoriteRecipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-gray-500 text-6xl mb-4">💔</div>
          <p className="text-gray-400 text-lg">
            You have no favorite recipes yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 pt-6 mt-6 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {favoriteRecipes.map((recipe) => (
            <Card key={recipe._id} recipe={recipe} setLoading={setLoading}/>
          ))}
        </div>
      )}
    </div>
  );
}
