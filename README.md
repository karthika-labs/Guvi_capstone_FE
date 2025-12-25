# Recipe Hub - Frontend

Modern, responsive frontend for Recipe Hub application built with React, Vite, and Tailwind CSS.

## Features

### User Authentication
- User Registration, Login, Logout, and Password Reset

### Recipe Management
- Create, View, Edit, and Delete recipes
- Upload images with recipes
- Recipes can be rated and commented on by users

### Search & Filter
- Advanced recipe search
- Filter by meal type and food preferences

### Social Features
- Like and favorite recipes
- Comment on and rate recipes
- Follow and unfollow other users

### User Profiles
- View and edit user profiles
- Display user recipes, favorites, and followers

### Week Planner
- Plan meals for the week using saved recipes

### Shopping List
- Automatically generate shopping lists from planned meals
- Shopping lists can be printed, downloaded, and shared

### Responsive Design
- Mobile-first and fully responsive UI using Tailwind CSS

### Image Gallery
- Swiper-based image carousel for recipe images

##  Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Backend API** running (see Backend README)

## Installation

1. **Navigate to the frontend directory**
   ```bash
   cd Guvi_capstone_FE
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory:
   ```env
   VITE_BACKEND_API_BASE_URL=http://localhost:5001
   ```
   Replace with your backend API URL if different.

## Running the Application

### Development Mode
```bash
npm run dev
```
This will start the Vite development server, typically at `http://localhost:5173`

## 📖 How to Use the Application

### Step 1: Register or Login
1. **Register a New Account**
   - Click on "Register" button in the navigation bar
   - Fill in your details: username, email, and password
   - Submit the form to create your account
   - You'll be automatically redirected to login after successful registration

2. **Login to Existing Account**
   - Click on "Login" button in the navigation bar
   - Enter your email and password
   - Click "Login" to access your account
   - You'll be redirected to the recipes page upon successful login

3. **Password Reset** (if needed)
   - Click "Forgot Password?" on the login page
   - Enter your registered email address
   - Check your email for the reset link
   - Follow the link to reset your password

### Step 2: View Recipes
1. **Browse All Recipes**
   - After logging in, you'll see the "All Recipes" tab by default
   - Browse through featured recipes displayed as cards
   - Each card shows recipe image, name, description, rating, and food preference
   - Use pagination at the bottom to navigate through pages

2. **View Recipe Details**
   - Click on any recipe card to view full details
   - See recipe images/video, ingredients, instructions, and description
   - View ratings and comments from other users
   - See the recipe creator's profile information

3. **View Your Recipes**
   - Click on "My Recipes" tab to see only your created recipes
   - View all recipes you've shared with the community

### Step 3: Search and Filter Recipes
1. **Search Recipes**
   - Click the search icon in the navigation bar
   - Choose search mode: "Recipe Name" or "Ingredients"
   - Enter your search term in the search box
   - Optionally filter by meal type (Breakfast, Lunch, Dinner)
   - Optionally filter by food preference (Veg, Non-Veg)
   - Click "Search Recipes" to see results
   - Use the cross icon to clear search and view all recipes

2. **Filter Search Results**
   - Search results work across both "All Recipes" and "My Recipes" tabs
   - When on "My Recipes" tab, search will only show your recipes matching the criteria
   - Search results persist across pagination

### Step 4: Add a New Recipe
1. **Create Recipe**
   - Click "Add Recipe" button in the navigation bar
   - Fill in the recipe form:
     - Recipe name (required)
     - Description (required)
     - Time duration (required)
     - Meal type: Select Breakfast, Lunch, or Dinner (required)
     - Food preference: Select Veg or Non-Veg (required)
     - Ingredients: Add ingredient name, quantity, and unit
     - Instructions: Add step-by-step cooking instructions
     - Upload photos: Add multiple recipe images
     - Upload video: Add a YouTube video URL (optional)
   - Click "Submit" to create your recipe
   - You'll be redirected to view your newly created recipe

2. **Edit Recipe**
   - Navigate to your recipe detail page
   - Click the "Edit" button (only visible to recipe owner)
   - Modify any fields as needed
   - Click "Update Recipe" to save changes

3. **Delete Recipe**
   - Navigate to your recipe detail page
   - Click the "Delete" button (only visible to recipe owner)
   - Confirm deletion in the modal
   - Recipe will be permanently deleted

### Step 5: Interact with Recipes
1. **Like Recipes**
   - Click the heart icon on any recipe card
   - Double-tap on recipe images to like
   - Like count is displayed on the recipe card

2. **Rate Recipes**
   - Go to a recipe detail page
   - Click on the stars (1-5) to rate the recipe
   - Your rating will be saved and displayed
   - You can update your rating by clicking a different star

