import { useEffect, useContext, useState } from "react";
import { Link } from "react-router-dom";
import ApiContext from "./context/ApiContext";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "./ConfirmModal";

export default function WeekPlansDashboard() {
  const { weekPlans, fetchWeekPlans, createWeekPlan, deleteWeek } =
    useContext(ApiContext);

  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [weekToDelete, setWeekToDelete] = useState(null);

  useEffect(() => {
    fetchWeekPlans();
  }, []);

  const handleCreateWeek = () => {
    // Simply navigate to the create page where user can select a date from calendar
    navigate(`/planner/new`);
  };

  const handleDeleteClick = (weekId) => {
    setWeekToDelete(weekId);
    setShowDeleteModal(true);
  };

  const handleDeleteWeek = async () => {
    if (!weekToDelete) return;

    try {
      await deleteWeek(weekToDelete);
      await fetchWeekPlans(); // refresh dashboard after deletion
      setShowDeleteModal(false);
      setWeekToDelete(null);
    } catch (err) {
      console.error("Error deleting week:", err);
      setShowDeleteModal(false);
      setWeekToDelete(null);
    }
  };


  return (
    <div className="min-h-screen  righteous-regular bg-gradient-to-br from-[#0f0f1a] via-[#181818] to-[#1a1a2e] text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/recipes")}
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
          <span className="font-medium">Back to Home</span>
        </button>

        {/* HEADER */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Week Plans Dashboard
              </h1>
              <p className="text-gray-400 mt-2">Manage your weekly meal plans</p>
            </div>
            <button
              onClick={handleCreateWeek}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-purple-500/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Week
            </button>
          </div>
        </div>

        {/* EMPTY STATE */}
        {weekPlans.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-20 bg-[#1a1a2e] rounded-2xl border border-purple-900/40 p-12">
            <div className="text-7xl mb-4">📅</div>
            <h3 className="text-2xl font-semibold mb-2">No week plans yet</h3>
            <p className="text-gray-400 text-center max-w-md">
              Create your first week plan to start organizing your meals!
            </p>
          </div>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {weekPlans && weekPlans.length > 0 ? weekPlans.map((week) => {
            // Normalize date to avoid timezone issues and NaN
            let dateString = "Loading...";
            let endString = "Loading...";
            
            if (week && week.weekStartDate) {
              try {
                // Parse date string manually to avoid timezone issues
                const dateStr = String(week.weekStartDate).trim();
                const dateParts = dateStr.split('-');
                
                if (dateParts.length === 3) {
                  const year = parseInt(dateParts[0], 10);
                  const month = parseInt(dateParts[1], 10);
                  const day = parseInt(dateParts[2], 10);
                  
                  if (!isNaN(year) && !isNaN(month) && !isNaN(day) && year > 0 && month > 0 && month <= 12 && day > 0 && day <= 31) {
                    const startdate = new Date(year, month - 1, day); // month is 0-indexed
                    
                    if (!isNaN(startdate.getTime())) {
                      dateString = startdate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                      
                      const end = new Date(startdate);
                      end.setDate(end.getDate() + 6);
                      endString = end.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    } else {
                      dateString = "Invalid Date";
                      endString = "Invalid Date";
                    }
                  } else {
                    console.error("Invalid date values:", { year, month, day, dateStr });
                    dateString = "Invalid Date";
                    endString = "Invalid Date";
                  }
                } else {
                  console.error("Invalid date format:", dateStr);
                  dateString = "Invalid Format";
                  endString = "Invalid Format";
                }
              } catch (error) {
                console.error("Error parsing date:", error, week);
                dateString = "Error";
                endString = "Error";
              }
            } else {
              console.warn("Week or weekStartDate missing:", week);
              dateString = "No Date";
              endString = "No Date";
            }

            // count meals filled
            const filled = countFilledMeals(week.plans);
            const total = 21; // 7 days * 3 meals
            const percentage = Math.round((filled / total) * 100);

            return (
              <div
                key={week._id}
                className="bg-[#1a1a2e] p-6 rounded-2xl shadow-xl border border-purple-900/40 hover:border-purple-500/50 transition-all duration-200 hover:shadow-purple-500/20"
              >
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                      <span className="text-white font-bold">W</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        {dateString}
                      </h2>
                      <p className="text-sm text-gray-400">to {endString}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Progress</span>
                      <span className="text-sm font-semibold text-purple-400">
                        {filled} / {total} meals
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{percentage}% complete</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <Link
                    to={`/planner/${week._id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Open
                  </Link>

                  <button
                    onClick={() => handleDeleteClick(week._id)}
                    className="px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 hover:border-red-600 rounded-lg text-red-400 hover:text-red-300 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">No week plans found</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setWeekToDelete(null);
        }}
        onConfirm={handleDeleteWeek}
        title="Delete Week Plan"
        message="Are you sure you want to delete this week? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="bg-red-600 hover:bg-red-700"
      />
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
