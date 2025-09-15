/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  PlusOutlined,
  SettingFilled,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const pathname = usePathname();

  const getSelectedKey = () => {
    if (pathname === "/") return "1";
    if (pathname.startsWith("/users")) return "2-1";
    if (pathname.startsWith("/roles")) return "2-2";
    return "";
  };

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
        {!collapsed && "Ar-Hapalan"}
      </div>

      {/* Menu navigasi */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={[
          {
            key: "1",
            icon: <DashboardOutlined />,
            label: <Link href="/">Dashboard</Link>,
          },
          {
            key: "2",
            icon: <UserOutlined />,
            label: "User",
            children: [
              {
                key: "2-1",
                icon: <PlusOutlined />,
                label: <Link href="/users">Add Users</Link>,
              },
              {
                key: "2-2",
                icon: <TeamOutlined />,
                label: <Link href="/roles">Add Roles</Link>,
              },
            ],
          },
          {
            key: "3",
            icon: <SettingFilled />,
            label: <Link href="/settings">Settings</Link>,
          }
        ]}
      />
    </Sider>
  );
};

export default Sidebar;