3. **Comment on Recipes**
   - Scroll to the comments section on a recipe page
   - Type your comment in the text area
   - Click "Comment" to post
   - Edit or delete your own comments using the icons

4. **Favorite Recipes**
   - Click the bookmark icon on any recipe card
   - Access your favorites from the favorites icon in navigation
   - Click again to remove from favorites

### Step 6: Manage Your Profile
1. **View Profile**
   - Click on your profile picture/username in the navigation bar
   - View your profile information, recipes, favorites, and followers

2. **Edit Profile**
   - Go to your profile page
   - Click "Edit Profile" button
   - Update your name, bio, location, avatar, and dietary preferences
   - Save changes

3. **View Other Users' Profiles**
   - Click on any user's name or avatar
   - View their recipes, followers, and following
   - Follow/unfollow users from their profile

### Step 7: Plan Your Week
1. **Create Week Plan**
   - Click "Week Plans" in the navigation bar
   - Select a start date for your week
   - The system will create a 7-day meal plan

2. **Add Meals to Days**
   - Click on any meal slot (Breakfast, Lunch, Dinner) for a day
   - Select a recipe from the modal
   - Recipe will be added to that meal slot
   - Meals are filtered by meal type automatically

3. **Remove Meals**
   - Click the remove icon on any meal slot
   - Meal will be removed from your plan

4. **View Shopping List**
   - After adding meals, click "Generate Shopping List"
   - View automatically generated shopping list with all ingredients
   - Check off items as you shop
   - Print, download as PDF, or share the shopping list

### Step 8: Share Recipes
1. **Share Recipe Link**
   - Go to any recipe detail page
   - Click the "Share" button
   - Choose sharing method:
     - Copy link to clipboard
     - Share via WhatsApp
     - Share via Twitter
     - Share via Facebook
     - Use native share (mobile devices)
   - Recipe links are accessible without login

## Technologies Used

### Core
- **React 19.2.0**: UI library
- **React Router DOM 7.9.5**: Client-side routing
- **Vite 7.2.2**: Build tool and dev server

### Styling
- **Tailwind CSS 4.1.17**: Utility-first CSS framework
- **@tailwindcss/vite**: Tailwind integration with Vite

### State Management
- **React Context API**: Global state management
- **React Hooks**: useState, useEffect, useContext, etc.

### HTTP Client
- **Axios 1.13.2**: HTTP client for API requests

### Forms
- **Formik 2.4.9**: Form state management and validation

### UI Components & Icons
- **React Icons 5.5.0**: Icon library (Font Awesome, etc.)
- **Swiper 11.2.10**: Touch slider for image galleries
- **React Calendar 6.0.0**: Calendar component for week planner

### Notifications
- **React Toastify 11.0.5**: Toast notifications

### Additional Libraries
- **React-to-Print 3.2.0**: Print functionality
- **jspdf 3.0.4**: PDF generation
- **html2canvas 1.4.1**: HTML to canvas conversion
- **GSAP 3.13.0**: Animation library
- **Three.js 0.181.1**: 3D graphics (if used)

##  API Integration

The frontend communicates with the backend API. The base URL is configured in:
- `src/config/api.js`
- Environment variable: `VITE_BACKEND_API_BASE_URL`

All API calls are made through the `ApiContext` which provides:
- Authentication handling
- Token management
- Error handling
- Toast notifications

##  Key Features Implementation

### Authentication
- JWT token stored in localStorage
- Protected routes with authentication checks
- Automatic token refresh handling

### Recipe Features
- Image upload to Cloudinary
- Video embedding (YouTube)
- Rich text instructions
- Ingredient management
- Meal type and food preference filters

### Search
- Recipe name search
- Ingredient-based search
- Filter by meal type (Breakfast, Lunch, Dinner)
- Filter by food preference (Veg, Non-Veg)
- Search results pagination

### Social Features
- Like/Unlike recipes
- Add/Remove favorites
- Comment on recipes
- Rate recipes (1-5 stars)
- Follow/Unfollow users

### Week Planner
- Drag-and-drop meal planning
- Calendar view
- Shopping list generation
- Meal overlap detection

##  Styling

The application uses Tailwind CSS with:
- Custom color palette (purple, pink gradients)
- Responsive breakpoints
- Custom animations
- Dark theme optimized

##  Security Considerations

- JWT tokens stored in localStorage
- API calls include authentication headers
- Input validation on forms
- CORS handled by backend

##  Responsive Design

The application is fully responsive with breakpoints for:
- Mobile devices
- Tablets
- Desktop screens



This project is part of the Guvi Capstone project.
