import React, { useState } from "react";
import { useFormik } from "formik";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [toast, setToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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
          setErrorMessage(e.response.data.message);
        } else {
          setErrorMessage("Something went wrong. Please try again later.");
          console.log("error while registering the user", e.message);
        }
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-indigo-200 flex  flex-col items-center justify-center p-4">
      {toast && (
        <div className="fixed top-5 right-4 bg-green-500 text-white px-4 py-2 rounded shadow">
          Login Successful!
        </div>
      )}
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-indigo-600 mb-6">
          Login Here!!
        </h1>

        <form className="space-y-5" onSubmit={formik.handleSubmit}>
          <div className="space-y-5">
            {errorMessage && (
              <p className="text-red-500 text-center mb-3">{errorMessage}</p>
            )}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                onChange={formik.handleChange}
                value={formik.values.email}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
              {formik.errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.email}
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                onChange={formik.handleChange}
                value={formik.values.password}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
              {formik.errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.password}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 cursor-pointer text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-all"
            >
              Login
            </button>
            <p className="text-sm font-light text-gray-500 ">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:underline "
              >
                Register Now!!
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
export default Login;
