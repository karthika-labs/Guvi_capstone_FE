import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ApiContext from "./context/ApiContext";
import FollowButton from "./FollowButton";
import ConfirmModal from "./ConfirmModal";
import {
  FaStar,
  FaRegStar,
  FaUserCircle,
  FaShareAlt,
  FaWhatsapp,
  FaTwitter,
  FaFacebook,
  FaCopy,
  FaEllipsisH,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

const RecipePage = () => {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const {
    getRecipeById,
    deleteRecipe,
    postRating,
    updateRating,
    postComment,
    updateComment,
    deleteComment,
    user,
  } = useContext(ApiContext);

  const [recipe, setRecipe] = useState({
    ratings: [],
    comments: [],
    ingredients: [],
    images: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [userRating, setUserRating] = useState(0);
  const [existingRatingId, setExistingRatingId] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [shareMessage, setShareMessage] = useState("");
  const [showGalleryModal, setShowGalleryModal] = useState(false); // New state for gallery modal
  const [modalImageIndex, setModalImageIndex] = useState(0); // New state for image in gallery modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // comment delete
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null);

  const fetchRecipe = async (isUpdate = false) => {
    if (!isUpdate) setIsLoading(true);
    try {
      const recipeData = await getRecipeById(recipeId);

      setRecipe({
        ratings: Array.isArray(recipeData?.ratings) ? recipeData.ratings : [],
        comments: Array.isArray(recipeData?.comments)
          ? recipeData.comments
          : [],
        ingredients: Array.isArray(recipeData?.ingredients)
          ? recipeData.ingredients
          : [],
        photoUrl: Array.isArray(recipeData?.photoUrl)
          ? recipeData.photoUrl
          : [],
        ...recipeData,
      });

      // Check for user's existing rating - only if user is available
      if (user) {
        const safeRatings = Array.isArray(recipeData?.ratings)
          ? recipeData.ratings
          : [];

        const existingRating = safeRatings.find(
          (r) => String(r.userId?._id || r.userId) === String(user?._id)
        );

        if (existingRating) {
          setUserRating(existingRating.value);
          setExistingRatingId(existingRating._id);
        } else {
          setUserRating(0);
          setExistingRatingId(null);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to fetch recipe");
    } finally {
      if (!isUpdate) setIsLoading(false);
    }
  };

  // Separate effect to update user rating when user becomes available or recipe changes
  useEffect(() => {
    if (user && recipe.ratings && recipe.ratings.length > 0) {
      const existingRating = recipe.ratings.find(
        (r) => String(r.userId?._id || r.userId) === String(user._id)
      );

      if (existingRating) {
        setUserRating(existingRating.value);
        setExistingRatingId(existingRating._id);
      } else {
        setUserRating(0);
        setExistingRatingId(null);
      }
    }
  }, [user, recipe.ratings]);

  useEffect(() => {
    if (recipeId) {
      fetchRecipe(false);
    }
  }, [recipeId]);

  const handleRatingSubmit = async (ratingValue) => {
    if (!user || isSubmitting) {
      if (!user) alert("Please log in to rate recipes.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingRatingId) {
        await updateRating(recipeId, existingRatingId, ratingValue);
      } else {
        await postRating(recipeId, ratingValue);
      }
      await fetchRecipe(true);
    } catch (err) {
      console.error("Failed to submit rating:", err);
      // alert("Failed to submit your rating. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user || isSubmitting) {
      if (!user) alert("Please log in to comment.");
      return;
    }
    if (!commentText.trim()) {
      alert("Comment cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      await postComment(recipeId, { text: commentText });
      setCommentText("");
      await fetchRecipe(true);
    } catch (err) {
      console.error("Failed to submit comment:", err);
      alert("Failed to submit your comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditingCommentText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingCommentText.trim()) {
      alert("Comment cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateComment(commentId, editingCommentText);
      setEditingCommentId(null);
      setEditingCommentText("");
      await fetchRecipe(true);
    } catch (err) {
      console.error("Failed to update comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteCommentModal = (commentId) => {
    setSelectedCommentId(commentId);
    setShowDeleteCommentModal(true);
  };

  const handleDeleteComment = async () => {
    setShowDeleteCommentModal(false);
    setIsSubmitting(true);

    try {
      await deleteComment(selectedCommentId);
      await fetchRecipe(true);
    } catch (err) {
      console.error("Failed to delete comment:", err);
    } finally {
      setIsSubmitting(false);
      setSelectedCommentId(null);
    }
  };

  const handleDeleteRecipe = async () => {
    setShowDeleteModal(false);
    setIsSubmitting(true);
    try {
      await deleteRecipe(recipeId);
      navigate("/recipes");
    } catch (err) {
      console.error("Failed to delete recipe:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRecipe = () => {
    navigate(`/recipes/${recipeId}/edit`);
  };

  // Check if current user is the recipe owner
  const isRecipeOwner =
    user && recipe.userId && String(user._id) === String(recipe.userId._id);

  // This function will now simply open the share modal.
  const handleShare = () => {
    setShowShareModal(true);
  };

  // Use native Web Share API if available
  const handleNativeShare = useCallback(async () => {
    const currentRecipeTitle = recipe.recipeName || "a delicious recipe"; // Fallback title
    const shareData = {
      title: `Check out this recipe: ${currentRecipeTitle}`,
      text: `Check out this recipe: ${currentRecipeTitle}`,
      url: window.location.href,
    };
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== "AbortError") {
          // User cancelled share
          console.error("Error sharing:", err);
          alert("Failed to share. Please try again.");
        }
      }
    } else {
      alert(
        "Web Share API is not supported in your browser. You can copy the link instead."
      );
    }
  }, [recipe.recipeName]); // Dependency on recipe.recipeName ensures it's available

  const copyToClipboard = () => {
    const url = window.location.href;

    const shareText = url;
    navigator.clipboard.writeText(shareText).then(
      () => {
        setShareMessage("Link copied to clipboard!");
        setTimeout(() => {
          setShareMessage("");
          setShowShareModal(false);
        }, 2000);
      },
      () => {
        setShareMessage("Failed to copy link.");
        setTimeout(() => setShareMessage(""), 2000);
      }
    );
  };

  // Function to open the full-screen image gallery modal
  const openGalleryModal = (index) => {
    setModalImageIndex(index);
    setShowGalleryModal(true);
  };

  // Functions for navigating images within the full-screen modal
  const handleModalNextImage = (e) => {
    e.stopPropagation(); // Prevent closing modal when clicking next/prev
    setModalImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handleModalPrevImage = (e) => {
    e.stopPropagation(); // Prevent closing modal when clicking next/prev
    setModalImageIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  const ratings = Array.isArray(recipe.ratings) ? recipe.ratings : [];
  const averageRating =
    ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length).toFixed(
          1
        )
      : "0.0";

  if (isLoading) {
    return (
      <div className= "righteous-regular fixed inset-0 bg-black/70 flex flex-col justify-center items-center z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
        <p className="mt-4 text-purple-400 text-lg font-semibold">
          loading... Please wait
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black righteous-regular text-white min-h-screen flex justify-center items-center">
        Error: {error}
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="bg-black righteous-regular text-white min-h-screen flex justify-center items-center">
        Recipe not found.
      </div>
    );
  }

  const videoUrl = recipe.videoUrl || "";
  const images = recipe.photoUrl || [];

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };
  const prevImage = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  return (
    <div className="min-h-screen bg-black righteous-regular w-full  text-white font-sans">
      {/* --- Top Half: Media --- */}
      <div className="relative w-full h-[50vh] bg-gray-900 ">
        <div className="absolute  inset-0 flex justify-center items-center  mt-8 ">
          {videoUrl ? (
            <div className="w-full h-full aspect-video ">
              <iframe
                src={`${
                  videoUrl.includes("embed")
                    ? videoUrl
                    : videoUrl.replace("watch?v=", "embed/")
                }?autoplay=0&controls=1&modestbranding=1&rel=0`}
                className="w-full h-full "
                frameBorder="0"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={recipe.recipeName}
              ></iframe>
            </div>
          ) : images.length > 0 ? (
            <div className="relative w-full h-full">
              <img
                src={images[currentImageIndex]}
                alt={recipe.recipeName}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 z-10"
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 z-10"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center text-gray-500">
              No Video or Image Available
            </div>
          )}
        </div>

        <div className="absolute top-4 left-4 z-20">
          <Link
            to="/recipes"
            className="flex cursor-pointer items-center px-4 py-2 bg-gray-800 bg-opacity-75 rounded-full text-white hover:bg-gray-700 hover:text-purple-400 transition duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Back to Recipes
          </Link>
        </div>

        <div className="absolute top-4 right-4 z-20 flex gap-2">
          {isRecipeOwner && (
            <>
              <button
                onClick={handleEditRecipe}
                className=" cursor-pointer flex items-center px-4 py-2 bg-blue-600 bg-opacity-75 rounded-full text-white hover:bg-blue-700 transition duration-300"
                title="Edit Recipe"
              >
                <FaEdit className="mr-2" />
                Edit
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex cursor-pointer items-center px-4 py-2 bg-red-600 bg-opacity-75 rounded-full text-white hover:bg-red-700 transition duration-300"
                title="Delete Recipe"
              >
                <FaTrash className="mr-2" />
                Delete
              </button>
            </>
          )}
          <button
            onClick={handleShare}
            className="flex cursor-pointer items-center px-4 py-2 bg-gray-800 bg-opacity-75 rounded-full text-white hover:bg-gray-700 hover:text-purple-400 transition duration-300"
          >
            <FaShareAlt className="mr-2" />
            Share
          </button>
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
              <h3 className="text-xl font-bold mb-4">Share this Recipe</h3>
              <div className="flex justify-center space-x-4 mb-6 text-4xl items-center flex-wrap">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Check out this recipe: ${
                      recipe.recipeName || "a delicious recipe"
                    }`
                  )}%20${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-500 hover:text-green-400 transform hover:scale-110 transition-transform"
                >
                  <FaWhatsapp />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                    window.location.href
                  )}&text=${encodeURIComponent(
                    `Check out this recipe: ${
                      recipe.recipeName || "a delicious recipe"
                    }`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transform hover:scale-110 transition-transform"
                >
                  <FaTwitter />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    window.location.href
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-500 transform hover:scale-110 transition-transform"
                >
                  <FaFacebook />
                </a>
                {/* Native Share Button */}
                {navigator.share && (
                  <button
                    onClick={handleNativeShare}
                    title="More options"
                    className="text-gray-400 hover:text-white transform hover:scale-110 transition-transform"
                  >
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                      <FaEllipsisH />
                    </div>
                  </button>
                )}
              </div>
              <div className="relative mb-4">
                <input
                  type="text"
                  readOnly
                  value={window.location.href}
                  className="w-full bg-gray-700 text-white rounded-lg p-2 pr-10"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <FaCopy />
                </button>
              </div>
              {shareMessage && (
                <p className="text-green-400 mt-2 text-sm">{shareMessage}</p>
              )}
              <button
                onClick={() => setShowShareModal(false)}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 w-full"
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

      {/* --- Bottom Half: Content --- */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-white">
            {recipe.recipeName}
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            {recipe.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            {videoUrl && images.length > 0 && (
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-6 border-b-2 border-red-600 inline-block pb-2">
                  Photo Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map(
                    (
                      img,
                      index // Make gallery images clickable
                    ) => (
                      <div
                        key={index}
                        className="aspect-w-16 aspect-h-9 cursor-pointer"
                        onClick={() => openGalleryModal(index)}
                      >
                        <img
                          src={img}
                          alt={`${recipe.recipeName} photo ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <h2 className="text-3xl font-bold mb-6 border-b-2 border-red-600 inline-block pb-2">
              Ingredients
            </h2>
            <ul className="list-none p-0 mb-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recipe.ingredients?.map((ing, index) => (
                <li
                  key={index}
                  className="bg-gray-900 p-4 rounded-lg border-l-4 border-red-600"
                >
                  {ing.quantity} {ing.unit} {ing.name}
                </li>
              ))}
            </ul>

            <h2 className="text-3xl font-bold mb-6 border-b-2 border-red-600 inline-block pb-2">
              Instructions
            </h2>
            <div
              className="prose prose-invert max-w-none text-gray-300 whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: recipe.instructions }}
            ></div>
          </div>

          <div className="lg:col-span-1 space-y-8">
            {/* User Details Section */}
            {recipe.userId && (
              <div className="bg-gray-900 p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-4">Recipe Creator</h3>
                <div className="flex items-center gap-4">
                  <Link to={`/profile/${recipe.userId._id}`}>
                    {recipe.userId.avatar ? (
                      <img
                        src={recipe.userId.avatar}
                        alt={recipe.userId.username || "User"}
                        className="w-16 h-16 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-purple-500 transition"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextElementSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-16 h-16 rounded-full border-2 border-purple-500/50 bg-[#1a1a2e] flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-purple-500 transition ${
                        recipe.userId.avatar ? "hidden" : ""
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-10 h-10 text-purple-400"
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
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link
                        to={`/profile/${recipe.userId._id}`}
                        className="hover:text-purple-400 transition"
                      >
                        <p className="font-bold text-lg text-white">
                          {recipe.userId.username || "Unknown User"}
                        </p>
                      </Link>
                      <FollowButton
                        userId={recipe.userId._id}
                        username={recipe.userId.username || recipe.userId.name}
                      />
                    </div>
                    {recipe.userId.name && (
                      <p className="text-gray-400 text-sm mt-1">
                        {recipe.userId.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-900 p-6 rounded-lg ">
              <h3 className="text-2xl font-bold mb-4">Rate this Recipe</h3>
              <div className="flex items-center text-2xl mb-4">
                <FaStar className="text-yellow-400 mr-2" />
                <span className="font-bold">{averageRating}</span>
                <span className="text-gray-400 text-base ml-1">
                  / 5 ({ratings.length} reviews)
                </span>
              </div>
              <div className="flex text-4xl text-gray-600">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`cursor-pointer transition-transform duration-200 hover:scale-125 ${
                      isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onMouseEnter={() => !isSubmitting && setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => !isSubmitting && handleRatingSubmit(star)}
                  >
                    {star <= (hoverRating || userRating) ? (
                      <FaStar className="text-yellow-400" />
                    ) : (
                      <FaRegStar />
                    )}
                  </span>
                ))}
              </div>
              {userRating > 0 && (
                <p className="text-green-400 mt-3">
                  You rated this {userRating} star(s).
                </p>
              )}
              {!user && (
                <p className="text-gray-400 mt-4">
                  Please{" "}
                  <Link to="/login" className="text-red-500 hover:underline">
                    log in
                  </Link>{" "}
                  to rate.
                </p>
              )}
            </div>

            <div className="bg-gray-900 p-6 rounded-lg ">
              <h3 className="text-2xl font-bold mb-4">Comments</h3>
              {user ? (
                <form onSubmit={handleCommentSubmit} className="flex flex-col">
                  <textarea
                    className="w-full bg-gray-800 text-white p-3 rounded-lg focus:ring-2 focus:ring-red-500 transition mb-3 disabled:opacity-50"
                    rows="3"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a public comment..."
                    disabled={isSubmitting}
                  ></textarea>
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg self-end disabled:bg-gray-500 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Comment"}
                  </button>
                </form>
              ) : (
                <p className="text-gray-400">
                  <Link to="/login" className="text-red-500 hover:underline">
                    Log in
                  </Link>{" "}
                  to post a comment.
                </p>
              )}
              <div className="space-y-4 mt-6 max-h-96 overflow-y-auto pr-2 overflow-y-scroll no-scrollbar">
                {recipe.comments && recipe.comments.length > 0 ? (
                  [...recipe.comments].reverse().map((comment) => {
                    const isCommentOwner =
                      user &&
                      String(comment.userId?._id || comment.userId) ===
                        String(user._id);
                    const isEditing = editingCommentId === comment._id;

                    return (
                      <div
                        key={comment._id}
                        className="bg-gray-800 p-4 rounded-lg"
                      >
                        <div className="flex items-start space-x-3">
                          {comment.userId?.avatar ||
                          comment.userId?.avatarUrl ? (
                            <img
                              src={
                                comment.userId.avatar ||
                                comment.userId.avatarUrl
                              }
                              alt={
                                comment.userId?.name ||
                                comment.userId?.username ||
                                "User"
                              }
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextElementSibling.style.display =
                                  "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-10 h-10 rounded-full border border-purple-500/50 bg-[#1a1a2e] flex items-center justify-center ${
                              comment.userId?.avatar ||
                              comment.userId?.avatarUrl
                                ? "hidden"
                                : ""
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
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <p className="font-bold text-white mr-2">
                                  {comment.userId?.name || "Anonymous"}
                                </p>
                                {(() => {
                                  const userSpecificRating = ratings.find(
                                    (r) =>
                                      String(r.userId?._id || r.userId) ===
                                      String(comment.userId?._id)
                                  );
                                  if (userSpecificRating) {
                                    return (
                                      <div className="flex text-yellow-400 text-sm">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <FaStar
                                            key={star}
                                            className={
                                              star <= userSpecificRating.value
                                                ? "text-yellow-400"
                                                : "text-gray-600"
                                            }
                                          />
                                        ))}
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-gray-400">
                                  {new Date(
                                    comment.createdAt
                                  ).toLocaleDateString()}
                                </p>
                                {isCommentOwner && !isEditing && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEditComment(comment)}
                                      className="text-s text-blue-400 hover:text-blue-300 transition  cursor-pointer hover:bg-blue-400/20 px-2 py-1 rounded"
                                      disabled={isSubmitting}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() =>
                                        openDeleteCommentModal(comment._id)
                                      }
                                      className="text-red-500 hover:text-red-300 text-s cursor-pointer  transition hover:bg-red-400/20 px-2 py-1 rounded"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            {isEditing ? (
                              <div className="mt-2">
                                <textarea
                                  value={editingCommentText}
                                  onChange={(e) =>
                                    setEditingCommentText(e.target.value)
                                  }
                                  className="w-full bg-gray-700 text-white p-2 rounded-lg focus:ring-2 focus:ring-red-500 transition mb-2"
                                  rows="2"
                                  disabled={isSubmitting}
                                />
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={handleCancelEdit}
                                    className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 rounded text-white transition"
                                    disabled={isSubmitting}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleUpdateComment(comment._id)
                                    }
                                    className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded text-white transition disabled:bg-gray-500"
                                    disabled={isSubmitting}
                                  >
                                    {isSubmitting ? "Saving..." : "Save"}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-300 mt-1">
                                {comment.text}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500">No comments yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen Image Gallery Modal */}
      {showGalleryModal && images.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50"
          onClick={() => setShowGalleryModal(false)} // Close on overlay click
        >
          <div
            className="relative w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowGalleryModal(false)}
              className="absolute cursor-pointer  transition-all duration-300 ease-out
    hover:scale-110
    hover:border-purple-400
    hover:text-purple-400
    hover:shadow-[0_0_12px_rgba(168,85,247,0.6)] top-4 right-4 text-white text-5xl z-50 hover:bg-gray-800 rounded-full flex items-center justify-center p-2 bg-gray-700"
            >
              &times;
            </button>
            {/* Full-screen Image */}
            <img
              src={images[modalImageIndex]}
              alt={`${recipe.recipeName} - Full Screen`}
              className="max-w-[95vw] max-h-[95vh] w-auto h-auto object-contain"
            />
            {/* Navigation Buttons (if more than one image) */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handleModalPrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 z-10 text-2xl"
                >
                  ‹
                </button>
                <button
                  onClick={handleModalNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 z-10 text-2xl"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Recipe Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteRecipe}
        title="Delete Recipe"
        message={`Are you sure you want to delete "${recipe.recipeName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="bg-red-600 hover:bg-red-700"
      />

      {/*  comment Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteCommentModal}
        onClose={() => setShowDeleteCommentModal(false)}
        onConfirm={handleDeleteComment}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};

export default RecipePage;
