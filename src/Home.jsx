import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import RecipeCard from "./RecipeCard";
import ApiContext from "./context/ApiContext";

function Home() {
  const [searchbar, setSearchbar] = useState(false);
  const { favoritesCount, user } = useContext(ApiContext);
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
                <Link>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6 ml-6 cursor-pointer hover:text-purple-500 transition-all "
                    onClick={() => setSearchbar(!searchbar)}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z"
                    />
                  </svg>
                </Link>
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
