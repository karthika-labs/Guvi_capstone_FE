import React, { useState } from "react";
import { useFormik } from "formik";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function RecipeForm() {
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      recipeName: "",
      videoUrl: "",
      photoUrl: [],
      timeDuration: "",
      mealType: [],
      foodPreference: "",
      ingredients: [{ name: "", quantity: "", unit: "" }],
      instructions: "",
      description: "",
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
      if (!values.ingredients || values.ingredients.length === 0) {
        errors.ingredients = "At least one ingredient is required";
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

        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/duwrhno5o/image/upload",
          data
        );

        uploadedUrls.push(res.data.secure_url);
      }

      // Upload video
      let videoUrl = "";

      if (selectedVideo) {
        const vdata = new FormData();

        vdata.append("file", selectedVideo);
        vdata.append("upload_preset", "guvi_project_recipe_upload");

        const vres = await axios.post(
          "https://api.cloudinary.com/v1_1/duwrhno5o/video/upload",
          vdata
        );

        videoUrl = vres.data.secure_url;
      }

      //  push to formik values
      values.photoUrl = uploadedUrls;
      values.videoUrl = videoUrl;

      try {
        const res = await axios.post("http://localhost:5000/recipes", values, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setToast(true);

        setTimeout(() => {
          navigate("/recipes");
          setToast(false);
        }, 500);

        console.log("Recipe submitted successfully:", res.data);
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
  const removePhoto = (index) => {
    const photoUrls = [...selectedPhotos];
    photoUrls.splice(index, 1);
    setSelectedPhotos(photoUrls);
  };

  const removeVideo = () => setSelectedVideo(null);

  return (
    <div className="min-h-screen bg-[#1e1e1e] shadow-lg text-[#f5f5f5] flex justify-center items-center p-8">
      {loading && (
        <div className="fixed inset-0 bg-black/70 flex flex-col justify-center items-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#A100FF] border-t-transparent"></div>
          <p className="mt-4 text-[#A100FF] text-lg font-semibold">
            Uploading... Please wait
          </p>
        </div>
      )}

      {toast && (
        <div className="fixed top-5 right-4 bg-green-500 text-white px-4 py-2 rounded shadow">
          Recipe Submitted Successfully!
        </div>
      )}
      {errorMessage && (
        <p className="text-red-500 text-center mb-3 absolute top-20">
          {errorMessage}
        </p>
      )}
      <form
        onSubmit={formik.handleSubmit}
        className="bg-[#1e1e1e] w-full max-w-2xl rounded-2xl shadow-lg p-8 space-y-6"
      >
        {/* Close button */}
        <button
          type="button"
          className="absolute cursor-pointer top-4 right-4 text-white font-bold text-5xl hover:text-red-600"
        >
          &times;
        </button>
        <h1 className="text-3xl font-bold text-orange-500 text-center mb-6">
          Add New Recipe
        </h1>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2">Recipe Name</label>
            <input
              type="text"
              name="recipeName"
              value={formik.values.recipeName}
              onChange={formik.handleChange}
              className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg p-2 focus:border-orange-400 focus:outline-none"
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
              className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg p-2 focus:border-orange-400 focus:outline-none"
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
                    className="accent-orange-500"
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
              className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg p-2 focus:border-orange-400 focus:outline-none"
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
              className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg p-2 focus:border-orange-400 focus:outline-none"
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
              className="flex justify-center items-center bg-[#1a1a1a] hover:bg-orange-500  cursor-pointer hover:border border-orange-500 text-orange-500 px-4 py-2  rounded-lg hover:text-white  transition-all"
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
            {/* Show selected video name */}
            {
              <div className="mt-2 text-sm space-y-1">
                {selectedVideo ? (
                  <div className="flex justify-between items-center bg-[#1a1a1a] p-2 rounded-md">
                    <span>{selectedVideo.name}</span>
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="text-red-500 hover:text-red-400 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <p>No video selected</p>
                )}
              </div>
            }
          </div>

          <div className="">
            <label className="block text-sm mb-2 ">Photo URL</label>
            <label
              htmlFor="photoInput"
              className="flex justify-center items-center bg-[#1a1a1a] hover:bg-orange-500  cursor-pointer hover:border border-orange-500 text-orange-500 px-4 py-2  rounded-lg hover:text-white  transition-all"
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

            {/* Show selected photo names */}
            <div className="mt-2 space-y-2 text-sm">
              {selectedPhotos.length > 0 ? (
                selectedPhotos.map((file, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-[#1a1a1a] p-2 rounded-md"
                  >
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="text-red-500 hover:text-red-400 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <p>No photos selected</p>
              )}
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <h2 className="text-lg font-semibold mt-4 mb-2">Ingredients</h2>
          {formik.values.ingredients.map((ingredient, index) => (
            <div
              key={index}
              className="flex flex-col md:grid md:grid-cols-[1fr_auto_auto_auto_auto] gap-4 bg-[#1c1c1c] p-3 rounded-xl mb-3 border border-[#2a2a2a]"
            >
              {/* Ingredient Name */}
              <input
                type="text"
                name={`ingredients[${index}].name`}
                value={ingredient.name}
                onChange={formik.handleChange}
                className="p-2 rounded bg-[#121212] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-center md:text-left w-full"
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
                  className="px-2 py-1 bg-[#2a2a2a] text-white rounded hover:bg-orange-600"
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
                  className="px-2 py-1 bg-[#2a2a2a] text-white rounded hover:bg-orange-600"
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
                className="p-2 rounded bg-[#121212] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-center w-full"
                placeholder="Unit (g, ml, tsp...)"
              />

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeIngre(index)}
                className="text-orange-500 hover:text-orange-400 flex items-center justify-center font-bold px-2 py-1 rounded transition-all"
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
            className="hover:bg-white/70 bg-white/30 border-orange-500 border-2 text-white px-4 py-2 rounded-lg hover:text-orange-700 flex gap-2 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="orange"
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
              className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg p-2 focus:border-orange-400 focus:outline-none"
            ></textarea>
          </div>
        </div>
        <div className="flex justify-end gap-4 items-center mt-6">
          {/* submit button */}
          <button
            type="submit"
            className="px-4 py-2 cursor-pointer bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-all font-semibold"
          >
            Submit Recipe
          </button>

          {/* refresh form */}
          <button
            type="button"
            onClick={() => formik.resetForm()}
            className="bg-gray-700 px-6 py-2 rounded hover:bg-gray-600 transition"
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
