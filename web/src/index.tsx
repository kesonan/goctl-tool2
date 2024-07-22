import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./components/app/App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./i18n";
import Welcome from "./components/welcome/Welcome";
import NotFound from "./components/notfound/NotFound";
import Builder from "./components/api/Builder";
import Go from "./components/generator/go/Go";

const router = createBrowserRouter(
  [
    {
      path: "*",
      element: <NotFound />,
    },
    {
      path: "/",
      element: <Welcome />,
    },
    {
      path: "/",
      element: <App />,
      children: [
        {
          path: "api",
          children: [
            {
              path: "builder",
              element: <Builder />,
            },
          ],
        },
        {
          path: "generator",
          children: [
            {
              path: "go",
              element: <Go />,
            },
          ],
        },
      ],
    },
  ],
  { basename: "/" },
);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
