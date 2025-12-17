export default function MealSelectorModal({
  isOpen,
  onClose,
  recipes = [],
  mealType,
  onSelect,
}) {
  if (!isOpen) return null;

  // Normalize mealType filter for both string and array
  const filtered = recipes.filter((r) => {
    if (!r.mealType) return false;

    if (Array.isArray(r.mealType)) {
      // If it's already an array, check if it includes the target
      return r.mealType.some((m) => m.toLowerCase() === mealType.toLowerCase());
    } else if (typeof r.mealType === "string") {
      // If it's a comma-separated string or single string
      return r.mealType
        .split(",")
        .map((m) => m.trim().toLowerCase())
        .includes(mealType.toLowerCase());
    }
    return false;
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999]">
      <div className="bg-[#111] w-full max-w-md p-5 rounded-2xl border border-gray-800 shadow-xl relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">
            Select {mealType}
          </h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* If no recipes */}
        {filtered.length === 0 && (
          <p className="text-gray-400 text-center py-10">
            No {mealType} recipes available.
          </p>
        )}

        {/* Recipe List */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {filtered.map((recipe) => (
            <div
              key={recipe._id}
              onClick={() => onSelect(recipe)}
              className="p-3 bg-[#1a1a1a] border border-gray-700 rounded-xl cursor-pointer 
                         hover:bg-[#2a2a2a] transition flex items-center justify-between"
            >
              <span className="text-gray-200">{recipe.recipeName}</span>
              <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-lg">
                {mealType}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}