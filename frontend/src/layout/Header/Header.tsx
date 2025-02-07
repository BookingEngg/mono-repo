import { TRoutes } from "@/typings/common";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, FlexboxGrid, Nav } from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import { logoutAuthUser } from "@/services/Login.service";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/auth";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleAuthUserLogout = React.useCallback(async () => {
    dispatch(logout());
    const response = await logoutAuthUser();
    console.log("RESPO>>>>>>>>>>", response)
    if (response.status) {
      navigate("/login");
    }
  }, [logoutAuthUser, dispatch, navigate]);

  return (
    <div>
      <FlexboxGrid justify="end" align="middle">
        <FlexboxGridItem>
          <Button
            style={{ margin: "5px 10px" }}
            appearance="primary"
            onClick={handleAuthUserLogout}
          >
            Logout
          </Button>
        </FlexboxGridItem>
      </FlexboxGrid>
    </div>
  );
};

export default Header;
