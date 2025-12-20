import { useState, useContext, useEffect } from "react";
import ApiContext from "./context/ApiContext";
import ConfirmModal from "./ConfirmModal";

const FollowButton = ({ userId, username, onFollowChange }) => {
  const { user, followUser, unfollowUser, fetchUser } = useContext(ApiContext);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Check if current user is following this user
  useEffect(() => {
    if (user && userId) {
      const following = user.followings?.some((following) => {
        const followingId = typeof following === 'object' ? following._id : following;
        return followingId?.toString() === userId?.toString();
      });
      setIsFollowing(following || false);
    }
  }, [user, userId]);

  // Don't show button if viewing own profile or not logged in
  if (!user || !userId || user._id === userId) {
    return null;
  }

  const handleFollowClick = async () => {
    if (isLoading) return;

    if (isFollowing) {
      // Show rich confirmation modal
      setShowConfirmModal(true);
    } else {
      setIsLoading(true);
      try {
        await followUser(userId);
        setIsFollowing(true);
        // Refresh user data to update followings list
        await fetchUser();
        if (onFollowChange) onFollowChange(true);
      } catch (err) {
        console.error("Error following:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleConfirmUnfollow = async () => {
    setShowConfirmModal(false);
    setIsLoading(true);
    try {
      await unfollowUser(userId);
      setIsFollowing(false);
      // Refresh user data to update followings list
      await fetchUser();
      if (onFollowChange) onFollowChange(false);
    } catch (err) {
      console.error("Error unfollowing:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleFollowClick}
        disabled={isLoading}
        className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap min-w-[70px] ${
          isFollowing
            ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
            : "bg-purple-600 hover:bg-purple-700 text-white"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {isFollowing ? "Unfollowing..." : "Following..."}
          </span>
        ) : isFollowing ? (
          <span className="flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
            Following
          </span>
        ) : (
          "Follow"
        )}
      </button>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmUnfollow}
        title="Unfollow User"
        message={`Should you Unfollow ${username || "this user"}?`}
        confirmText="Unfollow"
        cancelText="Cancel"
        confirmColor="bg-red-600 hover:bg-red-700"
      />
    </>
  );
};

export default FollowButton;

