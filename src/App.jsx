import { useState } from "react";

import "./App.css";
import Register from "./Register";
import Login from "./Login";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import RecipeForm from "./recipeForm";
import Home from "./Home";
import { ApiProvider } from "./context/ApiContext";
import FavoritesPage from "./FavoritesPage";
import WeekPlansDashboard from "./WeekPlanDashboard";
import WeekPlannerPage from "./WeekPlannerPage";
import { ToastContainer } from "react-toastify";
import ShoppingListPage from "./ShoppingListPage";
import ProfilePage from "./ProfilePage";

function App() {
  return (
    <Router>
      <ApiProvider>
          <ToastContainer/>
        <Routes>
          <Route path="/" element={<Navigate to="/register" />}></Route>
          <Route path="/register" element={<Register />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/recipes/new" element={<RecipeForm />}></Route>
          <Route path="/recipes" element={<Home />}></Route>
          <Route path="/favorites" element={<FavoritesPage />}></Route>
          <Route path="/weekplans" element={<WeekPlansDashboard />} />
          <Route path="/planner/:id" element={<WeekPlannerPage />} />
          <Route path="/planner/new" element={<WeekPlannerPage />} />
          <Route path="/planner/:id/list/:listId" element={<ShoppingListPage/>}/>
          <Route path="/profile/:userId?" element={<ProfilePage/>}></Route>
        </Routes>
      </ApiProvider>
    </Router>
  );
}

export default App;
