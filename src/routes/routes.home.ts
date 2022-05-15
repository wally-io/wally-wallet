import React from "react";
import RoutePath from "./Route";

const Home = React.lazy(() => import("../views/Home"));

const routes: RoutePath[] = [
    {
        name: 'Home',
        path: '/home',
        component: Home,
    },
];

export default routes;