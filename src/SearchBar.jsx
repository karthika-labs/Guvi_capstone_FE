


import { useFormik } from "formik";

function SearchBar({ handleSearch }) {
  const formik = useFormik({
    initialValues: { search: "" },
    validate: (values) => {
      let error = {};
      if (!values.search) error.search = "required";
      return error;
    },
    onSubmit: (values) => {
      handleSearch(values.search);
    },
  });

  return (
    <div className="righteous-regular flex justify-center items-center w-full">
      <form
        onSubmit={formik.handleSubmit}
        className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-96 lg:w-full "
      >
        <div className="relative w-full">
          <input
            name="search"
            onChange={formik.handleChange}
            value={formik.values.search}
            type="text"
            id="simple-search"
            placeholder="Search movie name..."
            className="w-full py-3 px-4 pl-12 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
            required
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-rose-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 cursor-pointer transition duration-300 hover:scale-115"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8.25 10.875a2.625 2.625 0 1 1 5.25 0 2.625 2.625 0 0 1-5.25 0Z" />
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.125 4.5a4.125 4.125 0 1 0 2.338 7.524l2.007 2.006a.75.75 0 1 0 1.06-1.06l-2.006-2.007a4.125 4.125 0 0 0-3.399-6.463Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <button
          type="submit"
          className="py-3 cursor-pointer transition duration-300 hover:scale-105 px-6 bg-rose-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
        >
          Search
        </button>
      </form>
    </div>
  );
}

export default SearchBar;
