import { useState, useContext, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import axios from "axios";
import ApiContext from "./context/ApiContext";
import API_BASE_URL from "./config/api";
import FollowButton from "./FollowButton";
import {
  FaShareAlt,
  FaWhatsapp,
  FaTwitter,
  FaFacebook,
  FaCopy,
  FaEllipsisH,
} from "react-icons/fa";

// Helper functions
const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

const getRatingColor = (rating) => {
  const numRating = parseFloat(rating) || 0;
  if (numRating < 2) {
    return "text-red-500"; // Below 3: Red
  } else if (numRating >= 3 || numRating < 4) {
    return "text-yellow-400"; // Equal to or above 3 and below 4: Yellow
  } else if (numRating >= 4 || numRating <= 5) {
    return "text-green-400"; // Equal to or above 4 and below/equal to 5: Green
  }
  return "text-gray-400"; // Default fallback
};

const getFoodColor = (pref) =>
  !pref
    ? "border-gray-500 text-gray-300"
    : pref.toLowerCase() === "veg"
    ? "border-green-500 text-green-400"
    : "border-red-500 text-red-400";

export default function Card({ recipe }) {
  const { user, toggleFavorite, isFavorite, getRecipe } =
    useContext(ApiContext);

  const [showHeart, setShowHeart] = useState(null);
  const favorite = isFavorite(recipe._id);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false); // New state for share modal
  const [shareMessage, setShareMessage] = useState(""); // New state for share message

  const PUBLIC_URL = window.location.origin;

  const recipeUrl = `${PUBLIC_URL}/recipe/${recipe._id}`;



  const handleFavorite = () => toggleFavorite(recipe._id);

  const handleLike = async () => {
    try {
      const alreadyLiked = recipe.likes?.includes(user._id);
      setShowHeart(!alreadyLiked ? recipe._id : null);

      if (alreadyLiked) {
        await axios.delete(`${API_BASE_URL}/recipes/${recipe._id}/like`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else {
        await axios.post(
          `${API_BASE_URL}/recipes/${recipe._id}/like`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }
      getRecipe();
    } catch (err) {
      console.log("Like error:", err.response?.data?.message);
    }
    setTimeout(() => setShowHeart(null), 600);
  };

  const handleDoubleTap = () => {
    if (!recipe.likes?.includes(user._id)) handleLike();
    setShowHeart(recipe._id);
    setTimeout(() => setShowHeart(null), 600);
  };

  // Share functionality
  const handleShare = () => {
    setShowShareModal(true);
  };

 const handleNativeShare = useCallback(async () => {
  try {
    await navigator.share({
      title: `Check out this recipe: ${recipe.recipeName}`,
      text: `Check out this recipe: ${recipe.recipeName}`,
      url: recipeUrl, // This makes it clickable everywhere
    });
  } catch (err) {
    if (err.name !== "AbortError") {
      console.error(err);
    }
  }
}, [recipe.recipeName, recipeUrl]);


const copyToClipboard = () => {
  const shareText = `Check out this recipe: ${recipe.recipeName}\n${recipeUrl}`;
  navigator.clipboard.writeText(shareText).then(() => {
    setShareMessage("Link copied to clipboard!");
    setTimeout(() => {
      setShareMessage("");
      setShowShareModal(false);
    }, 2000);
  });
};


  if (!recipe || !recipe._id || !user) return null;

  return (
    <div className="rounded-lg border border-[#2d2d2d] bg-[#1a1a1a] shadow-lg overflow-hidden w-full max-w-xs gap-2  flex flex-col">
      {/* IMAGE */}
      <div className="relative w-full  flex justify-center items-center">
        <Swiper
          modules={[Pagination, Navigation]}
          pagination={{
            type: "fraction",
            renderFraction: (currentClass, totalClass) =>
              `<span class="bg-[#A100FF]/30 rounded px-1"><span class="${currentClass} font-bold text-gray-900 dark:text-white"></span> <span class="text-gray-300">of</span> <span class="${totalClass} text-[#A100FF] font-bold"></span></span>`,
          }}
          navigation={{ nextEl: ".custom-next", prevEl: ".custom-prev" }}
          onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
          className="relative w-full h-64"
        >
          {recipe.photoUrl.map((url, idx) => (
            <SwiperSlide key={idx} onDoubleClick={handleDoubleTap}>
              <img
                src={url}
                alt=""
                className="w-full h-64 object-cover rounded-xl cursor-pointer transition duration-300 ease-in-out hover:scale-105"
              />
            </SwiperSlide>
          ))}
          <button className="custom-prev absolute left-3 top-1/2 -translate-y-1/2 text-[#A100FF] text-2xl z-50 bg-black/30 px-2 py-1 rounded-full">
            ‹
          </button>
          <button className="custom-next absolute right-3 top-1/2 -translate-y-1/2 text-[#A100FF] text-2xl z-50 bg-black/30 px-2 py-1 rounded-full">
            ›
          </button>
        </Swiper>
        {showHeart === recipe._id && (
          <div className="absolute z-50 inset-0 flex items-center justify-center animate-ping text-6xl text-white">
            ❤️
          </div>
        )}
        {recipe.photoUrl?.length >= 1 && (
          <span className="absolute z-10 top-2 right-2 bg-black/70 text-[#A100FF] text-xs px-2 py-1 rounded">
            {recipe.photoUrl.length} photos
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col gap-3 flex-grow">
        <div className="flex gap-2 items-start mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
            <Link to={`/profile/${recipe.userId?._id}`} className="flex-shrink-0">
              {recipe.userId?.avatar ? (
                <img
                  src={recipe.userId.avatar}
                  alt={recipe.userId?.username || "User"}
                  className="w-8 h-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-purple-500 transition"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-8 h-8 rounded-full border border-purple-500/50 bg-[#1a1a2e] flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-purple-500 transition ${recipe.userId?.avatar ? 'hidden' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </Link>
            <div className="text-gray-300 text-xs flex-1 min-w-0">
              <Link to={`/profile/${recipe.userId?._id}`} className="hover:text-purple-400 transition block">
                <p className="font-medium truncate">{recipe.userId?.username || "Unknown User"}</p>
              </Link>
              <p className="text-gray-500 truncate">{formatDate(recipe.createdAt)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {recipe.userId?._id && user?._id !== recipe.userId._id && (
              <div className="flex-shrink-0">
                <FollowButton 
                  userId={recipe.userId._id} 
                  username={recipe.userId.username}
                />
              </div>
            )}

            <div className="relative flex-shrink-0">
            <button
              onClick={handleLike}
              type="button"
              className={`relative rounded-lg p-2 transition-colors ${
                recipe.likes?.includes(user._id)
                  ? "border border-[#A100FF] bg-[#A100FF]/20"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <span className="sr-only ">Like</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={recipe.likes?.includes(user._id) ? "#A100FF" : "none"}
                stroke={
                  recipe.likes?.includes(user._id) ? "#A100FF" : "currentColor"
                }
                strokeWidth="2"
                className="h-6 w-6 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6C6.5 1 1 8 5.8 13l6.2 7 6.2-7C23 8 17.5 1 12 6Z"
                />
              </svg>
              {recipe.likes?.length > 0 && (
                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-[#A100FF]/50 rounded-full">
                  {recipe.likes.length}
                </span>
              )}
            </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center gap-2">
          <Link
            to={`/recipe/${recipe._id}`}
            className="text-lg font-semibold text-grey-900 hover:underline dark:text-white"
          >
            {recipe.recipeName}
          </Link>
          <span
            className={`px-2 py-1 text-xs rounded-md border ${getFoodColor(
              recipe.foodPreference
            )}`}
          >
            {recipe.foodPreference || "Food"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-gray-400 line-clamp-3">
            {recipe.description || "No description provided"}
          </p>
          <button
            onClick={handleFavorite}
            className="flex items-center gap-1 text-gray-300 hover:text-[#A100FF]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={favorite ? "#A100FF" : "none"}
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke={favorite ? "#A100FF" : "currentColor"}
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
              />
            </svg>
          </button>
        </div>

        <div className="flex justify-between items-center mt-auto pt-2">
          <span
            className={`flex items-center text-xs font-semibold ${getRatingColor(
              recipe.averageRating ?? 0
            )}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="black"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
              />
            </svg>
            {(recipe.averageRating ?? 0).toFixed(1)}
          </span>

          <button
            onClick={handleShare}
            className="flex items-center text-gray-300 hover:text-[#A100FF]"
          >
            <FaShareAlt className="h-6 w-6" />
          </button>
        </div>
      </div>
      {showShareModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-xl text-center w-11/12 max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4 text-white">
              Share this Recipe
            </h3>

            <div className="flex justify-center gap-5 mb-6 text-4xl">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Check out this recipe: ${recipe.recipeName}`
                )}%20${encodeURIComponent(recipeUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 hover:scale-110 transition"
              >
                <FaWhatsapp />
              </a>

              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(recipeUrl)}&text=${encodeURIComponent(
                  `Check out this recipe: ${recipe.recipeName}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:scale-110 transition"
              >
                <FaTwitter />
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipeUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:scale-110 transition"
              >
                <FaFacebook />
              </a>
              {/* Native Share Button */}
              {navigator.share && (
                <button
                  onClick={handleNativeShare}
                  className="text-gray-300 hover:text-white hover:scale-110 transition"
                >
                  <FaEllipsisH />
                </button>
              )}
            </div>

            <div className="relative mb-3">
              <input
                readOnly
                value={`${window.location.origin}/recipe/${recipe._id}`}
                className="w-full bg-gray-700 text-white rounded-lg p-2 pr-10 text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <FaCopy />
              </button>
            </div>

            {shareMessage && (
              <p className="text-green-400 text-sm mt-2">{shareMessage}</p>
            )}

            <button
              onClick={() => setShowShareModal(false)}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg w-full"
            >
              Close
            </button>
            <p className="text-gray-500 text-xs mt-2">
                Note: Sharing via WhatsApp may not always display the link as
                clickable depending on the device and app version.
              </p>
          </div>
        </div>
      )}
    </div>
  );
}

