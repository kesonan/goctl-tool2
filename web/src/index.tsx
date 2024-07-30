import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./components/app/App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./i18n";
import Welcome from "./components/welcome/Welcome";
import NotFound from "./components/notfound/NotFound";
import Builder from "./components/api/Builder";
import Model from "./components/generator/model/Model";
import Datasource from "./components/generator/model/mysql/Datasource";
import Postgresql from "./components/generator/model/Postgresql";
import Mysql from "./components/generator/model/mysql/Mysql";
import DDL from "./components/generator/model/mysql/DDL";

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
              path: "model",
              element: <Model />,
              children: [
                {
                  element: <Mysql />,
                  index: true,
                },
                {
                  path: "mysql",
                  element: <Mysql />,
                },
                {
                  path: "postgresql",
                  element: <Postgresql />,
                },
              ],
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
