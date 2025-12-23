import { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ApiContext from "./context/ApiContext";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import API_BASE_URL from "./config/api";

export default function WeekPlannerPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // <-- CRITICAL (detect edit mode)
  const isEdit = Boolean(id);
  const {
    recipes,
    updateMeal,
    createShoppingList,
    fetchShoppingList,
    createWeekPlan,
    fetchWeekById,
    fetchWeekPlans,
    weekPlans,
  } = useContext(ApiContext);

  const [selectedDate, setSelectedDate] = useState(null);
  const [weekDays, setWeekDays] = useState([]);
  const [expandedDay, setExpandedDay] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to get meal count for a day
  const getMealCount = (dayName) => {
    if (!currentWeek?.plans?.[dayName.toLowerCase()]) return 0;
    const dayPlans = currentWeek.plans[dayName.toLowerCase()];
    const meals = ["breakfast", "lunch", "dinner"];
    return meals.filter((meal) => dayPlans[meal]).length;
  };

  // Helper function to get meal types for a day
  const getMealTypes = (dayName) => {
    if (!currentWeek?.plans?.[dayName.toLowerCase()]) return [];
    const dayPlans = currentWeek.plans[dayName.toLowerCase()];
    const meals = ["breakfast", "lunch", "dinner"];
    return meals.filter((meal) => dayPlans[meal]);
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMealCell, setSelectedMealCell] = useState(null);
  const [showOverlapModal, setShowOverlapModal] = useState(false);
  const [overlappingPlan, setOverlappingPlan] = useState(null);

  // Load week plans for overlap checking
  useEffect(() => {
    if (!isEdit) {
      fetchWeekPlans();
    }
  }, [isEdit]);

  // -----------------------------------------
  //  LOAD EXISTING WEEK IF EDITING
  // -----------------------------------------

  useEffect(() => {
    const loadWeek = async () => {
      if (!id) {
        setLoading(false);
        return; // create mode → do nothing
      }

      setLoading(true);
      setError(null);

      try {
        console.log("Loading week with id:", id);
        const week = await fetchWeekById(id);
        console.log("Fetched week data:", week);

        if (!week) {
          console.error("Week not found");
          setError("Week plan not found");
          setLoading(false);
          return;
        }

        setCurrentWeek(week);

        // Build the 7 days - normalize to avoid timezone issues
        if (week.weekStartDate) {
          const startDateStr = String(week.weekStartDate).trim();
          console.log("Parsing weekStartDate:", startDateStr);

          try {
            const dateParts = startDateStr.split("-");
            if (dateParts.length === 3) {
              const year = parseInt(dateParts[0], 10);
              const month = parseInt(dateParts[1], 10);
              const day = parseInt(dateParts[2], 10);

              if (
                !isNaN(year) &&
                !isNaN(month) &&
                !isNaN(day) &&
                year > 0 &&
                month > 0 &&
                month <= 12 &&
                day > 0 &&
                day <= 31
              ) {
                const start = new Date(year, month - 1, day); // month is 0-indexed

                if (!isNaN(start.getTime())) {
                  const days = Array.from({ length: 7 }).map((_, i) => {
                    const d = new Date(start);
                    d.setDate(d.getDate() + i);
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, "0");
                    const day = String(d.getDate()).padStart(2, "0");
                    return {
                      dayName: d.toLocaleDateString("en-US", {
                        weekday: "long",
                      }),
                      date: `${year}-${month}-${day}`,
                    };
                  });

                  setWeekDays(days);
                  console.log("Week days set:", days);
                } else {
                  console.error("Invalid date object created");
                  setError("Invalid date in week plan");
                }
              } else {
                console.error("Invalid date values:", { year, month, day });
                setError("Invalid date format in week plan");
              }
            } else {
              console.error("Invalid date format (not 3 parts):", startDateStr);
              setError("Invalid date format");
            }
          } catch (error) {
            console.error("Error parsing weekStartDate:", error);
            setError("Error parsing date");
          }
        } else {
          console.error("weekStartDate is missing from week:", week);
          setError("Week start date is missing");
        }
      } catch (error) {
        console.error("Error loading week:", error);
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load week plan"
        );
        toast.error("Failed to load week plan");
      } finally {
        setLoading(false);
      }
    };

    loadWeek();
  }, [id]);

  // -----------------------------------------
  //  CREATE NEW WEEK (ONLY IN CREATE MODE)
  // -----------------------------------------
  // Inside your existing WeekPlannerPage
  const handleSelectWeek = async () => {
    if (id) return; // ignore if editing
    if (!selectedDate) return toast.error("Select a start date");

    // Ensure we have the latest week plans before checking
    await fetchWeekPlans();

    // Wait a bit for state to update (or use the returned data)
    const plansResponse = await axios.get(`${API_BASE_URL}/plans`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const currentWeekPlans = plansResponse.data.getPlan || [];

    console.log("Checking for overlaps with weekPlans:", currentWeekPlans);
    console.log("Selected date:", selectedDate);

    // Normalize date to avoid timezone issues - extract year, month, day
    const selected = new Date(selectedDate);

    const normalizedStartDate = new Date(
      selected.getFullYear(),
      selected.getMonth(),
      selected.getDate()
    );

    console.log("Normalized start date:", normalizedStartDate);

    //     const normalizedStartDate = new Date(
    //       selected.getFullYear(),
    //       selected.getMonth(),
    //       selected.getDate()
    //     );
    // >>>>>>> Stashed changes

    const newWeekDates = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(normalizedStartDate);
      d.setDate(d.getDate() + i);
      // Format as YYYY-MM-DD without timezone conversion
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    });

    // Check overlap with existing weeks
    let overlappingWeek = null;

    // Calculate the new week's date range
    const newWeekStart = new Date(normalizedStartDate);
    const newWeekEnd = new Date(newWeekStart);
    newWeekEnd.setDate(newWeekEnd.getDate() + 6);

    console.log("New week date range:", {
      start: newWeekStart.toISOString().split("T")[0],
      end: newWeekEnd.toISOString().split("T")[0],
    });

    if (
      currentWeekPlans &&
      Array.isArray(currentWeekPlans) &&
      currentWeekPlans.length > 0
    ) {
      console.log(
        `Checking ${currentWeekPlans.length} existing week plans for overlaps...`
      );

      for (const week of currentWeekPlans) {
        if (!week || !week.weekStartDate) {
          console.log("Skipping week - missing data:", week);
          continue;
        }

        try {
          // Parse existing week start date
          const weekStartDateStr = String(week.weekStartDate).trim();
          const dateParts = weekStartDateStr.split("-");

          if (dateParts.length !== 3) {
            console.log(
              "Skipping week - invalid date format:",
              weekStartDateStr
            );
            continue;
          }

          const [existingYear, existingMonth, existingDay] =
            dateParts.map(Number);

          // Validate date values
          if (
            isNaN(existingYear) ||
            isNaN(existingMonth) ||
            isNaN(existingDay)
          ) {
            console.log("Skipping week - invalid date values:", {
              existingYear,
              existingMonth,
              existingDay,
            });
            continue;
          }

          const existingWeekStart = new Date(
            existingYear,
            existingMonth - 1,
            existingDay
          );

          // Validate the date object
          if (isNaN(existingWeekStart.getTime())) {
            console.log(
              "Skipping week - invalid date object:",
              existingWeekStart
            );
            continue;
          }

          const existingWeekEnd = new Date(existingWeekStart);
          existingWeekEnd.setDate(existingWeekEnd.getDate() + 6);

          console.log("Comparing with existing week:", {
            id: week._id,
            start: existingWeekStart.toISOString().split("T")[0],
            end: existingWeekEnd.toISOString().split("T")[0],
          });

          // Check if dates overlap using date range comparison
          const overlapCondition1 =
            newWeekStart >= existingWeekStart &&
            newWeekStart <= existingWeekEnd;
          const overlapCondition2 =
            newWeekEnd >= existingWeekStart && newWeekEnd <= existingWeekEnd;
          const overlapCondition3 =
            newWeekStart <= existingWeekStart && newWeekEnd >= existingWeekEnd;

          console.log("Overlap conditions:", {
            condition1: overlapCondition1,
            condition2: overlapCondition2,
            condition3: overlapCondition3,
          });

          if (overlapCondition1 || overlapCondition2 || overlapCondition3) {
            console.log("OVERLAP DETECTED!");
            overlappingWeek = {
              _id: week._id,
              weekStartDate: week.weekStartDate,
              startDate: existingWeekStart,
              endDate: existingWeekEnd,
            };
            break; // Found first overlapping week
          }
        } catch (parseErr) {
          // Skip this week if there's an error parsing its date
          console.warn(
            "Error parsing existing week date:",
            week.weekStartDate,
            parseErr
          );
          continue;
        }

        //     for (const week of weekPlans) {
        //       // Normalize date to avoid timezone issues
        //       const weekStartDateStr = week.weekStartDate;
        //       const [year, month, day] = weekStartDateStr.split("-").map(Number);
        //       const weekStart = new Date(year, month - 1, day); // month is 0-indexed

        //       const weekDates = Array.from({ length: 7 }).map((_, i) => {
        //         const d = new Date(weekStart);
        //         d.setDate(d.getDate() + i);
        //         const year = d.getFullYear();
        //         const month = String(d.getMonth() + 1).padStart(2, "0");
        //         const day = String(d.getDate()).padStart(2, "0");
        //         return `${year}-${month}-${day}`;
        //       });

        //       const overlapping = newWeekDates.filter((date) =>
        //         weekDates.includes(date)
        //       );
        //       if (overlapping.length > 0) {
        //         overlappingWeek = week;
        //         overlappingDates = overlapping;
        //         break; // Found first overlapping week
        // >>>>>>> Stashed changes
      }
    } else {
      console.log("No existing week plans to check against");
    }

    if (overlappingWeek) {
      console.log("Overlap found! Showing modal with plan:", overlappingWeek);
      setOverlappingPlan(overlappingWeek);
      setShowOverlapModal(true);
      return;

      //     if (overlappingWeek && overlappingDates.length > 0) {
      //       // Format the existing week's date range (start and end only) - normalize to avoid timezone issues
      //       const existingWeekStartDateStr = overlappingWeek.weekStartDate;
      //       const [year, month, day] = existingWeekStartDateStr
      //         .split("-")
      //         .map(Number);
      //       const existingWeekStart = new Date(year, month - 1, day); // month is 0-indexed
      //       const existingWeekEnd = new Date(existingWeekStart);
      //       existingWeekEnd.setDate(existingWeekEnd.getDate() + 6); // +6 gives 7 days total
      //       const existingWeekStartFormatted = existingWeekStart.toLocaleDateString(
      //         "en-US",
      //         { month: "short", day: "numeric", year: "numeric" }
      //       );
      //       const existingWeekEndFormatted = existingWeekEnd.toLocaleDateString(
      //         "en-US",
      //         { month: "short", day: "numeric", year: "numeric" }
      //       );

      //       return toast.error(
      //         `The dates in this week already exist in the ${existingWeekStartFormatted} - ${existingWeekEndFormatted} plan`
      //       );
      // >>>>>>> Stashed changes
    }

    console.log("No overlap found, proceeding to create week plan");

    // Create new week
    try {
      // Normalize date to avoid timezone issues
      const selected = new Date(selectedDate);
      const normalizedStartDate = new Date(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate()
      );

      // Format as YYYY-MM-DD without timezone conversion
      const year = normalizedStartDate.getFullYear();
      const month = String(normalizedStartDate.getMonth() + 1).padStart(2, "0");
      const day = String(normalizedStartDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      const week = await createWeekPlan({ weekStartDate: formattedDate });
      setCurrentWeek(week);

      // build 7 days for UI - starting from the selected date
      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(normalizedStartDate);
        d.setDate(d.getDate() + i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return {
          dayName: d.toLocaleDateString("en-US", { weekday: "long" }),
          date: `${year}-${month}-${day}`,
        };
      });
      setWeekDays(days);

      toast.success("Week created successfully");
    } catch (err) {
      console.error("Error creating week:", err);
      if (err.response?.data?.existingPlan) {
        // Backend detected overlap - format the dates properly
        const existingPlan = err.response.data.existingPlan;
        const [startYear, startMonth, startDay] = existingPlan.startDate
          .split("-")
          .map(Number);
        const [endYear, endMonth, endDay] = existingPlan.endDate
          .split("-")
          .map(Number);

        setOverlappingPlan({
          _id: existingPlan._id,
          weekStartDate: existingPlan.weekStartDate,
          startDate: new Date(startYear, startMonth - 1, startDay),
          endDate: new Date(endYear, endMonth - 1, endDay),
        });
        setShowOverlapModal(true);
      } else if (
        err.response?.data?.message &&
        err.response.data.message.includes("already exists")
      ) {
        // Try to extract existing plan info from error
        toast.error(err.response.data.message);
        // Still try to show modal if we can get the plan info
        if (err.response.data.plan) {
          const plan = err.response.data.plan;
          const [year, month, day] = plan.weekStartDate.split("-").map(Number);
          const existingWeekStart = new Date(year, month - 1, day);
          const existingWeekEnd = new Date(existingWeekStart);
          existingWeekEnd.setDate(existingWeekEnd.getDate() + 6);

          setOverlappingPlan({
            _id: plan._id,
            weekStartDate: plan.weekStartDate,
            startDate: existingWeekStart,
            endDate: existingWeekEnd,
          });
          setShowOverlapModal(true);
        }
      } else {
        toast.error(
          err.response?.data?.message ||
            "Cannot create week: maybe a week already exists for this date"
        );
      }
    }
  };

  const handleSelectMeal = (dayName, meal) => {
    setSelectedMealCell({ dayName, meal });
    setModalOpen(true);
  };

  const handleMealChosen = async (recipe) => {
    if (!selectedMealCell) return;

    const { dayName, meal } = selectedMealCell;

    try {
      await updateMeal(
        currentWeek._id,
        dayName.toLowerCase(),
        meal,
        recipe._id
      );

      // Wait a bit to ensure backend has processed the update
      await new Promise((resolve) => setTimeout(resolve, 100));

      const updatedWeek = await fetchWeekById(currentWeek._id);
      setCurrentWeek(updatedWeek);

      // Regenerate shopping list to reflect meal changes (preserves existing logic)
      // Use updatedWeek._id to ensure we're using the latest data
      try {
        await createShoppingList(updatedWeek._id);
        console.log("Shopping list regenerated after adding meal");
      } catch (err) {
        console.error("Error regenerating shopping list:", err);
        // Don't show error toast as this is a background operation
      }

      toast.success(`${recipe.recipeName} added to ${dayName} ${meal}`);
    } catch (err) {
      console.error("Error adding meal:", err);
      toast.error("Failed to add meal. Please try again.");
    }

    setModalOpen(false);
    setSelectedMealCell(null);
    // Keep the day expanded after adding a meal
    setExpandedDay(dayName);
  };

  const handleRemoveMeal = async (dayName, meal) => {
    try {
      await updateMeal(currentWeek._id, dayName.toLowerCase(), meal, null);

      // Wait a bit to ensure backend has processed the update
      await new Promise((resolve) => setTimeout(resolve, 100));

      const updatedWeek = await fetchWeekById(currentWeek._id);
      setCurrentWeek(updatedWeek);

      // Regenerate shopping list to reflect meal changes (remove deleted recipe ingredients) - preserves existing logic
      // Use updatedWeek._id to ensure we're using the latest data
      try {
        await createShoppingList(updatedWeek._id);
        console.log("Shopping list regenerated after removing meal");
      } catch (err) {
        console.error("Error regenerating shopping list:", err);
        // Don't show error toast as this is a background operation
      }

      toast.success(`Meal removed from ${dayName} ${meal}`);
    } catch (err) {
      console.error("Error removing meal:", err);
      toast.error("Failed to remove meal. Please try again.");
    }

    // Keep the day expanded after removing a meal
    setExpandedDay(dayName);
  };

  const getFilteredRecipes = (mealType) => {
    return recipes.filter((r) => {
      if (!r.mealType) return false;
      const t = Array.isArray(r.mealType)
        ? r.mealType
        : r.mealType.split(",").map((x) => x.trim());
      return t.some((m) => m.toLowerCase() === mealType.toLowerCase());
    });
  };

  const handleList = async () => {
    if (!currentWeek?._id) {
      toast.error("Please create or select a week plan first");
      return;
    }
    try {
      const list = await createShoppingList(currentWeek._id);
      if (list?._id) {
        navigate(`/planner/${currentWeek._id}/list/${list._id}`);
      } else {
        toast.error("Failed to create shopping list");
      }
    } catch (err) {
      console.error("Error creating shopping list:", err);
      toast.error("Failed to create shopping list");
    }
  };

  // -----------------------------------------
  // UI
  // -----------------------------------------
  return (
    <div className="min-h-screen righteous-regular bg-gradient-to-br from-[#0f0f1a] via-[#181818] to-[#1a1a2e] text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Week Planner
                </h1>
                <p className="text-gray-400 mt-2">
                  Plan your meals for the week
                </p>
              </div>
              {/* <Link
                to="/weekplans"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back
              </Link> */}

              <Link
                to="/weekplans"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                ← Back to Dashboard
              </Link>
            </div>
         
        </div>

        <div className="flex gap-6">
          {/* Left Calendar - only for create mode */}
          {!isEdit && (
            <div className="w-80 bg-[#1a1a2e] p-6 rounded-2xl border border-purple-900/40 shadow-xl">
              <h2 className="text-white font-semibold text-xl mb-4 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Select Week Start
              </h2>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                className="react-calendar text-black rounded-xl p-2 bg-white"
              />
              <button
                onClick={handleSelectWeek}
                disabled={!selectedDate}
                className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Week Plan
              </button>
            </div>
          )}

          {/* Right Section */}
          <div className="flex-1 flex flex-col gap-4">
            {currentWeek && (
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {isEdit ? "Edit Week Plan" : "Week Plan"}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {weekDays.length > 0 &&
                      `${weekDays[0].date} - ${weekDays[6]?.date}`}
                  </p>
                </div>
                <button
                  onClick={handleList}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-purple-500/50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Shopping List
                </button>
              </div>
            )}
            {loading ? (
              <div className="bg-[#1a1a2e] rounded-2xl border border-purple-900/40 p-12 text-center">
                <div className="text-6xl mb-4">⏳</div>
                <p className="text-gray-400 text-lg">Loading week plan...</p>
              </div>
            ) : error ? (
              <div className="bg-[#1a1a2e] rounded-2xl border border-red-900/40 p-12 text-center">
                <div className="text-6xl mb-4">❌</div>
                <p className="text-red-400 text-lg mb-2">
                  Error loading week plan
                </p>
                <p className="text-gray-400 text-sm">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
                >
                  Retry
                </button>
              </div>
            ) : weekDays.length === 0 ? (
              <div className="bg-[#1a1a2e] rounded-2xl border border-purple-900/40 p-12 text-center">
                <div className="text-6xl mb-4">📅</div>
                <p className="text-gray-400 text-lg">
                  {!isEdit
                    ? "Select a start date to view the week."
                    : "No week data available"}
                </p>
              </div>
            ) : (
              weekDays.map((day) => (
                <div
                  key={day.date}
                  className="bg-[#1a1a2e] rounded-2xl border border-purple-900/40 shadow-xl overflow-hidden transition-all duration-200 hover:border-purple-500/50"
                >
                  <div
                    className="flex justify-between items-center p-5 cursor-pointer hover:bg-purple-900/20 transition-colors"
                    onClick={() =>
                      setExpandedDay(
                        expandedDay === day.dayName ? null : day.dayName
                      )
                    }
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-bold text-lg">
                        {day.dayName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-semibold text-lg">{day.dayName}</p>
                          {getMealCount(day.dayName) > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">
                                {getMealCount(day.dayName)} meal
                                {getMealCount(day.dayName) > 1 ? "s" : ""} added
                              </span>
                              <div className="flex gap-1">
                                {getMealTypes(day.dayName).map((meal) => (
                                  <span
                                    key={meal}
                                    className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                      meal === "breakfast"
                                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                        : meal === "lunch"
                                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                        : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                    }`}
                                  >
                                    {meal.charAt(0).toUpperCase() +
                                      meal.slice(1)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{day.date}</p>
                      </div>
                    </div>
                    <div className="text-purple-400 text-2xl font-bold transition-transform duration-200">
                      {expandedDay === day.dayName ? "−" : "+"}
                    </div>
                  </div>

                  {expandedDay === day.dayName && (
                    <div
                      className="p-5 bg-[#0f0f1a] border-t border-purple-900/40"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {["breakfast", "lunch", "dinner"].map((meal) => {
                          const data =
                            currentWeek?.plans?.[day.dayName.toLowerCase()]?.[
                              meal
                            ];
                          const mealColors = {
                            breakfast: "from-yellow-500 to-orange-500",
                            lunch: "from-green-500 to-emerald-500",
                            dinner: "from-purple-500 to-pink-500",
                          };

                          return (
                            <div
                              key={meal}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectMeal(day.dayName, meal);
                              }}
                              className={`bg-gradient-to-br ${mealColors[meal]} p-4 rounded-xl cursor-pointer hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex flex-col items-center min-h-[180px] justify-center group`}
                            >
                              {data ? (
                                <>
                                  <img
                                    src={
                                      data.recipeId?.photoUrl?.[0] ||
                                      "https://via.placeholder.com/100"
                                    }
                                    className="w-20 h-20 rounded-xl object-cover mb-3 shadow-lg border-2 border-white/20"
                                    alt={data.recipeId?.recipeName}
                                  />
                                  <p className="text-white font-semibold text-sm text-center mb-2 line-clamp-2">
                                    {data.recipeId?.recipeName}
                                  </p>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveMeal(day.dayName, meal);
                                    }}
                                    className="text-white bg-red-500/80 hover:bg-red-600 px-3 py-1 rounded-lg text-xs font-medium transition"
                                  >
                                    Remove
                                  </button>
                                </>
                              ) : (
                                <div className="text-center">
                                  <div className="text-4xl mb-2">🍽️</div>
                                  <p className="text-white font-medium capitalize">
                                    {meal}
                                  </p>
                                  <p className="text-white/70 text-xs mt-1">
                                    Click to add
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {modalOpen && selectedMealCell && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-[#1a1a2e] p-6 rounded-2xl border border-purple-900/40 w-full max-w-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold capitalize text-white">
                Select {selectedMealCell.meal}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
              {getFilteredRecipes(selectedMealCell.meal).length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No recipes available for {selectedMealCell.meal}
                </p>
              ) : (
                getFilteredRecipes(selectedMealCell.meal).map((r) => (
                  <div
                    key={r._id}
                    onClick={() => handleMealChosen(r)}
                    className="bg-[#0f0f1a] p-4 rounded-xl border border-purple-900/40 cursor-pointer hover:bg-purple-900/20 hover:border-purple-500/50 transition-all duration-200 flex items-center gap-4 group"
                  >
                    <img
                      src={r.photoUrl?.[0] || "https://via.placeholder.com/80"}
                      className="w-16 h-16 rounded-lg object-cover"
                      alt={r.recipeName}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-white group-hover:text-purple-300 transition">
                        {r.recipeName}
                      </p>
                      {r.description && (
                        <p className="text-gray-400 text-sm line-clamp-1">
                          {r.description}
                        </p>
                      )}
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overlap Modal */}
      {showOverlapModal && overlappingPlan && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowOverlapModal(false);
            setOverlappingPlan(null);
          }}
        >
          <div
            className="bg-[#1a1a2e] p-6 rounded-2xl border border-purple-900/40 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">
                Date Already Exists
              </h2>
              <button
                onClick={() => {
                  setShowOverlapModal(false);
                  setOverlappingPlan(null);
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-300 mb-4 text-center">
                This date is already included in existing plans{" "}
                <span className="text-purple-400 font-semibold">
                  {overlappingPlan.startDate instanceof Date
                    ? overlappingPlan.startDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : new Date(overlappingPlan.startDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )}
                  {" - "}
                  {overlappingPlan.endDate instanceof Date
                    ? overlappingPlan.endDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : new Date(overlappingPlan.endDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )}
                </span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowOverlapModal(false);
                  setOverlappingPlan(null);
                }}
                className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition"
              >
                Close
              </button>
              <Link
                to={`/planner/${overlappingPlan._id}`}
                onClick={() => {
                  setShowOverlapModal(false);
                  setOverlappingPlan(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium transition"
              >
                Open Existing Plan
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
