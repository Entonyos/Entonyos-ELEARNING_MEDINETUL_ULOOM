import React from "react";
import Sidebar from "./Sidebar";
import ChatBox from "../../components/ChatBox";
import "./common.css";

const Layout = ({ children }) => {
  return (
    <div className="dashboard-admin">
      <Sidebar />
      <div className="content">{children}</div>
      <ChatBox isAdmin={true} />
    </div>
  );
};

export default Layout;
