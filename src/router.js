import { createBrowserRouter } from "react-router-dom";
import Signup from "./components/signup/signup";
import Login from "./components/login/login";
import NotFound from "./components/not-found/not-found";
import SessionLayout from "./components/shared/session-layout/session-layout";
import MainLayout from "./components/shared/main-layout/main-layout";
import Home from "./components/home/home";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <MainLayout>
        <Home />
      </MainLayout>
    ),
  },
  {
    path: "/login",
    element: (
      <SessionLayout>
        <Login />
      </SessionLayout>
    ),
  },
  {
    path: "/signup",
    element: (
      <SessionLayout>
        <Signup />
      </SessionLayout>
    ),
  },
  {
    path: "/not-found",
    element: (
      <SessionLayout>
        <NotFound />
      </SessionLayout>
    ),
  },
  {
    path: "*",
    element: (
      <SessionLayout>
        <NotFound />
      </SessionLayout>
    ),
  },
]);

export default router;
