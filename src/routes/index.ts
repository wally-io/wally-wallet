import React from "react";
import RoutePath from "./Route";

import routesAuth from "./routes.auth";
import routesHome from "./routes.home";

const Error404 = React.lazy(() => import("../views/404"));

const routes: RoutePath[] = [
    {name: 'Page 404', path: '/404', component: Error404},
    ...routesAuth,
    ...routesHome
];

export default routes;