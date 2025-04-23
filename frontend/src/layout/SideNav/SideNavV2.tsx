import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { TRoutes } from "@/typings/common";

const SideNavV2 = (props: { routes: TRoutes[] }) => {
  const { routes } = props;
  console.log(routes);

  return (
    <Sidebar>
      <SidebarHeader>Header</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>Sidebar Item</SidebarGroup>
      </SidebarContent>
      <SidebarFooter>Footer</SidebarFooter>
    </Sidebar>
  );
};

export default SideNavV2;
