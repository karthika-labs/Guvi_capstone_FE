// import { useContext, useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import ApiContext from "./context/ApiContext";
// import { LogOut, Share2 } from "lucide-react";

// const ProfilePage = () => {
//   const { userId } = useParams(); // kept (even if not needed)
//   const [activeTab, setActiveTab] = useState("recipes");

//   const { fetchUser, user, updateProfile } = useContext(ApiContext);

//   // edit states
//   const [isEditing, setIsEditing] = useState(false);
//   const [editData, setEditData] = useState({});

//   useEffect(() => {
//     fetchUser();
//   }, [userId]);

//   if (!user) {
//     return (
//       <p className="text-center mt-20 text-gray-500 text-sm">
//         Loading profile...
//       </p>
//     );
//   }

//   const followersCount = user.followers?.length || 0;
//   const followingsCount = user.followings?.length || 0;
//   const recipes = user.recipes || [];

//   // open edit with current user data
//   const openEdit = () => {
//     setEditData({
//       name: user.name || "",
//       bio: user.bio || "",
//       location: user.location || "",
//       dietaryPreference: user.dietaryPreference || "",
//       favouriteCuisines: user.favouriteCuisines?.join(", ") || "",
//     });
//     setIsEditing(true);
//   };

//   const handleSave = async () => {
//     await updateProfile({
//       ...editData,
//       favouriteCuisines: editData.favouriteCuisines
//         .split(",")
//         .map((c) => c.trim()),
//     });
//     setIsEditing(false);
//   };

//   return (
//     <div className="min-h-screen bg-[#0f0f1a] text-gray-200">
//       <div className="max-w-5xl mx-auto px-4 py-12">
//         {/* HEADER */}
//         <div className="flex flex-col  justify-start  gap-10">

//             <h2 className="text-3xl font-semibold">{user.username}</h2>

//           <div className="">
//             <div className="relative">
//               <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 blur-md opacity-60" />

//               <img
//                 src={user.avatar || "/default-avatar.png"}
//                 alt="avatar"
//                 className="relative w-36 h-36 rounded-full object-cover border-4 border-[#0f0f1a]"
//               />

//             </div>

//             <div className="flex-1 w-full  space-y-4">
//               <div className="flex gap-10 mt-6 text-sm">
//                 <span>
//                   <b className="text-white">
//                     {user.recipeCount || recipes.length}
//                   </b>{" "}
//                   recipes
//                 </span>
//                 <span>
//                   <b className="text-white">{followersCount}</b> followers
//                 </span>
//                 <span>
//                   <b className="text-white">{followingsCount}</b> following
//                 </span>
//               </div>

//               <p className="mt-5 text-sm text-gray-400 max-w-xl">
//                 {user.bio || "ALL ABOUT FOOD AND RECIPES!"}
//               </p>
//               <div className="flex items-center gap-4 flex-wrap">
//                 {/* EDIT – always visible for logged-in user */}
//                 <button
//                   onClick={openEdit}
//                   className="px-5 py-2 rounded-full text-sm font-medium bg-purple-600 hover:bg-purple-700 transition"
//                 >
//                   Edit Profile
//                 </button>

//                 <div className="flex items-center gap-4">
//                   <button
//                     title="Share profile"
//                     className="p-2 rounded-full hover:bg-purple-500/20 transition"
//                   >
//                     <Share2 size={20} className="text-purple-400" />
//                   </button>

//                   <button
//                     title="Logout"
//                     onClick={() => {
//                       localStorage.removeItem("token");
//                       window.location.href = "/login";
//                     }}
//                     className="p-2 rounded-full hover:bg-red-500/20 transition"
//                   >
//                     <LogOut size={20} className="text-red-400" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ABOUT */}
//         <div className="mt-10 bg-[#1a1a2e] border border-gray-700 rounded-2xl p-6 relative">
//           <button
//             onClick={openEdit}
//             className="absolute top-4 right-4 text-xs text-purple-400 hover:text-purple-300"
//           >
//             Edit
//           </button>

