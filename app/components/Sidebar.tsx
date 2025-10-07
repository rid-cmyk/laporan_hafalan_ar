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
    if (pathname === "/" || pathname.startsWith("/super-admin")) return "1";
    if (pathname.startsWith("/users")) return "2";
    if (pathname.startsWith("/settings")) return "3";
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
            label: <Link href="/super-admin">Dashboard</Link>,
          },
          {
            key: "2",
            icon: <UserOutlined />,
            label: <Link href="/users">Users</Link>,
          },
          {
            key: "3",
            icon: <SettingFilled />,
            label: "Settings",
            children: [
              {
                key: "3-1",
                label: <Link href="/settings/raport">Raport</Link>,
              },
              {
                key: "3-2",
                label: <Link href="/settings/tahun-ajaran">Tahun Ajaran</Link>,
              },
              {
                key: "3-3",
                label: <Link href="/settings/backup-database">Backup Database</Link>,
              },
            ],
          }
        ]}
      />
    </Sider>
  );
};

export default Sidebar;
