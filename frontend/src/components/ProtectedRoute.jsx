import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import checkUserToken from "../utils/checkUserToken";

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const authenticated = await checkUserToken();
            setIsAuthenticated(authenticated);
            setLoading(false);
        };

        checkAuth(); 
    }, []); 

    if (loading) {
        return <div>Loading...</div>; 
    }

  
    if (isAuthenticated === false) {
        return <Navigate to="/" />;
    }

   
    return children;
};

export default ProtectedRoute;