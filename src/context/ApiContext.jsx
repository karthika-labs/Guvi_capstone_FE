import { createContext, useState, useEffect } from "react";
import axios from "axios"; // Or your custom instance: import apiClient from '../api/axiosConfig';
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import API_BASE_URL from "../config/api";

const ApiContext = createContext();

// Cloudinary Constants
const CLOUD_NAME = "duwrhno5o";
const UPLOAD_PRESET_RECIPE = "guvi_project_recipe_upload"; // For recipe photos/videos
const UPLOAD_PRESET_AVATAR = "guvi_project_user_avatar_upload"; // For user profile pictures

// Utility function to upload image to Cloudinary
const uploadImageToCloudinary = async (file, cloudName, uploadPreset) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData
    );
    return response.data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    toast.error("Failed to upload image to Cloudinary.");
    throw error;
  }
};

export const ApiProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [user, setUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null); // User whose profile is being viewed
  const [favoritesCount, setFavoritesCount] = useState(0);
  const location = useLocation();
  const [favorites, setFavorites] = useState([]);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Planner + shopping states
  const [weekPlans, setWeekPlans] = useState([]); // list of weeks (dashboard)
  const [currentWeek, setCurrentWeek] = useState(null); // single week detail
  const [shoppingList, setShoppingList] = useState(null); // current shopping list
  const [manualItem, setManualItem] = useState("");

  // get user details
  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users/current`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUser(res.data);
      console.log("User fetched successfully:", res.data);
    } catch (err) {
      console.log("Error fetching user:", err);
    }
  };

  //update user
  // update logged-in user profile
const updateProfile = async (data) => {
  const isUploading = data instanceof FormData && data.get("avatar") instanceof File;

  if (isUploading) {
    setIsUploadingAvatar(true);
  }

  try {
    const body = {};

    // Check if data is FormData and process it
    if (data instanceof FormData) {
      // Extract all text fields from FormData
      for (const [key, value] of data.entries()) {
        if (typeof value === 'string') {
          body[key] = value;
        }
      }

      // Handle the avatar file upload
      const avatarFile = data.get("avatar");
      if (avatarFile instanceof File) {
        const avatarUrl = await uploadImageToCloudinary(
          avatarFile,
          CLOUD_NAME,
          UPLOAD_PRESET_AVATAR
        );
        body.avatar = avatarUrl; // Use 'avatar' key to match backend expectation
      }
    } else {
      // If it's not FormData, assume it's already a JSON-like object
      Object.assign(body, data);
    }

    // At this point, `body` is always a JSON object
    const res = await axios.put(`${API_BASE_URL}/users/me`, body, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json", // Always send JSON
      },
    });

    setUser(res.data); // IMPORTANT: update context user immediately
    toast.success("Profile updated");
    console.log("user data updated", res.data);
    return res.data;
  } catch (err) {
    console.error(
      "Error updating profile:",
      err?.response?.data || err.message
    );
    toast.error("Profile update failed");
    throw err;
  } finally {
    if (isUploading) {
      setIsUploadingAvatar(false);
    }
  }
};

  const getRecipe = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/recipes`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setRecipes(res.data.recipe);
      console.log("Recipes fetched successfully", res.data.recipe);
    } catch (e) {
      console.log("Error while fetching recipes:", e.message);
    }
  };

  const getUserRecipes = async (userId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users/${userId}/recipes`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return res.data.recipeList || [];
    } catch (e) {
      console.log("Error while fetching user recipes:", e.message);
      return [];
    }
  };

  // Fetch favorites count for the user
  const fetchFavorites = async () => {
    try {
      if (!user?._id) return;
      const res = await axios.get(
        `${API_BASE_URL}/favorites/user/${user._id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setFavorites(res.data.favoriteByUser || []);
      setFavoritesCount(res.data.favoriteByUser.length); // store count
      console.log("Favorites fetched successfully:", res.data);
    } catch (err) {
      console.log("Error fetching favorites:", err);
    }
  };

  // Toggle favorite
  const toggleFavorite = async (recipeId) => {
    const isAlreadyFavorite = isFavorite(recipeId);
    console.log("Already favorite:", isAlreadyFavorite);

    try {
      if (isAlreadyFavorite) {
        // DELETE
        await axios.delete(`${API_BASE_URL}/favorites/${recipeId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("Deleted favorite successfully");
        toast.info("Removed from favorites");
      } else {
        // POST
        await axios.post(
          `${API_BASE_URL}/favorites`,
          { recipeId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log("Added favorite successfully");
        toast.success("Added to favorites");
      }

      // Re-fetch to ensure UI is in sync with the database
      await fetchFavorites();
    } catch (err) {
      console.log("Error toggling favorite:", err);
      toast.error("Could not update favorites.");
    }
  };

  const isFavorite = (recipeId) => {
    if (!favorites) return false;
    return favorites.some((fav) => fav.recipeId?.[0]?._id === recipeId);
  };

  // --------------------  Week Planner / Shopping API functions --------------------

  // 1) Fetch all week plans for current user (dashboard)
  const fetchWeekPlans = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/plans`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // backend returns { getPlan: [...] }
      setWeekPlans(res.data.getPlan || []);
      console.log("Week plans fetched:", res.data.getPlan);
    } catch (err) {
      console.error(
        "Error fetching week plans:",
        err?.response?.data || err.message
      );
    }
  };

  // 2) Create new week plan
  // body: { weekStartDate: DateString, plans: { monday: {...}, ... } }
  const createWeekPlan = async (body) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/plans`, body, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const newPlan = res.data; // backend returns the plan directly

      // Only update state if creation was successful
      setWeekPlans((prev) => [newPlan, ...prev]);
      console.log("API response for createWeekPlan:", res.data);
      return newPlan;
    } catch (err) {
      const msg = err?.response?.data?.message;

      // Don't update state if there's an error - let the frontend handle it
      if (msg === "A plan already exists for this week" || msg === "This date already exists in another week plan") {
        // Don't add to state, just throw the error with existing plan info
        throw err;
      }

      console.error("Error creating week plan:", err);
      console.error("Error details:", err.response?.data);
      throw err;
    }
  };

  // 3) Get single week plan by id (detail view)
  const fetchWeekById = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/plans/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // backend returns { getOnePlan: {...} }
      setCurrentWeek(res.data.getOnePlan || null);
      console.log("Fetched week detail:", res.data.getOnePlan);
      return res.data.getOnePlan;
    } catch (err) {
      console.error(
        "Error fetching week by id:",
        err?.response?.data || err.message
      );
      throw err;
    }
  };

  // 4) Update entire week plan
  // PUT /plans/:id with body of the updated plan (client can pass only changed fields)
  const updateWeek = async (id, body) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/plans/${id}`, body, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCurrentWeek(res.data.updated || res.data.getOnePlan || null);
      // update local dashboard list
      setWeekPlans((prev) =>
        prev.map((w) => (w._id === id ? res.data.updated : w))
      );
      return res.data.updated;
    } catch (err) {
      console.error("Error updating week:", err?.response?.data || err.message);
      throw err;
    }
  };

  // 5) Update a single meal cell (day & meal)
  // expects route: PUT /plans/:id/day/:day/meal/:meal  (you provided a route version earlier)
  // body: { recipeId: "<recipeId>" }
  const updateMeal = async (id, day, meal, recipeId) => {
    try {
      // note: your route string had a space typo earlier; ensure server route is correct.
      const res = await axios.put(
        `${API_BASE_URL}/plans/${id}/day/${day}/meal/${meal}`,
        { recipeId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      // server returns updated plan (assuming). Refresh current week
      if (res.data.updated || res.data.getOnePlan) {
        const updatedPlan = res.data.updated || res.data.getOnePlan;
        setCurrentWeek(updatedPlan);
        // update in dashboard list
        setWeekPlans((prev) =>
          prev.map((w) => (w._id === id ? updatedPlan : w))
        );
      } else {
        // best-effort: refetch
        await fetchWeekById(id);
      }
      return res.data;
    } catch (err) {
      console.error("Error updating meal:", err?.response?.data || err.message);
      throw err;
    }
  };

  // 6) Delete week plan
  const deleteWeek = async (id) => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/plans/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setWeekPlans((prev) => prev.filter((w) => w._id !== id));
      if (currentWeek?._id === id) setCurrentWeek(null);
      return res.data;
    } catch (err) {
      console.error("Error deleting week:", err?.response?.data || err.message);
      throw err;
    }
  };

  // -------------------- Shopping list APIs --------------------

  // 7) Create / generate shopping list for a plan
  const createShoppingList = async (planId) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/plans/${planId}/lists`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      // server returns { shoppingList: {...} }
      setShoppingList(res.data.shoppingList || null);
      console.log("Shopping list created:", res.data.shoppingList);
      return res.data.shoppingList;
    } catch (err) {
      console.error(
        "Error creating shopping list:",
        err?.response?.data || err.message
      );
      throw err;
    }
  };

  // 8) Get shopping list by planId & listId
  const fetchShoppingList = async (planId, listId) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/plans/${planId}/lists/${listId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setShoppingList(res.data.allList || null);
      console.log("fetched list", res.data.allList);
      return res.data.allList;
    } catch (err) {
      console.error(
        "Error fetching shopping list:",
        err?.response?.data || err.message
      );
      throw err;
    }
  };

  // 9) Update shopping list (PUT /plans/:planId/lists/:listId)
  // const updateShoppingList = async (planId, listId, updatedLists) => {
  //   try {
  //     const res = await axios.put(
  //       `${API_BASE_URL}/plans/${planId}/lists/${listId}`,
  //      { lists: updatedLists },
  //       {
  //         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //       }
  //     );

  //   // Always use the updated list from backend
  //   if (res.data.updated) {
  //     setShoppingList(res.data.updated);
  //     return res.data.updated;
  //   }
  //   throw new Error("Invalid response from server");
  //   } catch (err) {
  //     console.error(
  //       "Error updating shopping list:",
  //       err?.response?.data || err.message
  //     );
  //     throw err;
  //   }
  // };

  const updateShoppingList = async (planId, listId, body) => {
    try {
      const res = await axios.put(
        `${API_BASE_URL}/plans/${planId}/lists/${listId}`,
        body,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setShoppingList(res.data.updated || res.data.allList || shoppingList);
      console.log("updated list", res.data.updated);
      return res.data.updated || res.data;
    } catch (err) {
      console.error(
        "Error updating shopping list:",
        err?.response?.data || err.message
      );
      throw err;
    }
  };

  // 10) Delete shopping list
  const deleteShoppingList = async (planId, listId) => {
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/plans/${planId}/lists/${listId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      // clear local
      setShoppingList(null);
      // also remove reference from weekPlans if any (best-effort)
      setWeekPlans((prev) =>
        prev.map((w) =>
          w._id === planId
            ? {
                ...w,
                shoppingList: (w.shoppingList || []).filter(
                  (id) => id !== listId
                ),
              }
            : w
        )
      );
      return res.data;
    } catch (err) {
      console.error(
        "Error deleting shopping list:",
        err?.response?.data || err.message
      );
      throw err;
    }
  };

  // 11) Remove ingredient from list (DELETE /plans/:planId/lists/:listId/ingredient) - expects body { itemName }
  const removeIngredient = async (planId, listId, itemName) => {
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/plans/${planId}/lists/${listId}/ingredient`,
        {
          data: { itemName },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      // update local shoppingList
      if (res.data.removed) setShoppingList(res.data.removed);
      return res.data;
    } catch (err) {
      console.error(
        "Error removing ingredient:",
        err?.response?.data || err.message
      );
      throw err;
    }
  };

  const addManual = async (planId, listId, unit = "") => {
    if (!manualItem.trim()) return;

    const newItem = {
      _id: crypto.randomUUID(),
      itemName: manualItem,
      quantity: 1,
      unit: unit || "",
      purchased: false,
    };

    // Optimistic UI update
    setShoppingList((prev) => ({
      ...prev,
      lists: [...prev.lists, newItem],
    }));
    setManualItem("");

    try {
      // backend save
      await axios.post(
        `${API_BASE_URL}/plans/${planId}/lists/${listId}/manual`,
        newItem,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }}
      );
    } catch (error) {
      console.error("Failed to add manual item:", error);
      toast.error("Failed to save item. Please try again.");
      // Revert UI change on failure
      setShoppingList((prev) => ({
        ...prev,
        lists: prev.lists.filter((item) => item._id !== newItem._id),
      }));
    }

    return newItem; // THIS IS IMPORTANT
  };

  // -------------------- effects --------------------
  useEffect(() => {
    fetchUser();
    getRecipe();
    fetchWeekPlans();
  }, [location.pathname]); // Re-fetch on route change

  useEffect(() => {
    if (user?._id) {
      fetchFavorites();
    } else {
      // Clear favorites if user logs out
      setFavorites([]);
      setFavoritesCount(0);
    }
  }, [user]);

  const getRecipeById = async (id) => {
    try {
      const token = localStorage.getItem("token");
      // Make Authorization header optional - allows viewing recipes without login
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE_URL}/recipes/${id}`, { headers });
      console.log("single Recipe fetched successfully:", res.data.recipe);
      return res.data.recipe;
    } catch (err) {
      console.error("Error fetching recipe by id:", err);
      toast.error("Could not fetch recipe details.");
      throw err;
    }
  };

  const deleteRecipe = async (recipeId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/recipes/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Recipe deleted successfully");
    } catch (err) {
      console.error("Error deleting recipe:", err);
      toast.error(err.response?.data?.message || "Failed to delete recipe");
      throw err;
    }
  };

  const postRating = async (recipeId, ratingValue) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/recipes/${recipeId}/ratings`, 
        { value: ratingValue },
        {
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (err) {
        console.error("Failed to post rating:", err);
        throw err;
    }
  };

  const updateRating = async (recipeId, ratingId, ratingValue) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/ratings/${ratingId}`, 
        { value: ratingValue },
        {
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (err) {
        console.error("Failed to update rating:", err);
        throw err;
    }
  };

  const postComment = async (recipeId, commentText) => {
    try {
        const token = localStorage.getItem("token");
        await axios.post(`${API_BASE_URL}/recipes/${recipeId}/comments`, 
        commentText,
        {
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (err) {
        console.error("Failed to post comment:", err);
        throw err;
    }
  };

  const updateComment = async (commentId, commentText) => {
    try {
        const token = localStorage.getItem("token");
        await axios.put(`${API_BASE_URL}/comments/${commentId}`, 
        { text: commentText },
        {
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (err) {
        console.error("Failed to update comment:", err);
        toast.error("Failed to update comment");
        throw err;
    }
  };

  const deleteComment = async (commentId) => {
    try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_BASE_URL}/comments/${commentId}`, 
        {
            headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Comment deleted successfully");
    } catch (err) {
        console.error("Failed to delete comment:", err);
        toast.error("Failed to delete comment");
        throw err;
    }
  };

  const searchRecipes = async (params) => {
    try{
    const query = new URLSearchParams(params).toString();

    const res = await axios.get(
      `${API_BASE_URL}/recipes/search?${query}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    console.log("Search results:", res.data);
    return res.data;
    }
    catch(err){
      console.error("Error searching recipes:", err);
      throw err;
    }
    
  };

  // Fetch profile user by ID (for viewing other users' profiles)
  const fetchProfileUser = async (userId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProfileUser(res.data);
      return res.data;
    } catch (err) {
      console.error("Error fetching profile user:", err);
      toast.error("Could not fetch user profile");
      throw err;
    }
  };

  // Follow a user
  const followUser = async (userId) => {
    try {
      await axios.post(`${API_BASE_URL}/users/${userId}/follow`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("User followed successfully");
      // Refresh profile user data
      if (profileUser?._id === userId) {
        await fetchProfileUser(userId);
      }
      // Also refresh current user data to update following count
      await fetchUser();
    } catch (err) {
      console.error("Error following user:", err);
      toast.error(err.response?.data?.message || "Could not follow user");
      throw err;
    }
  };

  // Unfollow a user
  const unfollowUser = async (userId) => {
    try {
      await axios.delete(`${API_BASE_URL}/users/${userId}/follow`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("User unfollowed successfully");
      // Refresh profile user data
      if (profileUser?._id === userId) {
        await fetchProfileUser(userId);
      }
      // Also refresh current user data to update following count
      await fetchUser();
    } catch (err) {
      console.error("Error unfollowing user:", err);
      toast.error(err.response?.data?.message || "Could not unfollow user");
      throw err;
    }
  };

  // Get followers list
  const getFollowers = async (userId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users/${userId}/followers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return res.data.followers || [];
    } catch (err) {
      console.error("Error fetching followers:", err);
      toast.error("Could not fetch followers");
      throw err;
    }
  };

  // Get following list
  const getFollowing = async (userId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users/${userId}/following`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return res.data.following || [];
    } catch (err) {
      console.error("Error fetching following:", err);
      toast.error("Could not fetch following list");
      throw err;
    }
  };

  return (
    <ApiContext.Provider
      value={{
        recipes,
        getRecipe,
        getUserRecipes,
        user,
        fetchUser,
        updateProfile,
        favorites,
        favoritesCount,
        fetchFavorites,
        toggleFavorite,
        isFavorite,
        isUploadingAvatar,

        // profile user (for viewing other users' profiles)
        profileUser,
        fetchProfileUser,
        followUser,
        unfollowUser,
        getFollowers,
        getFollowing,

        // planner
        weekPlans,
        currentWeek,
        fetchWeekPlans,
        createWeekPlan,
        fetchWeekById,
        updateWeek,
        updateMeal,
        deleteWeek,

        // shopping
        shoppingList,
        createShoppingList,
        fetchShoppingList,
        updateShoppingList,
        deleteShoppingList,
        removeIngredient,
        addManual,
        manualItem,
        setManualItem,

        getRecipeById,
        deleteRecipe,
        postRating,
        postComment,
        updateComment,
        deleteComment,
        updateRating,
        searchRecipes,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export default ApiContext;
