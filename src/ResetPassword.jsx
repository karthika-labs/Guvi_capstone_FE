import React, { useState } from "react";
import { useFormik } from "formik";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validate: (values) => {
      let errors = {};

      if (!values.password) {
        errors.password = "Password is required";
      } else if (values.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }

      if (!values.confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
      } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }

      return errors;
    },
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const res = await axios.post(
          `http://localhost:5001/users/resetPasswords/${token}`,
          { password: values.password }
        );
        toast.success(res.data.message || "Password reset successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (e) {
        if (e.response && e.response.status === 400) {
          toast.error(e.response.data.message || "Invalid or expired token");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
        console.log("Error resetting password:", e.message);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          Reset Password
        </h1>
        <p className="text-center text-gray-300 mb-6 text-sm">
          Enter your new password below
        </p>

        <form className="space-y-5" onSubmit={formik.handleSubmit}>
          <div>
            <label className="block text-gray-200 font-medium mb-2">
              New Password
            </label>
            <input
              type="password"
              name="password"
              onChange={formik.handleChange}
              value={formik.values.password}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none text-white placeholder-gray-400"
              placeholder="Enter new password"
            />
            {formik.errors.password && (
              <p className="text-red-300 text-sm mt-1">
                {formik.errors.password}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-200 font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              onChange={formik.handleChange}
              value={formik.values.confirmPassword}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none text-white placeholder-gray-400"
              placeholder="Confirm new password"
            />
            {formik.errors.confirmPassword && (
              <p className="text-red-300 text-sm mt-1">
                {formik.errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <p className="text-sm text-center text-gray-300">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-medium text-purple-300 hover:text-purple-200 hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;

