import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaShareAlt } from "react-icons/fa";
import RecipeCard from "./RecipeCard";
import ApiContext from "./context/ApiContext";

function Home() {
  const [searchbar, setSearchbar] = useState(false);
  const { favoritesCount, user, searchRecipes, recipes, getUserRecipes } = useContext(ApiContext);
  const [searchMode, setSearchMode] = useState("name"); // "name" or "ingredients"
  const [activeTab, setActiveTab] = useState("all"); // "all" or "my"
  const [myRecipes, setMyRecipes] = useState([]);
  const [loadingMyRecipes, setLoadingMyRecipes] = useState(false);

  const [filters, setFilters] = useState({
    searchText: "",
    mealType: "",
    foodPreference: "",
  });

  const [searchResults, setSearchResults] = useState([]);
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
    setSearchResults(data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
    setSearchbar(false)
  }
};

  // Fetch user's recipes when switching to "My Recipes" tab
  useEffect(() => {
    if (activeTab === "my" && user?._id) {
      const fetchMyRecipes = async () => {
        setLoadingMyRecipes(true);
        try {
          const userRecipes = await getUserRecipes(user._id);
          setMyRecipes(userRecipes);
        } catch (err) {
          console.error("Error fetching my recipes:", err);
        } finally {
          setLoadingMyRecipes(false);
        }
      };
      fetchMyRecipes();
    }
  }, [activeTab, user?._id, getUserRecipes]);

  // Determine which recipes to display
  const displayRecipes = searchResults.length > 0 
    ? searchResults 
    : activeTab === "my" 
      ? myRecipes 
      : recipes;


  return (
    <div className="w-full bg-[#181818] ">
      <div className="flex flex-col items-center w-full max-w-7xl mx-auto justify-center min-h-screen bg-[#181818] text-white">
        <header className="w-full ">
          <nav className=" flex  justify-between py-6 mb-12 border-b border-[#A100FF]">
            <Link to="/recipes" className="text-3xl mt-4 px-4 font-bold text-[#A100FF] cursor-pointer hover:text-purple-400 transition">
              Re<span className="text-4xl font-bold">&lt;</span>ipe !!
            </Link>
            <div className="flex  items-center justify-around mr-8">
              <Link
                to="/recipes/new"
                className="mt-4 inline-block bg-[#A100FF] hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded"
              >
                Add New Recipe
              </Link>
              {/* Week Plans - Always visible, redirects to login if not authenticated */}
              <Link
                to={user ? "/weekplans" : "/login"}
                className="mt-4 ml-4 inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded whitespace-nowrap"
                title={user ? "View Week Plans" : "Login to access Week Plans"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 flex-shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                  />
                </svg>
                <span>Week Plans</span>
              </Link>
              {!user && (
                <>
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
                </>
              )}
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
                  <Link 
                    to={`/profile/${user._id}`}
                    className="mt-4 ml-4 inline-block"
                    title="My Profile"
                  >
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <img
                          src={user.avatar || "https://i.pravatar.cc/50"}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover border-2 border-[#A100FF] hover:border-purple-400 transition cursor-pointer"
                        />
                      </div>
                      <span className="text-xs text-gray-300 mt-1 max-w-[60px] truncate">
                        {user.username}
                      </span>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </nav>
        </header>

        <section className="relative flex flex-col items-center px-4 text-center py-16 overflow-hidden">
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-transparent animate-pulse"></div>
          
          {/* Animated Welcome Text with typing/printing animation */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 relative z-10">
            <span className="inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] animate-typing">Welcome to Recipe Hub!!</span>
          </h1>
          
          {/* Helper Stanza with individual line animations */}
          <p className="text-lg md:text-xl mb-8 text-center max-w-2xl text-gray-300 leading-relaxed relative z-10">
            <span className="block mb-2 animate-text-fade-in-1">🍳 Discover culinary treasures from every corner of the globe</span>
            <span className="block mb-2 animate-text-fade-in-2">👨‍🍳 Share your kitchen masterpieces with a vibrant community</span>
            <span className="block animate-text-fade-in-3">✨ Plan your meals, create shopping lists, and transform your cooking journey</span>
          </p>
          
          {/* Modern Hero Image - Matches Featured Recipes Container Width */}
          <div className="w-full px-4">
            <div className="p-4">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl group cursor-pointer w-full">
                {/* Image with zoom-in on hover */}
                <div className="overflow-hidden h-[400px] md:h-[500px]">
                  <img
                    src="/hero-image.jpg"
                    alt="Delicious Food Collection"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    onError={(e) => {
                      // Fallback to online image if local image not found
                      e.target.src = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <main>
          <section className="mt-12 w-full px-4">
            <div className="flex justify-center mb-6">
              <div className="flex gap-4 bg-[#1a1a2e] rounded-lg p-1 border border-purple-900/40">
                <button
                  onClick={() => {
                    setActiveTab("all");
                    setSearchResults([]);
                  }}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === "all"
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  All Recipes
                </button>
                {user && (
                  <button
                    onClick={() => {
                      setActiveTab("my");
                      setSearchResults([]);
                    }}
                    className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                      activeTab === "my"
                        ? "bg-purple-600 text-white shadow-lg"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    My Recipes
                  </button>
                )}
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-6 text-center">
              {activeTab === "my" ? "My Recipes" : "Featured Recipes"}
            </h2>
            {loadingMyRecipes ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-400">Loading your recipes...</p>
              </div>
            ) : (
              <RecipeCard recipes={displayRecipes} />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
export default Home;
