import React, { useEffect } from "react";
import api from "./Api/api";
import Routes from "./Routes/Routes"

function App() {
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.get('/me')
                .then((response) => {

                })
                .catch((error) => {
                    if (error.response.status === 401) {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                    }
                });
        }
    }, []);

    return (
        <>
            <Routes />
        </>
    )
}

export default App