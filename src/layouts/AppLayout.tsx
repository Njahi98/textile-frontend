import Navbar from "@/components/navbar";
import { Outlet } from "react-router-dom";


function AppLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default AppLayout;
