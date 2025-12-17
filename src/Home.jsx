import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import RecipeCard from "./RecipeCard";
import ApiContext from "./context/ApiContext";

function Home() {
  const [searchbar, setSearchbar] = useState(false);
  const { favoritesCount, user, searchRecipes } = useContext(ApiContext);
  const [searchMode, setSearchMode] = useState("name"); // "name" or "ingredients"

  const [filters, setFilters] = useState({
    searchText: "",
    mealType: "",
    foodPreference: "",
  });

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  // const handleSearch = async () => {
  //   console.log("call seacrch ");
  //   setLoading(true);

  //   const params = {};

  //   if (filters.mealType) params.mealType = filters.mealType;
  //   if (filters.foodPreference) params.foodPreference = filters.foodPreference;
  //   if (filters.recipeName) params.recipeName = filters.recipeName;

  //   if (filters.ingredients) {
  //     params.ingredients = filters.ingredients
  //       .split(",")
  //       .map((i) => i.trim())
  //       .join(",");
  //   }

  //   const data = await searchRecipes(params);
  //   setRecipes(data);
  //   setLoading(false);
  // };
const handleSearch = async () => {
  console.log("CALL SEARCH");

  setLoading(true);

  const params = {};

  if (filters.mealType) params.mealType = filters.mealType;
  if (filters.foodPreference) params.foodPreference = filters.foodPreference;

  // SINGLE SEARCH BAR with mode-based search
  if (filters.searchText?.trim()) {
    params.search = filters.searchText.trim();
    // Set type parameter based on search mode
    params.type = searchMode === "name" ? "rcp" : "ing";
  }

  try {
    const data = await searchRecipes(params);
    setRecipes(data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
    setSearchbar(false)
  }
};


  return (
    <div className="w-full bg-[#181818] ">
      <div className="flex flex-col items-center w-full max-w-7xl mx-auto justify-center min-h-screen bg-[#181818] text-white">
        <header className="w-full ">
          <nav className=" flex  justify-between py-6 mb-12 border-b border-[#A100FF]">
            <h2 className="text-3xl mt-4 px-4 font-bold text-[#A100FF] cursor-pointer">
              Re<span className="text-4xl font-bold">&lt;</span>ipe !!
            </h2>
            <div className="flex  items-center justify-around mr-8">
              <Link
                to="/recipes/new"
                className="mt-4 inline-block bg-[#A100FF] hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded"
              >
                Add New Recipe
              </Link>
              <Link
                to="/login"
                className="mt-4 ml-4 inline-block bg-[#A100FF] hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="mt-4 ml-4 inline-block bg-[#A100FF] hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded"
              >
                Register
              </Link>
              <div className="flex justify-center items-center relative gap-3">
                <Link
                  to="/favorites"
                  className="mt-4 ml-6 inline-block text-white font-semibold py-2 px-4 rounded relative"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6  ml-6 cursor-pointer hover:text-purple-500 transition-all "
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9"
                    />
                  </svg>
                  {favoritesCount > 0 && (
                    <span className="absolute -top-1 right-2 bg-[#A100FF] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {favoritesCount}
                    </span>
                  )}
                </Link>
                <button>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6 ml-6 cursor-pointer hover:text-purple-500 transition-all "
                    onClick={() => setSearchbar((prev) => !prev)}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z"
                    />
                  </svg>
                </button>
                {searchbar && (
                  <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4 transition-opacity duration-300">
                    {/* Close Button */}
                    <button
                      className="absolute top-5 left-5 bg-[#A100FF] hover:bg-purple-700 text-white p-2 rounded-full transition duration-300 hover:scale-110"
                      onClick={() => setSearchbar(false)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    <div className="w-full max-w-5xl bg-[#1a1a2e] border border-purple-900/40 rounded-2xl p-6 shadow-lg">
                      {/* Search Mode Toggle */}
                      <div className="mb-6 flex flex-col items-center">
                        <div className="flex items-center gap-3 bg-[#0f0f1a] rounded-full p-1 border border-purple-900/40">
                          <button
                            onClick={() => setSearchMode("name")}
                            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                              searchMode === "name"
                                ? "bg-purple-600 text-white shadow-lg"
                                : "text-gray-400 hover:text-white"
                            }`}
                          >
                            Recipe Name
                          </button>
                          <button
                            onClick={() => setSearchMode("ingredients")}
                            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                              searchMode === "ingredients"
                                ? "bg-purple-600 text-white shadow-lg"
                                : "text-gray-400 hover:text-white"
                            }`}
                          >
                            Ingredients
                          </button>
                        </div>
                        <p className="text-gray-400 text-sm mt-2">
                          {searchMode === "name"
                            ? "Search by recipe name (e.g., biryani, pasta)"
                            : "Search by ingredients you have (e.g., paneer, tomato, onion)"}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Recipe name */}
                        <div className="relative col-span-1 md:col-span-2">
                          <input
                            type="text"
                            placeholder={
                              searchMode === "name"
                                ? "Enter recipe name (e.g., biryani, pasta)"
                                : "Enter ingredients (e.g., paneer, tomato, onion)"
                            }
                            value={filters.searchText}
                            onChange={(e) =>
                              setFilters({ ...filters, searchText: e.target.value })
                            }
                            className="col-span-1 md:col-span-3 w-full py-3 px-4 pl-11 rounded-xl
             bg-[#0f0f1a] text-white placeholder-gray-400
             focus:outline-none focus:ring-2 focus:ring-purple-600"
                          />

                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400">
                            🔍
                          </span>
                        </div>

                        {/* Meal type */}
                        <select
                          value={filters.mealType}
                          onChange={(e) =>
                            setFilters({ ...filters, mealType: e.target.value })
                          }
                          className="w-full py-3 px-4 rounded-xl bg-[#0f0f1a] text-white
                     border border-purple-900/40 focus:ring-2 focus:ring-purple-600"
                        >
                          <option value="">All Meals</option>
                          <option value="Breakfast">Breakfast</option>
                          <option value="Lunch">Lunch</option>
                          <option value="Dinner">Dinner</option>
                        </select>

                        {/* Food preference */}
                        <select
                          value={filters.foodPreference}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              foodPreference: e.target.value,
                            })
                          }
                          className="w-full py-3 px-4 rounded-xl bg-[#0f0f1a] text-white
                     border border-purple-900/40 focus:ring-2 focus:ring-purple-600"
                        >
                          <option value="">All</option>
                          <option value="Veg">Veg</option>
                          <option value="Non-Veg">Non-Veg</option>
                        </select>

                        {/* Ingredients */}
                        {/* <input
                          type="text"
                          placeholder="Ingredients (comma separated)"
                          value={filters.ingredients}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              ingredients: e.target.value,
                            })
                          }
                          className="col-span-1 md:col-span-3 w-full py-3 px-4 rounded-xl
                     bg-[#0f0f1a] text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-purple-600"
                        /> */}

                        {/* Search button */}
                        <button
                          onClick={handleSearch}
                          className="col-span-1 py-3 px-6 rounded-xl font-semibold
                     bg-purple-600 hover:bg-purple-700
                     transition duration-300 hover:scale-105 text-white"
                        >
                          Search
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {user && (
                  <Link to={`/profile/${user._id}`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      ...
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </nav>
        </header>

        <section className="flex flex-col items-center px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">Welcome to Recipe Hub</h1>
          <p className="text-lg mb-8 text-center max-w-xl">
            Discover and share amazing recipes from around the world. Whether
            you're a seasoned chef or just starting out, Recipe Hub is your
            go-to platform for culinary inspiration.
          </p>
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVjaXBlJTIwZm9vZHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
            alt="Delicious Food"
            className="w-3/4 max-w-2xl rounded-lg shadow-lg"
          />
        </section>
        <main>
          <section className="mt-12 w-full px-4">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Featured Recipes
            </h2>
            <RecipeCard />
          </section>
        </main>
      </div>
    </div>
  );
}
export default Home;
