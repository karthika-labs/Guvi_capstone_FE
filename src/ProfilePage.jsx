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
import { useParams } from "react-router-dom";
import ApiContext from "./context/ApiContext";
import { LogOut, Share2 } from "lucide-react";

const ProfilePage = () => {
  const { userId } = useParams(); // kept as you wanted
  const { fetchUser, user, updateProfile, favorites, isUploadingAvatar } =
    useContext(ApiContext);

  const [activeTab, setActiveTab] = useState("recipes");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchUser();
  }, [userId]);

  if (!user) {
    return (
      <p className="text-center mt-20 text-gray-500 text-sm">
        Loading profile...
      </p>
    );
  }

  const followersCount = user.followers?.length || 0;
  const followingsCount = user.followings?.length || 0;
  const recipes = user.recipes || [];

  // ---------- EDIT ----------
  const openEdit = () => {
    setEditData({
      name: user.name || "",
      bio: user.bio || "",
      location: user.location || "",
      dietaryPreference: user.dietaryPreference || "",
      favouriteCuisines: user.favouriteCuisines?.join(", ") || "",
      avatar: null,
      avatarPreview: null,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    const formData = new FormData();

    formData.append("name", editData.name);
    formData.append("bio", editData.bio);
    formData.append("location", editData.location);
    formData.append("dietaryPreference", editData.dietaryPreference);
    formData.append(
      "favouriteCuisines",
      editData.favouriteCuisines
        .split(",")
        .map((c) => c.trim())
        .join(",")
    );

    if (editData.avatar) {
      formData.append("avatar", editData.avatar);
    }

    await updateProfile(formData);
    setIsEditing(false);
  };

  const postedRecipes = recipes;
  console.log("postedRecipes:", postedRecipes);

  const likedRecipes = recipes.filter((r) => r.likes?.includes(user._id));
  console.log("likedRecipes:", likedRecipes);

  const savedRecipes = favorites || [];
  console.log("savedRecipes:", savedRecipes);
  const gridData = (() => {
    if (activeTab === "recipes") return postedRecipes;
    if (activeTab === "liked") return likedRecipes;

    // saved
    return savedRecipes.map((item) => item.recipeId?.[0]).filter(Boolean);
  })();

  console.log("gridData:", gridData);
  return (
    <div className="min-h-screen bg-[#0f0f1a] text-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* HEADER */}
        <div className="flex flex-col gap-10">
          <h2 className="text-3xl font-semibold">{user.username}</h2>

          <div className="flex flex-col sm:flex-row gap-10">
            {/* AVATAR */}
            <div className="relative group w-fit">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 blur-md opacity-60" />

              <img
                src={
                  isEditing && editData.avatarPreview
                    ? editData.avatarPreview
                    : user.avatar || "/default-avatar.png"
                }
                alt="avatar"
                className="relative w-36 h-36 rounded-full object-cover border-4 border-[#0f0f1a]"
              />

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
            <div className="space-y-4">
              <div className="flex gap-10 text-sm">
                <span>
                  <b className="text-white">{recipes.length}</b> recipes
                </span>
                <span>
                  <b className="text-white">{followersCount}</b> followers
                </span>
                <span>
                  <b className="text-white">{followingsCount}</b> following
                </span>
              </div>

              {!isEditing ? (
                <p className="text-sm text-gray-400 max-w-xl">
                  {user.bio || "ALL ABOUT FOOD AND RECIPES!"}
                </p>
              ) : (
                <textarea
                  value={editData.bio}
                  onChange={(e) =>
                    setEditData({ ...editData, bio: e.target.value })
                  }
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded px-3 py-2"
                />
              )}

              <div className="flex gap-3 flex-wrap">
                {!isEditing ? (
                  <button
                    onClick={openEdit}
                    className="px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-700"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="px-5 py-2 rounded-full bg-purple-600 disabled:bg-purple-400"
                      disabled={isUploadingAvatar}
                    >
                      {isUploadingAvatar ? "Uploading..." : "Save"}
                    </button>
                    <button
                      onClick={() => !isUploadingAvatar && setIsEditing(false)}
                      className="px-5 py-2 rounded-full border border-gray-600"
                    >
                      Cancel
                    </button>
                  </>
                )}

                <button className="p-2 rounded-full hover:bg-purple-500/20">
                  <Share2 size={20} className="text-purple-400" />
                </button>

                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                  }}
                  className="p-2 rounded-full hover:bg-red-500/20"
                >
                  <LogOut size={20} className="text-red-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ABOUT */}
        <div className="mt-10 bg-[#1a1a2e] border border-gray-700 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-purple-400 mb-4">ABOUT</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {["name", "location", "dietaryPreference"].map((key) => (
              <div key={key}>
                <span className="text-gray-400 capitalize">{key}</span>
                <br />
                {isEditing ? (
                  <input
                    value={editData[key]}
                    onChange={(e) =>
                      setEditData({ ...editData, [key]: e.target.value })
                    }
                    className="w-full bg-[#0f0f1a] border border-gray-700 rounded px-3 py-1"
                  />
                ) : (
                  <span className="text-white">{user[key]}</span>
                )}
              </div>
            ))}

            <div className="sm:col-span-2">
              <span className="text-gray-400">Cuisines</span>
              <br />
              {isEditing ? (
                <input
                  value={editData.favouriteCuisines}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      favouriteCuisines: e.target.value,
                    })
                  }
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded px-3 py-1"
                />
              ) : (
                <span className="text-white">
                  {user.favouriteCuisines?.join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex justify-center gap-12 mt-14 border-t border-gray-700 pt-6 text-xs uppercase">
          {["recipes", "saved", "liked"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 ${
                activeTab === tab
                  ? "text-purple-400 border-b-2 border-purple-500"
                  : "text-gray-500"
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
        <div className="grid grid-cols-3 gap-[2px] mt-6">
          {gridData.length === 0 ? (
            <p className="col-span-3 text-center text-gray-500 text-sm mt-10">
              No recipes yet
            </p>
          ) : (
            gridData.map((recipe) => (
              <div
                key={recipe._id}
                className="aspect-square bg-black overflow-hidden"
              >
                <img
                  src={recipe.photoUrl?.[0]}
                  alt={recipe.recipeName}
                  className="w-full h-full object-cover"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
