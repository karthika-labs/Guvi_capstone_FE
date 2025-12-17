import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [user, setUser] = useState(null);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const location = useLocation();
  const [favorites, setFavorites] = useState([]);

  // Planner + shopping states
  const [weekPlans, setWeekPlans] = useState([]); // list of weeks (dashboard)
  const [currentWeek, setCurrentWeek] = useState(null); // single week detail
  const [shoppingList, setShoppingList] = useState(null); // current shopping list
  const [manualItem, setManualItem] = useState("");

  // get user details
  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/users/current", {
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
  const updateProfile = async (body) => {
    try {
      const res = await axios.put("http://localhost:5000/users/me", body, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setUser(res.data); // IMPORTANT: update context user immediately
      toast.success("Profile updated");

      return res.data;
    } catch (err) {
      console.error(
        "Error updating profile:",
        err?.response?.data || err.message
      );
      toast.error("Profile update failed");
      throw err;
    }
  };

  const getRecipe = async () => {
    try {
      const res = await axios.get("http://localhost:5000/recipes", {
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

  // Fetch favorites count for the user
  const fetchFavorites = async () => {
    try {
      if (!user?._id) return;
      const res = await axios.get(
        `http://localhost:5000/favorites/user/${user._id}`,
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
    try {
      // 1. Get current list
      const res = await axios.get(
        `http://localhost:5000/favorites/user/${user._id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      //  the actual array
      const favorites = res.data.favoriteByUser || [];

      const already = favorites.some(
        (fav) => fav.recipeId?.[0]?._id === recipeId
      );
      console.log("Already favorite:", already);

      if (already) {
        // DELETE
        try {
          await axios.delete(`http://localhost:5000/favorites/${recipeId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          console.log("Deleted favorite successfully");
        } catch (err) {
          console.log("Error deleting favorite:", err);
        }
      } else {
        // POST
        try {
          await axios.post(
            `http://localhost:5000/favorites`,
            { recipeId },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          console.log("Added favorite successfully");
        } catch (err) {
          console.log("Error adding favorite:", err);
        }
      }

      // 2.to  Update  count in ui
      fetchFavorites();
    } catch (err) {
      console.log("Error toggling favorite:", err);
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
      const res = await axios.get("http://localhost:5000/plans", {
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
      const res = await axios.post("http://localhost:5000/plans", body, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const newPlan = res.data; // backend returns the plan directly

      setWeekPlans((prev) => [newPlan, ...prev]);
      console.log("API response for createWeekPlan:", res.data);
      return newPlan;
    } catch (err) {
      const msg = err?.response?.data?.message;

      if (msg === "A plan already exists for this week") {
        const existing = err.response.data.plan;

        // Show error toast
        toast.error("A plan already exists for this week");

        // Return existing plan so frontend can redirect
        return existing;
      }

      console.error("Error creating week plan:", err);
      throw err;
    }
  };

  // 3) Get single week plan by id (detail view)
  const fetchWeekById = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/plans/${id}`, {
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
      const res = await axios.put(`http://localhost:5000/plans/${id}`, body, {
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
        `http://localhost:5000/plans/${id}/day/${day}/meal/${meal}`,
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
      const res = await axios.delete(`http://localhost:5000/plans/${id}`, {
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
        `http://localhost:5000/plans/${planId}/lists`,
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
        `http://localhost:5000/plans/${planId}/lists/${listId}`,
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
  //       `http://localhost:5000/plans/${planId}/lists/${listId}`,
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
        `http://localhost:5000/plans/${planId}/lists/${listId}`,
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
        `http://localhost:5000/plans/${planId}/lists/${listId}`,
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
        `http://localhost:5000/plans/${planId}/lists/${listId}/ingredient`,
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

  const addManual = async (planId, listId) => {
    if (!manualItem.trim()) return;

    const newItem = {
      _id: crypto.randomUUID(),
      itemName: manualItem,
      quantity: 1,
      unit: "",
      purchased: false,
    };

    // instant UI update (inside this component)
    setShoppingList((prev) => ({
      ...prev,
      lists: [...prev.lists, newItem],
    }));

    setManualItem("");

    // backend save
    await axios.post(
      `http://localhost:5000/plans/${planId}/lists/${listId}/manual`,
      newItem,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    return newItem; // THIS IS IMPORTANT
  };

  // -------------------- effects --------------------
  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  useEffect(() => {
    getRecipe();
  }, [location.pathname]);

  useEffect(() => {
    const loadWeeks = async () => {
      try {
        await fetchWeekPlans(); // this should update `weekPlans` in context
      } catch (err) {
        console.error("Error fetching weeks:", err);
      }
    };
    loadWeeks();
  }, []);

  const searchRecipes = async (params) => {
    try{
    const query = new URLSearchParams(params).toString();

    const res = await axios.get(
      `http://localhost:5000/recipes/search?${query}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    setRecipes(res.data || []);
    console.log("Search results:", res.data);
    return res.data;
    }
    catch(err){
      console.error("Error searching recipes:", err);
      throw err;
    }
    
  };

  return (
    <ApiContext.Provider
      value={{
        recipes,
        getRecipe,
        user,
        fetchUser,
        updateProfile,
        favorites,
        favoritesCount,
        fetchFavorites,
        toggleFavorite,
        isFavorite,

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

        searchRecipes,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export default ApiContext;
