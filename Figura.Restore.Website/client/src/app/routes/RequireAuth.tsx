import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUserInfoQuery } from "../../features/account/accountApi";

export default function RequireAuth() {
  const { data: user, isLoading } = useUserInfoQuery();
  const location = useLocation();

  if (isLoading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="login" state={{ from: location }} />;
  }

  //we have to create roles so users will have restricted access to certain routes
  const adminRoutes = [
    //this route should be accessible to admin users only
    //only admin users can perform be changes on this route
    //project processes -> del create edit etc
    "/inventory",
    //not implemented
    "/admin-dashboard",
  ];

  //if use don't have the 'Admin' role but tries to acces the 'inventory' -> send back to home page
  if (
    adminRoutes.includes(location.pathname) &&
    !user.roles.includes("Admin")
  ) {
    //replace still points to '/' even if user clicks 'back' button
    return <Navigate to="/" replace />;
  }

  //is user has been logged in and the user data has been sent from user-info
  //then provide router outlet - full access
  //it then check in outlet routes added to element of auth
  //these pages are going to be secured by this component
  //if not authorised user will try to get to forbidden page - then he will be redirected to login page
  return <Outlet />;
}