//           <h3 className="text-sm font-semibold text-purple-400 mb-4 tracking-wide">
//             ABOUT
//           </h3>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
//             {user.name && (
//               <p>
//                 <span className="text-gray-400">Name</span>
//                 <br />
//                 <span className="text-white">{user.name}</span>
//               </p>
//             )}

//             {user.location && (
//               <p>
//                 <span className="text-gray-400">Location</span>
//                 <br />
//                 <span className="text-white">{user.location}</span>
//               </p>
//             )}

//             {user.dietaryPreference && (
//               <p>
//                 <span className="text-gray-400">Diet</span>
//                 <br />
//                 <span className="text-white">{user.dietaryPreference}</span>
//               </p>
//             )}

//             {user.favouriteCuisines?.length > 0 && (
//               <p className="sm:col-span-2">
//                 <span className="text-gray-400">Cuisines</span>
//                 <br />
//                 <span className="text-white">
//                   {user.favouriteCuisines.join(", ")}
//                 </span>
//               </p>
//             )}
//           </div>
//         </div>

//         {/* TABS */}
//         <div className="flex justify-center gap-12 mt-14 border-t border-gray-700 pt-6 text-xs uppercase tracking-widest">
//           {["recipes", "saved", "liked"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`pb-3 transition ${
//                 activeTab === tab
//                   ? "text-purple-400 border-b-2 border-purple-500"
//                   : "text-gray-500 hover:text-gray-300"
//               }`}
//             >
//               {tab}
//             </button>
//           ))}
//         </div>

//         {/* RECIPES GRID */}
//         {activeTab === "recipes" && (
//           <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-10">
//             {recipes.map((recipe) => (
//               <div
//                 key={recipe._id}
//                 className="relative aspect-square overflow-hidden rounded-xl bg-[#1a1a2e] group"
//               >
//                 <img
//                   src={recipe.image}
//                   alt={recipe.title}
//                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                 />
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* EDIT MODAL */}
//       {isEditing && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
//           <div className="bg-[#1a1a2e] p-6 rounded-xl w-full max-w-md border border-gray-700">
//             <h3 className="text-purple-400 mb-4">Edit Profile</h3>

//             {[
//               "name",
//               "bio",
//               "location",
//               "dietaryPreference",
//               "favouriteCuisines",
//             ].map((key) => (
//               <input
//                 key={key}
//                 value={editData[key]}
//                 onChange={(e) =>
//                   setEditData({ ...editData, [key]: e.target.value })
//                 }
//                 placeholder={key}
//                 className="w-full mb-3 px-4 py-2 rounded bg-[#0f0f1a] border border-gray-700"
//               />
//             ))}

//             <div className="flex justify-end gap-3 mt-4">
//               <button onClick={() => setIsEditing(false)}>Cancel</button>
//               <button
//                 onClick={handleSave}
//                 className="bg-purple-600 px-4 py-2 rounded"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProfilePage;

