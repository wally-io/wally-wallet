import React, {Suspense} from 'react'
import './App.scss'
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom"
import routes from "./routes"

function App() {

    const loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

    return (
        <div className="App">
            <BrowserRouter>
                <Suspense fallback={loading()}>
                    <Routes>
                        {routes.map((route, idx) => {
                            return route.component ? (
                                <Route
                                    key={idx}
                                    path={route.path}
                                    element={
                                        <route.component/>
                                    }/>
                            ) : null
                        })}
                        <Route path="*" element={<Navigate replace to="/404"/>}/>
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </div>
    )
}

export default App
