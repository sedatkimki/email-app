import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { useUser } from "./lib/queries/useUser";
import Loading from "./components/ui/loading";
import { Home } from "./pages/Home";

const PrivateRoutes = () => {
  const location = useLocation();
  const { user, isLoading, isError } = useUser();

  if (isLoading) {
    return <Loading />; // or loading indicator/spinner/etc
  }
  if (isError) {
    return <Navigate to="/login" replace state={{ from: location }} />; // or error message
  }

  return user ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

const routes = [
  {
    path: "/",
    element: <PrivateRoutes />,
    children: [
      {
        path: "/",
        element: <Navigate to="/inbox" replace />,
      },
      { path: "/:boxName", element: <Home /> },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    path: "*",
    element: <div>not found</div>,
  },
];

export const router = createBrowserRouter(routes);
