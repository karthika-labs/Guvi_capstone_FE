import { useState, useEffect, useContext } from "react";
import ApiContext from "./context/ApiContext";

// MealCell component
const MealCell = ({ mealData, onSelect, onRemove }) => {
  const recipe = mealData?.recipeId;

  return (
    <div className="relative righteous-regular cursor-pointer border border-gray-700 rounded-xl p-2 bg-[#1b1b1b] hover:bg-[#242424] transition-all duration-300 group h-28 flex flex-col items-center justify-center">
      {recipe ? (
        <>
          <div className="relative">
            <img
              src={recipe.photoUrl?.[0]}
              alt={recipe.recipeName}
              className="w-16 h-16 object-cover rounded-lg shadow-md"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute -top-1 -right-1 bg-red-600 text-white w-5 h-5 text-xs rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-green-400 font-medium truncate text-center w-full mt-1">
            {recipe.recipeName}
          </p>
        </>
      ) : (
        <span
          onClick={onSelect}
          className="text-sm text-gray-400 group-hover:text-white transition cursor-pointer"
        >
          + Add
        </span>
      )}
    </div>
  );
};

// WeekPlannerGrid component
const WeekPlannerGrid = ({ week, onSelectMeal }) => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const meals = ["breakfast", "lunch", "dinner"];

  if (!week)
    return (
      <div className="grid grid-cols-3 gap-4 p-4 righteous-regular">
        {Array.from({ length: 9 }).map((_, idx) => (
          <div key={idx} className="bg-[#222] h-28 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );

  return (
    <div className="flex flex-col gap-2 w-full righteous-regular">
      {/* Header Row */}
      <div className="grid grid-cols-4 gap-2 text-center mb-2">
        <div></div>
        {meals.map((m) => (
          <div key={m} className="text-gray-300 font-semibold capitalize">{m}</div>
        ))}
      </div>

      {/* Day Rows */}
      {days.map((day) => (
        <div key={day} className="grid righteous-regular grid-cols-4 gap-2 items-center mb-2">
          <div className="text-white font-medium">{day}</div>
          {meals.map((meal) => {
            const mealData = week?.plans?.[day.toLowerCase()]?.[meal];
            return (
              <MealCell
                key={meal}
                mealData={mealData}
                onSelect={() => onSelectMeal(day.toLowerCase(), meal)}
                onRemove={() => onSelectMeal(day.toLowerCase(), meal, "REMOVE")}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default WeekPlannerGrid
