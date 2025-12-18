import { useState, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import axios from "axios";
import ApiContext from "./context/ApiContext";
import { FaShareAlt, FaWhatsapp, FaTwitter, FaFacebook, FaCopy, FaEllipsisH } from "react-icons/fa";

// Helper functions
const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

const getRatingColor = (rating) =>
  rating >= 4
    ? "text-green-400"
    : rating >= 3
    ? "text-yellow-400"
    : "text-red-500";

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

  

  const handleFavorite =  () => toggleFavorite(recipe._id);

  const handleLike = async () => {
    try {
      const alreadyLiked = recipe.likes?.includes(user._id);
      setShowHeart(!alreadyLiked ? recipe._id : null);

      if (alreadyLiked) {
        await axios.delete(`http://localhost:5001/recipes/${recipe._id}/like`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else {
        await axios.post(
          `http://localhost:5001/recipes/${recipe._id}/like`,
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

 if (!recipe || !recipe._id ||!user) return null;

  return (
    <div className="rounded-lg border border-[#2d2d2d] bg-[#1a1a1a] shadow-lg overflow-hidden flex flex-col">
      {/* IMAGE */}
      <div className="relative w-full">
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
          <span className="absolute z-50 top-2 right-2 bg-black/70 text-[#A100FF] text-xs px-2 py-1 rounded">
            {recipe.photoUrl.length} photos
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col gap-3 flex-grow">
        <div className="flex gap-3 justify-between items-center mb-2">
          <div className="flex items-center gap-3 sm:flex-col md:flex-col lg:flex-row flex-col">
            <img
              src={recipe.avatar || "https://i.pravatar.cc/50"}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="text-gray-300 text-xs">
              <p>{recipe.userId.userName || "Unknown User"}</p>
              <p className="text-gray-500">{formatDate(recipe.createdAt)}</p>
            </div>
          </div>

          <div className="relative">
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
              recipe.averageRating
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
            {recipe.averageRating?.toFixed(1) || "0.0"}
          </span>

          {/* share icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-6 w-6 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
