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

## 🛠️ Installation

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

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
This will start the Vite development server, typically at `http://localhost:5173`


## 🎨 Technologies Used

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

## Troubleshooting

1. **API connection failed**
   - Check if backend server is running
   - Verify `VITE_BACKEND_API_BASE_URL` in `.env`
   - Check browser console for CORS errors

2. **Build errors**
   - Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

3. **Styling issues**
   - Ensure Tailwind CSS is properly configured
   - Check if `@tailwindcss/vite` plugin is in `vite.config.js`

4. **Authentication issues**
   - Clear localStorage and try logging in again
   - Check if JWT token is being sent in API requests



This project is part of the Guvi Capstone project.
