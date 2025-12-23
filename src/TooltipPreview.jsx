export default function TooltipPreview({ recipe }) {
  return (
    <div className="absolute righteous-regular -top-28 left-1/2 -translate-x-1/2 bg-black text-white text-xs p-2 rounded-lg shadow-lg w-32">
      <img src={recipe.photoUrl?.[0]} alt={recipe.recipeName} className="w-full h-16 object-cover rounded-md mb-2" />
      <p className="text-center">{recipe.recipeName}</p>
    </div>
  );
}