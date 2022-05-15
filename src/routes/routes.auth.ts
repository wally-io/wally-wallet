import React from "react";
import RoutePath from "./Route";

const Login = React.lazy(() => import("../views/Login"));
const CreateWallet = React.lazy(() => import("../views/CreateWallet"));
const ImportWallet = React.lazy(() => import("../views/ImportWallet"));

const routes: RoutePath[] = [
    {
        name: 'Login',
        path: '/',
        component: Login
    },
    {
        name: 'Create Wallet',
        path: '/login/create-wallet',
        component: CreateWallet
    },
    {
        name: 'Import Wallet',
        path: '/login/import-wallet',
        component: ImportWallet
    },
];

export default routes;