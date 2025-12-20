import React, { useState } from "react";
import { useFormik } from "formik";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {
  const [toast, setToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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
      try {
        const res = await axios.post("http://localhost:5001/users/login", values);
        localStorage.setItem("token", res.data.token);
        setToast(true);
        setTimeout(() => {
            navigate('/recipes')
          setToast(false);
        }, 1000);

        console.log("user registered successfully", res.data);
      } catch (e) {
        if (e.response && e.response.status === 400) {
          const errorMsg = e.response.data.message || "Invalid email or password";
          setErrorMessage(errorMsg);
          
          // Check if it's a password error and show forgot password option
          if (errorMsg.toLowerCase().includes("password") || errorMsg.toLowerCase().includes("invalid")) {
            // Password might be wrong, show reset option
            setTimeout(() => {
              setShowForgotPassword(true);
            }, 1500);
          }
        } else {
          setErrorMessage("Something went wrong. Please try again later.");
          console.log("error while registering the user", e.message);
        }
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4">
      {toast && (
        <div className="fixed top-5 right-4 bg-green-500 text-white px-4 py-2 rounded shadow z-50">
          Login Successful!
        </div>
      )}
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          Welcome Back!
        </h1>
        <p className="text-center text-gray-300 mb-6 text-sm">
          Login to continue to Recipe Hub
        </p>

        <form className="space-y-5" onSubmit={formik.handleSubmit}>
          <div className="space-y-5">
            {errorMessage && (
              <p className="text-red-500 text-center mb-3">{errorMessage}</p>
            )}
            <div>
              <label className="block text-gray-200 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                onChange={formik.handleChange}
                value={formik.values.email}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none text-white placeholder-gray-400"
                placeholder="Enter your email"
              />
              {formik.errors.email && (
                <p className="text-red-300 text-sm mt-1">
                  {formik.errors.email}
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-200 font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                onChange={formik.handleChange}
                value={formik.values.password}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none text-white placeholder-gray-400"
                placeholder="Enter your password"
              />
              {formik.errors.password && (
                <p className="text-red-300 text-sm mt-1">
                  {formik.errors.password}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 cursor-pointer text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
            >
              Login
            </button>
            
            {errorMessage && showForgotPassword && (
              <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                <p className="text-sm text-yellow-800 mb-3">
                  <strong>Forgot your password?</strong> We can send you a password reset link to your email.
                </p>
                {!resetLinkSent ? (
                  <div className="space-y-3">
                    <input
                      type="email"
                      value={forgotPasswordEmail || formik.values.email}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none text-sm"
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
                      className="w-full text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-green-700">
                    <p className="mb-2">✓ Password reset link has been sent to your email!</p>
                    <p className="text-xs text-gray-600">
                      Please check your inbox and click the link to reset your password. The link expires in 15 minutes.
                    </p>
                  </div>
                )}
              </div>
            )}

            <p className="text-sm text-center font-light text-gray-300">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-purple-300 hover:text-purple-200 hover:underline"
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
