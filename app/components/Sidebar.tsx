/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { Layout, Menu } from "antd";
import {
    DashboardOutlined,
    PlusOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  return (
    <Sider trigger={null} collapsible collapsed={collapsed}>
      {/* Logo */}
      <div
        style={{
          height: 64,
          margin: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          color: "white",
          fontWeight: "bold",
          fontSize: 18,
        }}
      >
        <img
          src="/quran.svg"
          alt="Logo"
          style={{ height: 32, marginRight: collapsed ? 0 : 8 }}
        />
        {!collapsed && "QuranApp"}
      </div>

      {/* Menu navigasi */}
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={["1"]}
        items={[
          {
            key: "1",
            icon: <DashboardOutlined />,
            label: "Dashboard",
          },
          {
              key: "2",
              icon: <UserOutlined />,
              label: "User",
              children: [
                {
                  key: "2-1",
                  icon: <PlusOutlined />,
                  label: "Add Users",
                },
                {
                  key: "2-2",
                  icon: <TeamOutlined />,
                  label: "Add Roles",
                },
              ],
            },
        ]}
      />
    </Sider>
  );
};

export default Sidebar;
