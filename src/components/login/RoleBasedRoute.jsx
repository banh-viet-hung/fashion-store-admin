import React, { useContext } from "react";
import { Redirect, Route } from "react-router-dom";
import { AdminContext } from "@/context/AdminContext";

const RoleBasedRoute = ({ allowedRoles, component: Component, ...rest }) => {
    const { state } = useContext(AdminContext);
    const { adminInfo } = state;

    return (
        <Route
            {...rest}
            render={(props) =>
                adminInfo?.email && allowedRoles.includes(adminInfo.role) ? (
                    <Component {...props} />
                ) : (
                    <Redirect
                        to={{
                            pathname: "/dashboard",
                            state: { from: props.location },
                        }}
                    />
                )
            }
        />
    );
};

export default RoleBasedRoute; 