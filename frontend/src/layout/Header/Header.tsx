import React, { useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Dropdown, FlexboxGrid, Text } from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import { logoutAuthUser } from "@/services/Login.service";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/auth";
// Context
import CurrentRouteContext from "@/contextProvider/routeContext";
// Redux
import { useSelector } from "react-redux";
import { getAuthUser } from "@/store/auth";
// Style
import style from "./Header.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const authUser = useSelector(getAuthUser);

  const { currentRoute: selectedRoute } = useContext(CurrentRouteContext);

  const [currentTabName, setCurrentTabName] = React.useState<string>("");
  const dropdownRef = useRef(null);

  React.useEffect(() => {
    if (selectedRoute) {
      if (selectedRoute.handle?.identifier === "root") {
        setCurrentTabName(selectedRoute.label);
      } else {
        const parentRoute = selectedRoute.parent;
        setCurrentTabName(parentRoute?.label || "");
      }
    }
  }, [selectedRoute]);

  const handleAuthUserLogout = React.useCallback(async () => {
    dispatch(logout());
    const response = await logoutAuthUser();
    if (response.status) {
      navigate("/login");
    }
  }, [logoutAuthUser, dispatch, navigate]);

  return (
    <div className={cx("header-container")}>
      <FlexboxGrid justify="space-between" align="middle">
        <Text size="xxl" weight="bold">
          {currentTabName || ""}
        </Text>

        <FlexboxGrid align="middle">
          <FlexboxGridItem>
            <Dropdown
              ref={dropdownRef}
              placement="bottomEnd"
              renderToggle={(props, ref) => (
                <Avatar
                  {...props}
                  ref={ref}
                  className={cx("sidenav-logo")}
                  src={authUser.user?.user_profile_picture}
                  alt="Profile Image"
                  circle
                  size="md"
                />
              )}
            >
              <Dropdown.Item panel style={{ padding: 10, width: 200 }}>
                <strong>
                  {authUser.user?.first_name} {authUser.user?.last_name}
                </strong>
              </Dropdown.Item>
              <Dropdown.Separator />
              <Dropdown.Item onClick={() => navigate("/")}>
                Your profile
              </Dropdown.Item>
              <Dropdown.Item>Help</Dropdown.Item>
              <Dropdown.Separator />
              <Dropdown.Item onClick={handleAuthUserLogout}>
                <Text color="red">Sign out</Text>
              </Dropdown.Item>
            </Dropdown>
          </FlexboxGridItem>
        </FlexboxGrid>
      </FlexboxGrid>
    </div>
  );
};

export default Header;
