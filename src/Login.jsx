import React, { useState } from "react";
import { useFormik } from "formik";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [sendingResetLink, setSendingResetLink] = useState(false);
  const [resetLinkSent, setResetLinkSent] = useState(false);
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validate: (values) => {
      let errors = {};

      if (!values.email) {
        errors.email = "email is Required";
      }
      if (!values.password) {
        errors.password = "password is Required";
      }
      return errors;
    },
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMessage("");
      try {
        const res = await axios.post("http://localhost:5001/users/login", values);
        
        // Check if response is successful (status 200-299)
        if (res.status >= 200 && res.status < 300 && res.data && res.data.token) {
          localStorage.setItem("token", res.data.token);
          setErrorMessage(""); // Clear any previous error messages
          toast.success("Login Successful! Redirecting...");
          setTimeout(() => {
            navigate('/recipes');
          }, 1000);
          console.log("user logged in successfully", res.data);
        } else {
          // Response doesn't have expected structure
          const errorMsg = res.data?.message || "Invalid response from server";
          setErrorMessage(errorMsg);
          toast.error(errorMsg);
        }
      } catch (e) {
        // Only handle actual errors
        if (e.response) {
          // Server responded with error status
          if (e.response.status === 400) {
            const errorMsg = e.response.data?.message || "Invalid email or password";
            setErrorMessage(errorMsg);
            toast.error(errorMsg);
            
            // Check if it's a password error and show forgot password option
            if (errorMsg.toLowerCase().includes("password") || errorMsg.toLowerCase().includes("invalid")) {
              // Password might be wrong, show reset option
              setTimeout(() => {
                setShowForgotPassword(true);
              }, 1500);
            }
          } else {
            const errorMsg = e.response.data?.message || "Something went wrong. Please try again later.";
            setErrorMessage(errorMsg);
            toast.error(errorMsg);
            console.log("error while logging in the user", e.response.status, e.response.data);
          }
        } else if (e.request) {
          // Request was made but no response received
          setErrorMessage("Network error. Please check your connection.");
          toast.error("Network error. Please check your connection.");
          console.log("network error", e.message);
        } else {
          // Something else happened
          setErrorMessage("Something went wrong. Please try again later.");
          toast.error("Something went wrong. Please try again later.");
          console.log("error while logging in the user", e.message);
        }
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a] flex flex-col items-center justify-center p-4 relative overflow-hidden">
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

      <div className="bg-gradient-to-br from-[#1a1a2e]/90 to-[#0f0f1a]/90 backdrop-blur-xl p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-purple-500/20 relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-3xl md:text-4xl font-bold mb-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-10 h-10 text-[#A100FF]" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span className="bg-gradient-to-r from-[#A100FF] via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Recipe<span className="text-[#A100FF]">&lt;</span>Hub
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome Back!
          </h1>
          <p className="text-gray-400 text-sm">
            Login to continue to Recipe Hub
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
                  Logging in...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login
                </>
              )}
            </button>
            
            {errorMessage && showForgotPassword && (
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-400 mb-3">
                  <strong>Forgot your password?</strong> We can send you a password reset link to your email.
                </p>
                {!resetLinkSent ? (
                  <div className="space-y-3">
                    <input
                      type="email"
                      value={forgotPasswordEmail || formik.values.email}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 bg-[#0f0f1a]/50 border border-yellow-500/30 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none text-white placeholder-gray-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const email = forgotPasswordEmail || formik.values.email;
                        if (!email) {
                          toast.error("Please enter your email address");
                          return;
                        }
                        setSendingResetLink(true);
                        try {
                          const res = await axios.post(
                            "http://localhost:5001/users/forgetPasswords",
                            { email }
                          );
                          toast.success(res.data.message || "Password reset link sent to your email!");
                          setResetLinkSent(true);
                        } catch (e) {
                          toast.error(
                            e.response?.data?.message || "Failed to send reset link. Please try again."
                          );
                        } finally {
                          setSendingResetLink(false);
                        }
                      }}
                      disabled={sendingResetLink}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-medium transition-all disabled:opacity-50 text-sm"
                    >
                      {sendingResetLink ? "Sending..." : "Send Password Reset Link"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setResetLinkSent(false);
                        setForgotPasswordEmail("");
                      }}
                      className="w-full text-sm text-gray-400 hover:text-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-green-400">
                    <p className="mb-2">✓ Password reset link has been sent to your email!</p>
                    <p className="text-xs text-gray-400">
                      Please check your inbox and click the link to reset your password. The link expires in 15 minutes.
                    </p>
                  </div>
                )}
              </div>
            )}

            <p className="text-sm text-center font-light text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-purple-400 hover:text-purple-300 hover:underline transition-colors"
              >
                Register Now
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
export default Login;
