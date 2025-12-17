import { useEffect, useContext, useState } from "react";
import { Link } from "react-router-dom";
import ApiContext from "./context/ApiContext";
import { useNavigate } from "react-router-dom";

export default function WeekPlansDashboard() {
  const { weekPlans, fetchWeekPlans, createWeekPlan, deleteWeek } =
    useContext(ApiContext);

  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchWeekPlans();
  }, []);

  const handleCreateWeek = async () => {
    if (creating) return;
    setCreating(true);

try {
    const monday = getUpcomingMonday();
    const newWeek = await createWeekPlan({ weekStartDate: monday });
    if (!newWeek) return;
      navigate(`/planner/new`);

  } catch (err) {
    console.log("Error creating week:", err);
  } finally {
    setCreating(false);
  }
  };

  const getUpcomingMonday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = (1 + 7 - day) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    return monday.toISOString().split("T")[0];
  };
  const handleDeleteWeek = async (weekId) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this week?");
  if (!confirmDelete) return;

  try {
    await deleteWeek(weekId);
    await fetchWeekPlans(); // refresh dashboard after deletion
  } catch (err) {
    console.error("Error deleting week:", err);
  }
};


  return (
    <div className="p-6 text-white min-h-screen bg-[#181818]">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Week Planner</h1>

        <button
          onClick={handleCreateWeek}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
        >
          {creating ? "Creating..." : "Create New Week"}
        </button>
      </div>

      {/* EMPTY STATE */}
      {weekPlans.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
          <div className="text-6xl mb-3">📅</div>
          <p>No week plans yet. Create one to start planning!</p>
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {weekPlans.map((week) => {
          const startdate = new Date(week.weekStartDate);
          const dateString = startdate.toDateString();
            const end = new Date(startdate);
           end.setDate(end.getDate() + 6);

          // count meals filled
          const filled = countFilledMeals(week.plans);

          return (
            <div
              key={week._id}
              className="bg-[#202020] p-5 rounded-xl shadow-lg border border-white/10"
            >
              <h2 className="text-lg font-semibold">{dateString} - </h2>
              <h2>{end.toLocaleDateString()}</h2>

              <p className="text-sm text-gray-400 mt-2">
                {filled} meals planned
              </p>

              <div className="flex items-center gap-3 mt-4">
                <Link
                  to={`/planner/${week._id}`}
                  className="px-3 py-1.5 bg-purple-600 rounded-lg hover:bg-purple-700 text-sm"
                >
                  Open
                </Link>

                <button
                 onClick={() => handleDeleteWeek(week._id)}
                  className="px-3 py-1.5 bg-red-600 rounded-lg hover:bg-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function countFilledMeals(plans) {
  if (!plans) return 0;
  let count = 0;
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const meals = ["breakfast", "lunch", "dinner"];

  for (let d of days) {
    for (let m of meals) {
      if (plans[d]?.[m]) count++;
    }
  }
  return count;
}