import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ApiContext from "./context/ApiContext";
import { LogOut, X } from "lucide-react";

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const {
    fetchUser,
    user,
    profileUser,
    fetchProfileUser,
    updateProfile,
    favorites,
    fetchFavorites,
    recipes: allRecipes,
    isUploadingAvatar,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
  } = useContext(ApiContext);

  const [activeTab, setActiveTab] = useState("recipes");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);

  // Determine which user to display
  const displayUser = userId && profileUser ? profileUser : user;
  const isOwnProfile = !userId || (user && user._id === userId);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        if (userId) {
          // Fetch the profile user if userId is provided
          await fetchProfileUser(userId);
        } else {
          // Fetch current user if no userId
          await fetchUser();
        }
        // Fetch favorites for saved recipes
        if (user?._id || (userId && profileUser?._id)) {
          await fetchFavorites();
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [userId, user?._id]);

  if (loading || !displayUser) {
    return (
      <p className="text-center mt-20 text-gray-500 text-sm">
        Loading profile...
      </p>
    );
  }

  const followersCount = displayUser.followers?.length || 0;
  const followingsCount = displayUser.followings?.length || 0;
  const recipes = displayUser.recipes || [];

  // Check if current user is following the profile user
  const isFollowing = user?.followings?.some(
    (following) => {
      const followingId = typeof following === 'object' ? following._id : following;
      return followingId?.toString() === displayUser._id?.toString();
    }
  ) || false;

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await unfollowUser(displayUser._id);
      } else {
        await followUser(displayUser._id);
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };

  // Load followers list
  const handleShowFollowers = async () => {
    setShowFollowersModal(true);
    setLoadingLists(true);
    try {
      const followers = await getFollowers(displayUser._id);
      setFollowersList(followers);
    } catch (err) {
      console.error("Error loading followers:", err);
    } finally {
      setLoadingLists(false);
    }
  };

  // Load following list
  const handleShowFollowing = async () => {
    setShowFollowingModal(true);
    setLoadingLists(true);
    try {
      const following = await getFollowing(displayUser._id);
      setFollowingList(following);
    } catch (err) {
      console.error("Error loading following:", err);
    } finally {
      setLoadingLists(false);
    }
  };

  // ---------- EDIT ----------
  const openEdit = () => {
    const initialData = {
      name: displayUser.name || "",
      bio: displayUser.bio || "",
      location: displayUser.location || "",
      dietaryPreference: displayUser.dietaryPreference || "",
      favouriteCuisines: displayUser.favouriteCuisines?.join(", ") || "",
      avatar: null,
      avatarPreview: null,
    };
    setEditData(initialData);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      formData.append("name", editData.name || "");
      formData.append("bio", editData.bio || "");
      formData.append("location", editData.location || "");
      formData.append("dietaryPreference", editData.dietaryPreference || "");
      formData.append(
        "favouriteCuisines",
        editData.favouriteCuisines
          ? editData.favouriteCuisines.split(",").map((c) => c.trim()).join(",")
          : ""
      );

      if (editData.avatar) {
        formData.append("avatar", editData.avatar);
      }

      await updateProfile(formData);
      
      // Refresh user data after successful update
      if (userId) {
        // If viewing another user's profile, refresh that user's data
        await fetchProfileUser(userId);
      } else {
        // If viewing own profile, refresh current user data
        await fetchUser();
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      // Error is already handled by updateProfile (toast notification)
    }
  };

  const postedRecipes = recipes || [];
  
  // Get liked recipes - filter all recipes where user ID is in likes array
  const targetUserId = userId ? displayUser._id : user?._id;
  const likedRecipes = (allRecipes || []).filter((r) => 
    r.likes?.some(likeId => {
      const id = typeof likeId === 'object' ? likeId._id : likeId;
      return id?.toString() === targetUserId?.toString();
    })
  );

  // Get saved recipes - extract recipe objects from favorites
  const savedRecipes = (favorites || [])
    .map((item) => {
      // recipeId is an array, get the first populated recipe
      const recipe = item.recipeId?.[0];
      return recipe && recipe._id ? recipe : null;
    })
    .filter(Boolean);

  const gridData = (() => {
    if (activeTab === "recipes") return postedRecipes;
    if (activeTab === "liked") return likedRecipes;
    if (activeTab === "saved") return savedRecipes;
    return [];
  })();

  console.log("gridData:", gridData);
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a] text-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
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
          <span className="font-medium">Back</span>
        </button>

        {/* HEADER */}
        <div className="flex flex-col gap-10 md:gap-12">
          <h2 className="text-4xl   md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent break-words mb-2 pr-4 pb-2">
            {displayUser.username}
          </h2>

          <div className="flex flex-col sm:flex-row gap-8">
            {/* AVATAR */}
            <div className="relative group w-fit">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-purple-500 blur-xl opacity-70 animate-pulse" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 blur-md opacity-60" />

              {(isEditing && editData.avatarPreview) || displayUser.avatar ? (
                <img
                  src={isEditing && editData.avatarPreview ? editData.avatarPreview : displayUser.avatar}
                  alt="avatar"
                  className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#0f0f1a] shadow-1xl transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#0f0f1a] shadow-2xl transition-transform duration-300 group-hover:scale-105 bg-[#1a1a2e] flex items-center justify-center ${(isEditing && editData.avatarPreview) || displayUser.avatar ? 'hidden' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 sm:w-16 sm:h-16 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer text-sm">
                  Change
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setEditData((prev) => ({
                        ...prev,
                        avatar: file,
                        avatarPreview: URL.createObjectURL(file),
                      }));
                    }}
                  />
                </label>
              )}
            </div>

            {/* STATS + ACTIONS */}
            <div className="space-y-6 flex-1">
              <div className="flex gap-6 md:gap-10 text-sm">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">{recipes.length}</span>
                  <span className="text-gray-400">recipes</span>
                </div>
                <div
                  onClick={handleShowFollowers}
                  className="flex flex-col cursor-pointer hover:text-purple-400 transition-colors"
                >
                  <span className="text-2xl font-bold text-white">{followersCount}</span>
                  <span className="text-gray-400">followers</span>
                </div>
                <div
                  onClick={handleShowFollowing}
                  className="flex flex-col cursor-pointer hover:text-purple-400 transition-colors"
                >
                  <span className="text-2xl font-bold text-white">{followingsCount}</span>
                  <span className="text-gray-400">following</span>
                </div>
              </div>


              <div className="flex gap-3 flex-wrap items-center">
                {!isEditing ? (
                  <>
                    {isOwnProfile ? (
                      <button
                        onClick={openEdit}
                        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium transition-all duration-200 shadow-lg shadow-purple-500/30"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <button
                        onClick={handleFollowToggle}
                        className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 ${
                          isFollowing
                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                            : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30"
                        }`}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      disabled={isUploadingAvatar}
                    >
                      {isUploadingAvatar ? "Uploading..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => !isUploadingAvatar && setIsEditing(false)}
                      className="px-6 py-2.5 rounded-full border-2 border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-medium transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {isOwnProfile && (
                  <div className="relative group">
                    <button
                      onClick={() => {
                        localStorage.removeItem("token");
                        window.location.href = "/login";
                      }}
                      className="p-2.5 rounded-full hover:bg-red-500/20 transition-all duration-200 hover:scale-110"
                      title="Logout"
                    >
                      <LogOut size={20} className="text-red-400" />
                    </button>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      Logout
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ABOUT */}
        <div className="mt-10 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-purple-500/20 rounded-2xl p-6 shadow-xl shadow-purple-500/10">
          <h3 className="text-lg font-bold text-purple-400 mb-6 tracking-wide">ABOUT</h3>

          {/* Bio Section */}
          <div className="mb-6">
            <span className="text-gray-400 block mb-2">Bio</span>
            {isEditing ? (
              <textarea
                value={editData.bio ?? ""}
                onChange={(e) => {
                  setEditData((prev) => ({ ...prev, bio: e.target.value }));
                }}
                className="w-full bg-[#0f0f1a] border border-purple-500/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white resize-none"
                rows={3}
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-white text-base leading-relaxed">
                {displayUser.bio || "ALL ABOUT FOOD AND RECIPES!"}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {["name", "location", "dietaryPreference"].map((key) => (
              <div key={key}>
                <span className="text-gray-400 capitalize">{key}</span>
                <br />
                {isEditing ? (
                  <input
                    type="text"
                    value={editData[key] ?? ""}
                    onChange={(e) => {
                      setEditData((prev) => ({ ...prev, [key]: e.target.value }));
                    }}
                    className="w-full bg-[#0f0f1a] border border-purple-500/30 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    placeholder={`Enter your ${key}`}
                  />
                ) : (
                  <span className="text-white">{displayUser[key] || "Not specified"}</span>
                )}
              </div>
            ))}

            <div className="sm:col-span-2">
              <span className="text-gray-400">Cuisines</span>
              <br />
              {isEditing ? (
                <input
                  type="text"
                  value={editData.favouriteCuisines ?? ""}
                  onChange={(e) => {
                    setEditData((prev) => ({
                      ...prev,
                      favouriteCuisines: e.target.value,
                    }));
                  }}
                  className="w-full bg-[#0f0f1a] border border-purple-500/30 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  placeholder="e.g., Italian, Mexican, Indian"
                />
              ) : (
                <span className="text-white">
                  {displayUser.favouriteCuisines?.join(", ") || "Not specified"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex justify-center gap-8 md:gap-12 mt-12 border-t border-purple-500/20 pt-6">
          {["recipes", "saved", "liked"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-2 text-sm md:text-base font-medium uppercase tracking-wider transition-all duration-200 ${
                activeTab === tab
                  ? "text-purple-400 border-b-2 border-purple-500"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* RECIPES */}
        {/* {activeTab === "saved" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-10">
            {favorites.map((r) => (
              <div
                key={r._id}
                className="aspect-square overflow-hidden rounded-xl bg-[#1a1a2e]"
              >
                <img
                  src={r.photoUrl[0]}
                  alt={r.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )} */}

        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 mt-8">
          {gridData.length === 0 ? (
            <div className="col-span-2 sm:col-span-3 text-center py-16">
              <div className="inline-block p-6 rounded-full bg-purple-500/10 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-400 text-lg font-medium">
                No {activeTab === "recipes" ? "recipes" : activeTab === "saved" ? "saved recipes" : "liked recipes"} yet
              </p>
            </div>
          ) : (
            gridData.map((recipe) => (
              <Link
                key={recipe._id}
                to={`/recipe/${recipe._id}`}
                className="aspect-square bg-black overflow-hidden rounded-lg group relative cursor-pointer"
              >
                <img
                  src={recipe.photoUrl?.[0] || "https://via.placeholder.com/400?text=No+Image"}
                  alt={recipe.recipeName || "Recipe"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400?text=No+Image";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-sm font-medium truncate">
                      {recipe.recipeName || "Untitled Recipe"}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-xl w-full max-w-md border border-gray-700 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Followers</h3>
              <button
                onClick={() => setShowFollowersModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              {loadingLists ? (
                <p className="text-center text-gray-400">Loading...</p>
              ) : followersList.length === 0 ? (
                <p className="text-center text-gray-400">No followers yet</p>
              ) : (
                followersList.map((follower) => (
                  <Link
                    key={follower._id}
                    to={`/profile/${follower._id}`}
                    onClick={() => setShowFollowersModal(false)}
                    className="flex items-center gap-3 p-3 hover:bg-[#0f0f1a] rounded-lg transition"
                  >
                    {follower.avatar ? (
                      <img
                        src={follower.avatar}
                        alt={follower.username}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-12 h-12 rounded-full border border-purple-500/50 bg-[#1a1a2e] flex items-center justify-center ${follower.avatar ? 'hidden' : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium">{follower.username}</p>
                      {follower.name && (
                        <p className="text-gray-400 text-sm">{follower.name}</p>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-xl w-full max-w-md border border-gray-700 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Following</h3>
              <button
                onClick={() => setShowFollowingModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              {loadingLists ? (
                <p className="text-center text-gray-400">Loading...</p>
              ) : followingList.length === 0 ? (
                <p className="text-center text-gray-400">Not following anyone yet</p>
              ) : (
                followingList.map((following) => (
                  <Link
                    key={following._id}
                    to={`/profile/${following._id}`}
                    onClick={() => setShowFollowingModal(false)}
                    className="flex items-center gap-3 p-3 hover:bg-[#0f0f1a] rounded-lg transition"
                  >
                    {following.avatar ? (
                      <img
                        src={following.avatar}
                        alt={following.username}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-12 h-12 rounded-full border border-purple-500/50 bg-[#1a1a2e] flex items-center justify-center ${following.avatar ? 'hidden' : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium">{following.username}</p>
                      {following.name && (
                        <p className="text-gray-400 text-sm">{following.name}</p>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
