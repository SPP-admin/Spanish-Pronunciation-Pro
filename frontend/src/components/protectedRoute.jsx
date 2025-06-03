import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = ({user}) => {
    console.log(user)

    if (!user) {
        return <Navigate to="/"></Navigate> 
    }

    return <Outlet />;
};