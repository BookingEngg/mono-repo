import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, FlexboxGrid, Text } from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import { logoutAuthUser } from "@/services/Login.service";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/auth";
// Components
import { Button } from "@/components/ui/button";
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

  // return (
  //   <div className="bg-red-500">
  //     <FlexboxGrid justify="end" align="middle">
  //       <FlexboxGridItem>
  //         <Button
  //           variant={"outline"}
  //           size={"sm"}
  //           className="mr-4"
  //           onClick={handleAuthUserLogout}
  //         >
  //           Logout
  //         </Button>
  //       </FlexboxGridItem>
  //       <FlexboxGridItem>
  //         {authUser.user?.user_profile_picture ? (
  //           <Avatar
  //             className={cx("sidenav-logo")}
  //             src={authUser.user?.user_profile_picture}
  //             alt="Profile Image"
  //             circle
  //             size="md"
  //           />
  //         ) : (
  //           <div className={cx("sidenav-custom-logo")}>
  //             <Text
  //               size="xxl"
  //               align="center"
  //               weight="extrabold"
  //               transform="capitalize"
  //             >
  //               {userNameLogo}
  //             </Text>
  //           </div>
  //         )}
  //       </FlexboxGridItem>
  //     </FlexboxGrid>
  //   </div>
  // );

  return (
    <div className="flex flex-row p-4 mb-4 mr-4 border-b border-#00043a dark:border-white-800">
      <span className="font-bold text-black dark:text-white">Tab Name</span>
      <div className="ml-auto">ICON</div>
    </div>
  )
};

export default Header;
