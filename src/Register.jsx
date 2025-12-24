import React, { useState } from "react";
import { useFormik } from "formik";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API_BASE_URL from "./config/api";

function Register() {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
    },
    validate: (values) => {
      let errors = {};
      if (!values.username) {
        errors.username = "Username is required";
      } else if (values.username.length < 3) {
        errors.username = "Username must be at least 3 characters";
      }
      if (!values.email) {
        errors.email = "Email is required";
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
        errors.email = "Invalid email address";
      }
      if (!values.password) {
        errors.password = "Password is required";
      } else if (values.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }
      return errors;
    },
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMessage("");
      try {
        const res = await axios.post(`${API_BASE_URL}/users/register`, values);
        toast.success("Registration Successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
        console.log("user registered successfully", res.data);
      } catch (e) {
        if (e.response && e.response.status === 400) {
          setErrorMessage(e.response.data.message || "Registration failed. Please try again.");
          toast.error(e.response.data.message || "Registration failed");
        } else {
          setErrorMessage("Something went wrong. Please try again later.");
          toast.error("Something went wrong. Please try again later.");
          console.log("error while registering", e.message);
        }
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen  righteous-regular bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(161,0,255,0.1),transparent_50%)] animate-pulse"></div>
      
      {/* Back to home button */}
      <Link
        to="/recipes"
        className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-all duration-200 group z-10"
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
        <span className="font-medium">Back</span>
      </Link>

      <div className="bg-gradient-to-br from-[#1a1a2e]/90 to-[#0f0f1a]/90 backdrop-blur-xl p-8 md:p-10 rounded-2xl shadow-2xl mt-6 w-full max-w-md border border-purple-500/20 relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-3xl md:text-4xl font-bold mb-2">
             <div
                className="
                    w-10 h-10
                    rounded-full
                    border-2 border-purple-600
                    flex items-center justify-center
                    overflow-hidden
                    transition-all duration-300 ease-out
                    hover:scale-110
                    hover:border-purple-400
                    hover:shadow-[0_0_12px_rgba(168,85,247,0.6)]
                    cursor-pointer
                  "
              >
                <img
                  src="/recipelogo.webp"
                  alt="Recipe Logo"
                  className="w-full h-full object-cover"
                ></img>
              </div>
             <span
            
            className="cursor-pointer bg-gradient-to-r from-[#A100FF] via-purple-400 to-pink-400 bg-clip-text text-transparent transition-all duration-300 ease-out
                    hover:scale-110
                    hover:border-purple-400">
              Recipe<span className="text-[#A100FF]">&lt;</span>Hub
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Create Account
          </h1>
          <p className="text-gray-400 text-sm">
            Join our community and start sharing your recipes
          </p>
        </div>

        <form className="space-y-6" onSubmit={formik.handleSubmit}>
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 text-sm text-center">{errorMessage}</p>
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Username
              </label>
              <input
                type="text"
                name="username"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.username}
                placeholder="Enter your username"
                className="w-full px-4 py-3 bg-[#0f0f1a]/50 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-white placeholder-gray-500 transition-all"
              />
              {formik.touched.username && formik.errors.username && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formik.errors.username}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                Email
              </label>
              <input
                type="email"
                name="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-[#0f0f1a]/50 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-white placeholder-gray-500 transition-all"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formik.errors.email}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 bg-[#0f0f1a]/50 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-white placeholder-gray-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0L7.05 7.05M6.29 6.29L3 3m3.29 3.29l3.29 3.29m7.532-7.532L21 3m-3.29 3.29L21 3m-3.29 3.29l-3.29-3.29" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formik.errors.password}
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 cursor-pointer text-white py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                  </svg>
                  Create Account
                </>
              )}
            </button>
            
            <p className="text-sm text-center font-light text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-purple-400 hover:text-purple-300 hover:underline transition-colors"
              >
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
export default Register;
