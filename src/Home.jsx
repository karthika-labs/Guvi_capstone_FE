import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShareAlt } from "react-icons/fa";
import RecipeCard from "./RecipeCard";
import ApiContext from "./context/ApiContext";

function Home() {
  const navigate = useNavigate();
  const [searchbar, setSearchbar] = useState(false);
  const { favoritesCount, user, searchRecipes, recipes, getUserRecipes } =
    useContext(ApiContext);
  const [searchMode, setSearchMode] = useState("name"); // "name" or "ingredients"
  const [activeTab, setActiveTab] = useState("all"); // "all" or "my"
  const [myRecipes, setMyRecipes] = useState([]);
  const [loadingMyRecipes, setLoadingMyRecipes] = useState(false);

  const INITIAL_FILTERS = {
    searchText: "",
    mealType: "",
    foodPreference: "",
  };

  

  const [filters, setFilters] = useState({
    searchText: "",
    mealType: "",
    foodPreference: "",
  });

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 12;

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
      setSearchbar(false); // Close search page after search

      //  reset after search
      setFilters(INITIAL_FILTERS);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
  const allDisplayRecipes =
    searchResults.length > 0
      ? searchResults
      : activeTab === "my"
      ? myRecipes
      : recipes;

  // Pagination logic
  const totalPages = Math.ceil(allDisplayRecipes.length / recipesPerPage);
  const startIndex = (currentPage - 1) * recipesPerPage;
  const endIndex = startIndex + recipesPerPage;
  const displayRecipes = allDisplayRecipes.slice(startIndex, endIndex);

  // Reset to page 1 when switching tabs or search results change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchResults.length]);

  return (
    <div className="w-full righteous-regular bg-gradient-to-b from-[#0a0a0a] via-[#181818] to-[#0a0a0a] min-h-screen">
      <div className="flex flex-col  w-full  mx-auto justify-center items-center min-h-screen text-white space-y-3 ">
        <header className="w-full sticky top-0 z-40 backdrop-blur-md bg-[#0a0a0a]/80 border-b border-purple-900/30 shadow-lg  px-2  py-4">
          <nav className="flex justify-between items-center py-2 px-2  md:px-8 mb-4 gap-2 md:gap-4 lg:gap-4">
            <Link
              to="/recipes"
              className="flex items-center justify-start gap-2 text-xl md:text-3xl font-bold text-[#A100FF] cursor-pointer hover:text-purple-400 transition-all ease-in-out duration-300"
            >
              {/* Logo Icon */}
              {/* <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-8 h-8 md:w-10 md:h-10 text-[#A100FF]" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg> */}
              <div
                className="
                    w-10 h-10
                    rounded-full
                    border-2 border-purple-600
                    flex items-center justify-center
                    overflow-hidden
                    transition-all duration-300 ease-out
                    hover:scale-110
                    hover:border-purple-400
                    hover:shadow-[0_0_12px_rgba(168,85,247,0.6)]
                    cursor-pointer
                  "
              >
                <img
                  src="/recipelogo.webp"
                  alt="Recipe Logo"
                  className="w-full h-full object-cover"
                ></img>
              </div>
              <span
                className="  transition-all duration-300 ease-out
                    hover:scale-110
                    hover:border-purple-400 bg-gradient-to-r from-[#A100FF] via-purple-400 to-pink-400 bg-clip-text text-transparent"
              >
                Recipe<span className="text-[#A100FF]">&lt;</span>Hub
              </span>
            </Link>
            <div className="flex items-center justify-center gap-2 md:gap-4">
              <Link
                to={user ? "/recipes/new" : "/login"}
                className="flex items-center gap-1 md:gap-2 bg-gradient-to-r from-[#A100FF] to-purple-600 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 md:py-2.5 px-2 md:px-5 rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all ease-in-out duration-300 hover:scale-105 cursor-pointer"
                title={user ? "Add Recipe" : "Login to add recipes"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="hidden md:inline">Add Recipe</span>
              </Link>
              {/* Week Plans - Always visible, redirects to login if not authenticated */}
              <Link
                to={user ? "/weekplans" : "/login"}
                className="flex items-center gap-1 md:gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 md:py-2.5 px-2 md:px-5 rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all ease-in-out duration-300 hover:scale-105 whitespace-nowrap cursor-pointer"
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
                <span className="hidden md:inline">Week Plans</span>
              </Link>
              {!user && (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-1 md:gap-2 bg-gradient-to-r from-[#A100FF] to-purple-600 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 md:py-2.5 px-2 md:px-5 rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all ease-in-out duration-300 hover:scale-105 cursor-pointer"
                    title="Login"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                      />
                    </svg>
                    <span className="hidden md:inline">Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-1 md:gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 md:py-2.5 px-2 md:px-5 rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all ease-in-out duration-300 hover:scale-105 cursor-pointer"
                    title="Register"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                      />
                    </svg>
                    <span className="hidden md:inline">Register</span>
                  </Link>
                </>
              )}
              <div className="flex justify-center items-center relative  md:gap-4">
                <Link
                  to={user ? "/favorites" : "/login"}
                  className="relative p-2 rounded-lg hover:bg-purple-900/30 transition-all ease-in-out duration-300 group cursor-pointer"
                  title="Favorites"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6 text-gray-300 group-hover:text-purple-400 transition-all duration-300"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9"
                    />
                  </svg>
                  {favoritesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#A100FF] to-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                      {favoritesCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => {
                    if (!user) {
                      navigate("/login");
                      return;
                    }
                    setSearchbar((prev) => !prev);
                  }}
                  className="p-2 rounded-lg hover:bg-purple-900/30 transition-all ease-in-out duration-300 group cursor-pointer"
                  title="Toggle Search"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6 text-gray-300 group-hover:text-purple-400 transition-all duration-300"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z"
                    />
                  </svg>
                </button>

                {user && (
                  <Link
                    to={`/profile/${user._id}`}
                    className="flex flex-col items-center group"
                    title="My Profile"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#A100FF] to-pink-600 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="relative w-10 h-10 rounded-full object-cover border-2 border-[#A100FF] group-hover:border-purple-400 transition-all duration-300 group-hover:scale-110"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextElementSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={`relative w-10 h-10 rounded-full border-2 border-[#A100FF] group-hover:border-purple-400 transition-all duration-300 group-hover:scale-110 bg-[#1a1a2e] flex items-center justify-center ${
                          user.avatar ? "hidden" : ""
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-6 h-6 text-purple-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    </div>
                    <span className="text-xs text-gray-300 mt-1 max-w-[60px] truncate group-hover:text-purple-400 transition-colors duration-300">
                      {user.username}
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </nav>
        </header>

        <section className="relative flex flex-col items-center px-4 text-center py-12 md:py-16 overflow-hidden ">
          {/* Animated Background Gradient with particles effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(161,0,255,0.1),transparent_50%)] animate-pulse"></div>

          {/* Animated Welcome Text with typing/printing animation */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 relative z-10">
            <span className="inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] animate-typing drop-shadow-2xl">
              Welcome to Recipe Hub!!
            </span>
          </h1>

          {/* Helper Stanza with individual line animations */}
          <div className="text-base md:text-lg lg:text-xl mb-10 text-center max-w-3xl text-gray-300 leading-relaxed relative z-10 space-y-3">
            <p className="block animate-text-fade-in-1 transform md:hover:scale-105 transition-transform duration-300">
              🍳 Discover culinary treasures from every corner of the globe
            </p>
            <p className="block animate-text-fade-in-2 transform md:hover:scale-105 transition-transform duration-300">
              👨‍🍳 Share your kitchen masterpieces with a vibrant community
            </p>
            <p className="block animate-text-fade-in-3 transform md:hover:scale-105 transition-transform duration-300">
              ✨ Plan your meals, create shopping lists, and transform your
              cooking journey
            </p>
          </div>

          {/* Modern Hero Image - Matches Featured Recipes Container Width */}
          <div className="w-full max-w-6xl mx-auto px-2 sm:px-4">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer w-full border-2 border-purple-900/30">
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
              {/* Image with zoom-in on hover */}
              <div className="overflow-hidden h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]">
                <img
                  src="/hero-image.jpg"
                  alt="Delicious Food Collection"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";
                  }}
                />
              </div>
              {/* Floating badge */}
              <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-sm px-4 py-2 rounded-full text-white font-semibold text-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                🎉 Explore Recipes
              </div>
            </div>
          </div>
        </section>
        {/* Full Page Search Interface */}
        {searchbar && (
          <div className="fixed inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#181818] to-[#0a0a0a] z-50 overflow-y-auto">
            <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
              {/* Close Button */}
              <button
                className="absolute top-6 right-6 bg-[#A100FF] hover:bg-purple-700 text-white p-3 rounded-full transition-all ease-in-out duration-300 hover:scale-110 shadow-lg z-10 cursor-pointer"
                onClick={() => {
                  setSearchbar(false);
                  setFilters(INITIAL_FILTERS);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
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

              <div className="w-full max-w-5xl">
                {/* Search Title */}
                <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Search Recipes
                </h2>
                <p className="text-gray-400 text-center mb-8 text-lg">
                  Find your perfect recipe
                </p>

                {/* Search Mode Toggle */}
                <div className="mb-8 flex flex-col items-center">
                  <div className="flex items-center gap-3 bg-[#0f0f1a] rounded-full p-1 border border-purple-900/40">
                    <button
                      onClick={() => setSearchMode("name")}
                      className={`px-8 py-3 rounded-full font-semibold transition-all ease-in-out duration-300 cursor-pointer ${
                        searchMode === "name"
                          ? "bg-purple-600 text-white shadow-lg"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Recipe Name
                    </button>
                    <button
                      onClick={() => setSearchMode("ingredients")}
                      className={`px-8 py-3 rounded-full font-semibold transition-all ease-in-out duration-300 cursor-pointer ${
                        searchMode === "ingredients"
                          ? "bg-purple-600 text-white shadow-lg"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Ingredients
                    </button>
                  </div>
                  <p className="text-gray-400 text-base mt-4 text-center">
                    {searchMode === "name"
                      ? "Search by recipe name (e.g., biryani, pasta)"
                      : "Search by ingredients you have (e.g., paneer, tomato, onion)"}
                  </p>
                </div>

                {/* Search Form */}
                <div className="bg-[#1a1a2e] border border-purple-900/40 rounded-2xl p-8 shadow-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Search Input */}
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
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleSearch();
                          }
                        }}
                        autoFocus
                        className="w-full py-4 px-5 pl-14 rounded-xl bg-[#0f0f1a] text-white placeholder-gray-400 text-lg focus:outline-none focus:ring-2 focus:ring-purple-600 border border-purple-900/40"
                      />
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-purple-400 text-xl">
                        🔍
                      </span>
                    </div>

                    {/* Meal type */}
                    <select
                      value={filters.mealType}
                      onChange={(e) =>
                        setFilters({ ...filters, mealType: e.target.value })
                      }
                      className="w-full py-4 px-5 rounded-xl bg-[#0f0f1a] text-white text-lg border border-purple-900/40 focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="">All Meals</option>
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Food preference */}
                    <select
                      value={filters.foodPreference}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          foodPreference: e.target.value,
                        })
                      }
                      className="w-full py-4 px-5 rounded-xl bg-[#0f0f1a] text-white text-lg border border-purple-900/40 focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="">All Preferences</option>
                      <option value="Veg">Veg</option>
                      <option value="Non-Veg">Non-Veg</option>
                    </select>

                    {/* Search Button */}
                    <button
                      onClick={handleSearch}
                      disabled={loading}
                      className="w-full py-4 px-6 rounded-xl font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all ease-in-out duration-300 hover:scale-[1.02] text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? "Searching..." : "Search Recipes"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="w-full">
          <section className="mt-8 md:mt-12 w-full p-8">
            <div className="flex flex-col items-center gap-6 mb-8">
              {/* Enhanced Tab Switcher */}
              <div className="flex gap-2 bg-[#1a1a2e] rounded-xl p-1.5 border border-purple-900/40 shadow-lg">
                <button
                  onClick={() => {
                    setActiveTab("all");
                    setSearchResults([]);
                  }}
                  className={`px-6 py-2.5 rounded-lg font-semibold transition-all ease-in-out duration-300 relative cursor-pointer ${
                    activeTab === "all"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50 scale-105"
                      : "text-gray-400 hover:text-white hover:bg-purple-900/20"
                  }`}
                >
                  All Recipes
                  {activeTab === "all" && (
                    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></span>
                  )}
                </button>
                {user && (
                  <button
                    onClick={() => {
                      setActiveTab("my");
                      setSearchResults([]);
                    }}
                    className={`px-6 py-2.5 rounded-lg font-semibold transition-all ease-in-out duration-300 relative cursor-pointer ${
                      activeTab === "my"
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50 scale-105"
                        : "text-gray-400 hover:text-white hover:bg-purple-900/20"
                    }`}
                  >
                    My Recipes
                    {activeTab === "my" && (
                      <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></span>
                    )}
                  </button>
                )}
              </div>

              {/* Enhanced Section Title */}
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  {activeTab === "my" ? "My Recipes" : "Featured Recipes"}
                </h2>
                <p className="text-gray-400 text-sm md:text-base">
                  {activeTab === "my"
                    ? "Recipes you've created and shared"
                    : "Discover amazing recipes from our community"}
                </p>
              </div>
            </div>
            {loadingMyRecipes ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mb-4"></div>
                <p className="text-gray-400 text-lg">Loading your recipes...</p>
                <div className="mt-4 flex justify-center gap-2">
                  <div
                    className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-pink-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            ) : displayRecipes.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-block p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-full mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-16 h-16 text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-300 mb-2">
                  {activeTab === "my" ? "No Recipes Yet" : "No Recipes Found"}
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  {activeTab === "my"
                    ? "Start sharing your culinary creations with the community!"
                    : searchResults.length > 0
                    ? "Try adjusting your search filters"
                    : "Be the first to add a recipe!"}
                </p>
                {activeTab === "my" && user && (
                  <Link
                    to="/recipes/new"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#A100FF] to-purple-600 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create Your First Recipe
                  </Link>
                )}
              </div>
            ) : (
              <>
                <RecipeCard recipes={displayRecipes} />

                {/* Pagination - Netflix Style */}
                {allDisplayRecipes.length > recipesPerPage && (
                  <div className="flex justify-center items-center gap-4 mt-8 mb-4">
                    {/* Previous Button */}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="flex items-center justify-center w-10 h-10 bg-[#1a1a2e] hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-white transition-all ease-in-out duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#1a1a2e] cursor-pointer"
                      aria-label="Previous page"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    {/* Page Indicator - Netflix Style */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] border border-purple-500/30 rounded-lg">
                      <span className="text-white font-semibold">
                        {currentPage}
                      </span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-400">{totalPages}</span>
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="flex items-center justify-center w-10 h-10 bg-[#1a1a2e] hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-white transition-all ease-in-out duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#1a1a2e] cursor-pointer"
                      aria-label="Next page"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Enhanced Page info */}
                {allDisplayRecipes.length > 0 && (
                  <div className="text-center mt-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] border border-purple-900/40 rounded-lg">
                      <span className="text-gray-300 text-sm">
                        Showing{" "}
                        <span className="text-purple-400 font-semibold">
                          {startIndex + 1}
                        </span>{" "}
                        -{" "}
                        <span className="text-purple-400 font-semibold">
                          {Math.min(endIndex, allDisplayRecipes.length)}
                        </span>{" "}
                        of{" "}
                        <span className="text-pink-400 font-semibold">
                          {allDisplayRecipes.length}
                        </span>{" "}
                        recipes
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
export default Home;
