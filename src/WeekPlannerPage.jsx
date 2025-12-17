import { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ApiContext from "./context/ApiContext";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMealCell, setSelectedMealCell] = useState(null);

  // useEffect(() => {
  //   const loadWeeks = async () => {
  //     const weeks = await fetchWeekPlans();
  //     setExistingWeeks(weeks);
  //   };
  //   loadWeeks();
  // }, []);

  // -----------------------------------------
  //  LOAD EXISTING WEEK IF EDITING
  // -----------------------------------------

  useEffect(() => {
    const loadWeek = async () => {
      if (!id) return; // create mode → do nothing

      const week = await fetchWeekById(id);
      setCurrentWeek(week);

      // Build the 7 days
      const start = new Date(week.weekStartDate);
      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return {
          dayName: d.toLocaleDateString("en-US", { weekday: "long" }),
          date: d.toISOString().split("T")[0],
        };
      });

      setWeekDays(days);
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

    const newWeekDates = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + i);
      return d.toISOString().split("T")[0]; // ISO string for comparison
    });

    // Check overlap with existing weeks
    const overlap = weekPlans.some((week) => {
      const weekStart = new Date(week.weekStartDate);
      const weekDates = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d.toISOString().split("T")[0];
      });
      return newWeekDates.some((date) => weekDates.includes(date));
    });

    if (overlap)
      return toast.error(
        "Some dates in this week already exist in another week plan"
      );

    // Create new week
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const week = await createWeekPlan({ weekStartDate: formattedDate });
      setCurrentWeek(week);

      // build 7 days for UI
      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(formattedDate);
        d.setDate(d.getDate() + i);
        return {
          dayName: d.toLocaleDateString("en-US", { weekday: "long" }),
          date: d.toISOString().split("T")[0],
        };
      });
      setWeekDays(days);

      toast.success("Week created successfully");
    } catch (err) {
      console.error("Error creating week:", err);
      toast.error(
        err.response?.data?.message ||
          "Cannot create week: maybe a week already exists for this date"
      );
    }
  };

  const handleSelectMeal = (dayName, meal) => {
    setSelectedMealCell({ dayName, meal });
    setModalOpen(true);
  };

  const handleMealChosen = async (recipe) => {
    if (!selectedMealCell) return;

    const { dayName, meal } = selectedMealCell;

    await updateMeal(currentWeek._id, dayName.toLowerCase(), meal, recipe._id);

    const updatedWeek = await fetchWeekById(currentWeek._id);
    setCurrentWeek(updatedWeek);

    setModalOpen(false);
    setSelectedMealCell(null);
  };

  const handleRemoveMeal = async (dayName, meal) => {
    await updateMeal(currentWeek._id, dayName.toLowerCase(), meal, null);

    const updatedWeek = await fetchWeekById(currentWeek._id);
    setCurrentWeek(updatedWeek);
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

  
  const handleList = async (id) => {
   const list= await createShoppingList(id);
    // await fetchShoppingList(id,list._id);
    navigate(`/planner/${id}/list/${list._id}`);
  };

  // -----------------------------------------
  // UI
  // -----------------------------------------
  return (
    <div className="flex gap-6 p-6 min-h-screen bg-[#181818] text-white">
      {/* Left Calendar - only for create mode */}

      {!isEdit && (
        <div className="w-1/4 bg-[#111] p-4 rounded-xl border border-gray-800">
          <h2 className="text-white font-semibold text-lg">
            Select Week Start
          </h2>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            className="react-calendar text-black rounded-lg p-2"
          />
          <button
            onClick={handleSelectWeek}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg mt-2 text-white"
          >
            Go
          </button>
        </div>
      )}

      {/* Right Section */}
      <div className="flex-1 flex flex-col gap-3">
        <span>
          <button
            onClick={() => handleList(id)}
            className="bg-purple-500 p-1 px-2 rounded"
          >
            shoppingList
          </button>
        </span>
        {weekDays.length === 0 ? (
          <p className="text-gray-400">Select a start date to view the week.</p>
        ) : (
          weekDays.map((day) => (
            <div
              key={day.date}
              className="bg-[#111] rounded-xl border border-gray-800"
            >
              <div
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-[#222]"
                onClick={() =>
                  setExpandedDay(
                    expandedDay === day.dayName ? null : day.dayName
                  )
                }
              >
                <div>
                  <p className="font-medium">{day.dayName}</p>
                  <p className="text-gray-400">{day.date}</p>
                </div>
                <div className="text-white text-xl font-bold">+</div>
              </div>

              {expandedDay === day.dayName && (
                <div className="p-4 grid grid-cols-3 gap-4">
                  {["breakfast", "lunch", "dinner"].map((meal) => {
                    const data =
                      currentWeek?.plans?.[day.dayName.toLowerCase()]?.[meal];

                    return (
                      <div
                        key={meal}
                        onClick={() => handleSelectMeal(day.dayName, meal)}
                        className="bg-[#1b1b1b] p-4 rounded-xl cursor-pointer hover:bg-[#242424] flex flex-col items-center"
                      >
                        {data ? (
                          <>
                            <img
                              src={data.recipeId?.photoUrl?.[0]}
                              className="w-16 h-16 rounded-md"
                            />
                            <p className="text-xs text-center mt-1">
                              {data.recipeId?.recipeName}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveMeal(day.dayName, meal);
                              }}
                              className="text-red-500 mt-1 text-xs"
                            >
                              Remove
                            </button>
                          </>
                        ) : (
                          <p className="text-gray-400 capitalize">{meal}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {modalOpen && selectedMealCell && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-[#111] p-5 rounded-xl border border-gray-800 w-full max-w-md">
            <h2 className="mb-3 font-semibold capitalize">
              Select {selectedMealCell.meal}
            </h2>

            <div className="max-h-80 overflow-y-auto space-y-3">
              {getFilteredRecipes(selectedMealCell.meal).map((r) => (
                <div
                  key={r._id}
                  onClick={() => handleMealChosen(r)}
                  className="bg-[#1a1a1a] p-3 rounded-xl border border-gray-700 cursor-pointer hover:bg-[#2a2a2a]"
                >
                  {r.recipeName}
                </div>
              ))}
            </div>

            <button
              onClick={() => setModalOpen(false)}
              className="mt-4 w-full bg-red-600 hover:bg-red-500 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
