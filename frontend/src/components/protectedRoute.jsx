import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = ({user}) => {

    if (!user) {
        return <Navigate to="/"></Navigate> 
    }

    return <Outlet />;
};