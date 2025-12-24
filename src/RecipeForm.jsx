import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "./config/api";

function RecipeForm() {
  const { recipeId } = useParams();
  const isEditMode = !!recipeId;
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [existingVideo, setExistingVideo] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialRecipe, setInitialRecipe] = useState(null);

  // Fetch recipe data if in edit mode
  useEffect(() => {
    if (isEditMode && recipeId) {
      const fetchRecipe = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(`${API_BASE_URL}/recipes/${recipeId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const recipe = res.data.recipe;
          setInitialRecipe(recipe);

          // Set existing photos and video
          if (
            recipe.photoUrl &&
            Array.isArray(recipe.photoUrl) &&
            recipe.photoUrl.length > 0
          ) {
            setExistingPhotos(recipe.photoUrl);
          }
          if (recipe.videoUrl) {
            setExistingVideo(recipe.videoUrl);
          }
        } catch (err) {
          console.error("Error fetching recipe:", err);
          setErrorMessage("Failed to load recipe for editing");
        }
      };
      fetchRecipe();
    }
  }, [isEditMode, recipeId]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      recipeName: initialRecipe?.recipeName || "",
      videoUrl: initialRecipe?.videoUrl || "",
      photoUrl: initialRecipe?.photoUrl || [],
      timeDuration: initialRecipe?.timeDuration || "",
      mealType: initialRecipe?.mealType || [],
      foodPreference: initialRecipe?.foodPreference || "",
      ingredients:
        initialRecipe?.ingredients && initialRecipe.ingredients.length > 0
          ? initialRecipe.ingredients
          : [{ name: "", quantity: "", unit: "" }],
      instructions: initialRecipe?.instructions || "",
      description: initialRecipe?.description || "",
    },

    validate: (values) => {
      let errors = {};
      if (!values.recipeName) {
        errors.recipeName = "Recipe Name is Required";
      }
      if (!values.timeDuration) {
        errors.timeDuration = "Time Duration is Required";
      }
      if (!values.description) {
        errors.description = "Description is Required";
      }

      if (!values.mealType) {
        errors.mealType = "Meal Type is Required";
      }
      if (!values.foodPreference) {
        errors.foodPreference = "Food Preference is Required";
      }
      const hasAtLeastOneIngredient = values.ingredients.some(
        (ing) => ing.name && ing.name.trim() !== ""
      );

      if (!hasAtLeastOneIngredient) {
        errors.ingredients = "Please add at least one ingredient";
      }

      return errors;
    },

    onSubmit: async (values) => {
      setLoading(true);

      // Upload photos
      const uploadedUrls = [];

      for (let file of selectedPhotos) {
        const data = new FormData();

        data.append("file", file);
        data.append("upload_preset", "guvi_project_recipe_upload");
        try {
          const res = await axios.post(
            "https://api.cloudinary.com/v1_1/duwrhno5o/image/upload",
            data
          );
          uploadedUrls.push(res.data.secure_url);
          console.log("Photo upload response:", res.data);
        } catch (err) {
          console.log("Error uploading photo:", err);
        }
      }

      // Upload video
      let videoUrl = "";

      if (selectedVideo) {
        const vdata = new FormData();

        vdata.append("file", selectedVideo);
        vdata.append("upload_preset", "guvi_project_recipe_upload");
        try {
          const vres = await axios.post(
            "https://api.cloudinary.com/v1_1/duwrhno5o/video/upload",
            vdata
          );
          videoUrl = vres.data.secure_url;
          console.log("Video upload response:", vres.data);
        } catch (err) {
          console.log("Error uploading video:", err);
        }
      }

      // Combine existing and new photos/videos
      const allPhotoUrls = [...existingPhotos, ...uploadedUrls];
      values.photoUrl = allPhotoUrls.length > 0 ? allPhotoUrls : [];
      values.videoUrl = videoUrl || existingVideo || "";

      try {
        if (isEditMode) {
          // Update existing recipe
          const res = await axios.put(
            `${API_BASE_URL}/recipes/${recipeId}`,
            values,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          console.log("Recipe updated successfully:", res.data);
          setToast(true);
          setTimeout(() => {
            navigate(`/recipe/${recipeId}`);
            setToast(false);
          }, 1500);
        } else {
          // Create new recipe
          const res = await axios.post(`${API_BASE_URL}/recipes`, values, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          console.log("Recipe submitted successfully:", res.data);
          setToast(true);
          setTimeout(() => {
            navigate("/recipes");
            setToast(false);
          }, 500);
        }
      } catch (e) {
        if (e.response && e.response.status === 400) {
          setErrorMessage(e.response.data.message);
        } else {
          setErrorMessage("Something went wrong. Please try again later.");
          console.log("error while registering", e.message);
        }
      }
      setLoading(false);

      console.log("Final form values:", values);
    },
  });

  //add list
  const addIngredient = () => {
    formik.setFieldValue("ingredients", [
      ...formik.values.ingredients,
      { name: "", quantity: "", unit: "" },
    ]);
  };

  //remove list
  const removeIngre = (index) => {
    const ingredients = [...formik.values.ingredients];
    ingredients.splice(index, 1);
    formik.setFieldValue("ingredients", ingredients);
  };

  //photo select
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedPhotos((prev) => [...prev, ...files]);
  };

  //video select
  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    setSelectedVideo(file);
  };

  //remove photo
  const removePhoto = (index, isExisting = false) => {
    if (isExisting) {
      const photos = [...existingPhotos];
      photos.splice(index, 1);
      setExistingPhotos(photos);
    } else {
      const photoUrls = [...selectedPhotos];
      photoUrls.splice(index, 1);
      setSelectedPhotos(photoUrls);
    }
  };

  const removeVideo = (isExisting = false) => {
    if (isExisting) {
      setExistingVideo(null);
    } else {
      setSelectedVideo(null);
    }
  };

  return (
    <div className="min-h-screen righteous-regular bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a] text-gray-200 flex justify-center items-center p-8">
      {loading && (
        <div className="fixed inset-0 bg-black/70 flex flex-col justify-center items-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-purple-400 text-lg font-semibold">
            Uploading... Please wait
          </p>
        </div>
      )}

      {toast && (
        <div className="fixed top-5 right-4 bg-green-500 text-white px-4 py-2 rounded shadow z-50">
          {isEditMode
            ? "Recipe Updated Successfully!"
            : "Recipe Submitted Successfully!"}
        </div>
      )}
      {errorMessage && (
        <p className="text-red-400 text-center mb-3 absolute top-20 left-1/2 transform -translate-x-1/2 z-40">
          {errorMessage}
        </p>
      )}
      <form
        onSubmit={formik.handleSubmit}
        className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] w-full max-w-2xl rounded-2xl shadow-2xl border border-purple-500/20 p-8 space-y-6 relative"
      >
        {/* Close/Back button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute cursor-pointer top-4 right-4 text-gray-400 font-bold text-4xl hover:text-purple-400 transition-colors z-10"
          title="Back to Recipes"
        >
          &times;
        </button>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent text-center mb-6">
          {isEditMode ? "Edit Recipe" : "Add New Recipe"}
        </h1>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2">Recipe Name</label>
            <input
              type="text"
              name="recipeName"
              value={formik.values.recipeName}
              onChange={formik.handleChange}
              className="w-full bg-[#0f0f1a] border border-purple-500/30 rounded-lg p-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white"
            />
            {formik.errors.recipeName && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.recipeName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-2">Time Duration (mins)</label>
            <input
              type="number"
              name="timeDuration"
              value={formik.values.timeDuration}
              onChange={formik.handleChange}
              className="w-full bg-[#0f0f1a] border border-purple-500/30 rounded-lg p-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white"
            />
            {formik.errors.timeDuration && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.timeDuration}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-2">Meal Type</label>
            <div className="flex gap-3 text-sm">
              {["Breakfast", "Lunch", "Dinner"].map((type) => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="mealType"
                    value={type}
                    checked={formik.values.mealType.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        formik.setFieldValue("mealType", [
                          ...formik.values.mealType,
                          type,
                        ]);
                      } else {
                        formik.setFieldValue(
                          "mealType",
                          formik.values.mealType.filter((t) => t !== type)
                        );
                      }
                    }}
                    className="accent-purple-500"
                  />
                  {type}
                </label>
              ))}
            </div>
            {formik.errors.mealType && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.mealType}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-2">Food Preference</label>
            <select
              name="foodPreference"
              value={formik.values.foodPreference}
              onChange={formik.handleChange}
              className="w-full bg-[#0f0f1a] border border-purple-500/30 rounded-lg p-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white"
            >
              <option value="">Select</option>
              <option value="Veg">Veg</option>
              <option value="Non-Veg">Non-Veg</option>
            </select>
            {formik.errors.foodPreference && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.foodPreference}
              </p>
            )}
          </div>
        </div>

        <div className=" flex ">
          <div className="w-full max-w-sm">
            <label className="block text-sm mb-2">Description</label>
            <textarea
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              rows="4"
              className="w-full bg-[#0f0f1a] border border-purple-500/30 rounded-lg p-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white"
            ></textarea>
            {formik.errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.description}
              </p>
            )}
          </div>
        </div>

        {/* Video Upload Section */}
        <div className="grid grid-cols-2 gap-6 ">
          <div className="">
            <label className="block text-sm mb-2">Video File</label>
            <label
              htmlFor="videoInput"
              className="flex justify-center items-center bg-purple-600/20 hover:bg-purple-600 cursor-pointer border border-purple-500/50 hover:border-purple-500 text-purple-400 px-4 py-2 rounded-lg hover:text-white transition-all"
            >
              🎥 Choose Video
            </label>
            <input
              type="file"
              accept="video/*"
              multiple={false}
              onChange={handleVideoSelect}
              className="hidden" // hide the ugly native input
              id="videoInput"
            />
            {/* Show existing and selected video */}
            <div className="mt-2 text-sm space-y-1">
              {existingVideo && (
                <div className="flex justify-between items-center bg-[#1a1a1a] p-2 rounded-md">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">Existing:</span>
                    <a
                      href={existingVideo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline truncate max-w-xs"
                    >
                      {existingVideo.split("/").pop() || "Video"}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVideo(true)}
                    className="text-red-500 hover:text-red-400 font-bold ml-2"
                  >
                    ✕
                  </button>
                </div>
              )}
              {selectedVideo && (
                <div className="flex justify-between items-center bg-[#1a1a1a] p-2 rounded-md">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">New:</span>
                    <span>{selectedVideo.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVideo(false)}
                    className="text-red-500 hover:text-red-400 font-bold ml-2"
                  >
                    ✕
                  </button>
                </div>
              )}
              {!existingVideo && !selectedVideo && <p>No video selected</p>}
            </div>
          </div>

          <div className="">
            <label className="block text-sm mb-2 ">Photo URL</label>
            <label
              htmlFor="photoInput"
              className="flex justify-center items-center bg-purple-600/20 hover:bg-purple-600 cursor-pointer border border-purple-500/50 hover:border-purple-500 text-purple-400 px-4 py-2 rounded-lg hover:text-white transition-all"
            >
              📸 Choose file
            </label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoSelect}
              className="hidden" // hide the ugly native input
              id="photoInput"
            />

            {/* Show existing and selected photos */}
            <div className="mt-2 space-y-2 text-sm">
              {existingPhotos.length > 0 &&
                existingPhotos.map((photoUrl, index) => (
                  <div
                    key={`existing-${index}`}
                    className="flex justify-between items-center bg-[#1a1a1a] p-2 rounded-md"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-green-400">Existing:</span>
                      <img
                        src={photoUrl}
                        alt={`Existing ${index + 1}`}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <a
                        href={photoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline truncate"
                      >
                        Photo {index + 1}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhoto(index, true)}
                      className="text-red-500 hover:text-red-400 font-bold ml-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              {selectedPhotos.length > 0 &&
                selectedPhotos.map((file, index) => (
                  <div
                    key={`new-${index}`}
                    className="flex justify-between items-center bg-[#1a1a1a] p-2 rounded-md"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-purple-400">New:</span>
                      <span className="truncate">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhoto(index, false)}
                      className="text-red-500 hover:text-red-400 font-bold ml-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              {existingPhotos.length === 0 && selectedPhotos.length === 0 && (
                <p>No photos selected</p>
              )}
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <h2 className="text-lg font-semibold mt-4 mb-2">Ingredients</h2>
          {formik.errors.ingredients && (
            <p className="text-red-500 text-sm mt-1">
              {formik.errors.ingredients}
            </p>
          )}
          {formik.values.ingredients.map((ingredient, index) => (
            <div
              key={index}
              className="flex flex-col md:grid md:grid-cols-[1fr_auto_auto_auto_auto] gap-4 bg-[#0f0f1a] p-3 rounded-xl mb-3 border border-purple-500/20"
            >
              {/* Ingredient Name */}
              <input
                type="text"
                name={`ingredients[${index}].name`}
                value={ingredient.name}
                onChange={formik.handleChange}
                className="p-2 rounded bg-[#0f0f1a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center md:text-left w-full border border-purple-500/20"
                placeholder="Ingredient Name"
              />

              {/* Quantity Control */}
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (ingredient.quantity > 0)
                      formik.setFieldValue(
                        `ingredients[${index}].quantity`,
                        Number(ingredient.quantity) - 1
                      );
                  }}
                  className="px-2 py-1 bg-purple-600/30 text-white rounded hover:bg-purple-600 border border-purple-500/30 transition-colors"
                >
                  -
                </button>
                <div className="w-10 text-center text-white">
                  {ingredient.quantity || 0}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    formik.setFieldValue(
                      `ingredients[${index}].quantity`,
                      Number(ingredient.quantity) + 1
                    )
                  }
                  className="px-2 py-1 bg-purple-600/30 text-white rounded hover:bg-purple-600 border border-purple-500/30 transition-colors"
                >
                  +
                </button>
              </div>

              {/* Unit */}
              <input
                type="text"
                name={`ingredients[${index}].unit`}
                value={ingredient.unit}
                onChange={formik.handleChange}
                className="p-2 rounded bg-[#0f0f1a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center w-full border border-purple-500/20"
                placeholder="Unit (g, ml, tsp...)"
              />

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeIngre(index)}
                className="text-purple-400 hover:text-purple-300 flex items-center justify-center font-bold px-2 py-1 rounded transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addIngredient}
            className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600 hover:to-pink-600 border border-purple-500/50 text-white px-4 py-2 rounded-lg flex gap-2 transition-all font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="purple"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>{" "}
            Add Ingredient
          </button>
        </div>

        <div className=" flex ">
          <div className="w-full max-w-sm">
            <label className="block text-sm mb-2">Instructions</label>
            <textarea
              name="instructions"
              value={formik.values.instructions}
              onChange={formik.handleChange}
              rows="4"
              className="w-full bg-[#0f0f1a] border border-purple-500/30 rounded-lg p-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white"
            ></textarea>
          </div>
        </div>
        <div className="flex justify-end gap-4 items-center mt-6">
          {/* submit button */}
          <button
            type="submit"
            className="px-6 py-3 cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg shadow-purple-500/30"
          >
            {isEditMode ? "Update Recipe" : "Submit Recipe"}
          </button>

          {/* refresh form */}
          <button
            type="button"
            onClick={() => formik.resetForm()}
            className="bg-gray-700/50 px-6 py-3 rounded-lg hover:bg-gray-700 border border-gray-600 transition"
          >
            {/* Trash icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 text-red-500 inline-block"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9M18.16 5.79a2.25 2.25 0 0 1 2.244 2.077l.46 10.88a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077l.46-10.88A2.25 2.25 0 0 1 8.084 5.79h10.076zM9 5.79V4.873c0-1.18.91-2.164 2.09-2.201a51.964 51.964 0 0 1 3.32 0c1.18.037 2.09 1.022 2.09 2.201v.916"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

export default RecipeForm;
