// App.jsx
import ProtectedRoute from './component/ProtectedRoute';
import Home from './pages/home/Home';
import Login from './pages/login/Login';
import Profile from './pages/profile/Profile';
import Register from './pages/register/Register';
import Room from './pages/room/Room';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import RoomList from './pages/roomList/RoomList';


const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/room",
    element: (
      <ProtectedRoute>
        <Room />
      </ProtectedRoute>
    )
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    )
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    )
  },
  {
    path: "/roomlist",
    element: (
      <ProtectedRoute>
        <RoomList />
      </ProtectedRoute>
    )
  }
]);


function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
