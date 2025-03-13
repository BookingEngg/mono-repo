import { TRoutes } from "@/typings/common";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Button, FlexboxGrid, Nav, Text } from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import { logoutAuthUser } from "@/services/Login.service";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/auth";
// Redux
import { useSelector } from "react-redux";
import { getAuthUser } from "@/store/auth";
// Style
import style from "./Header.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);

const Header = () => {
  const authUser = useSelector(getAuthUser);
  const userNameLogo =
    (authUser.user?.first_name.charAt(0) || "") +
    (authUser.user?.last_name.charAt(0) || "");

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleAuthUserLogout = React.useCallback(async () => {
    dispatch(logout());
    const response = await logoutAuthUser();
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
        <FlexboxGridItem>
          {authUser.user?.user_profile_picture ? (
            <Avatar
              className={cx("sidenav-logo")}
              src={authUser.user?.user_profile_picture}
              alt="Profile Image"
              circle
              size="md"
            />
          ) : (
            <div className={cx("sidenav-custom-logo")}>
              <Text
                size="xxl"
                align="center"
                weight="extrabold"
                transform="capitalize"
              >
                {userNameLogo}
              </Text>
            </div>
          )}
        </FlexboxGridItem>
      </FlexboxGrid>
    </div>
  );
};

export default Header;
