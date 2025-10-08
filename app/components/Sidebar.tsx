/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { Layout, Menu, Tooltip } from "antd";
import {
  DashboardOutlined,
  SettingFilled,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const pathname = usePathname();
  const router = useRouter();

  const getSelectedKey = () => {
    if (pathname === "/" || pathname.startsWith("/super-admin")) return "1";
    if (pathname.startsWith("/users")) return "2";
    if (pathname.startsWith("/settings")) return "3";
    return "";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      style={{ position: "relative", overflow: "hidden" }}
    >
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
          },
        ]}
      />

      {/* 🌿 Tombol Logout Bulat Melingkar */}
      <Tooltip title="Logout" placement="right">
        <div
          onClick={handleLogout}
          style={{
            position: "absolute",
            bottom: 30,
            left: "50%",
            transform: "translateX(-50%)",
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "radial-gradient(circle, #2ecc71, #f1c40f)", // hijau keemasan
            boxShadow: "0 0 20px 5px rgba(241, 196, 15, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            overflow: "hidden",
          }}
        >
          <LogoutOutlined style={{ fontSize: 22, color: "white", zIndex: 2 }} />

          {/* Tulisan Bismillah Melingkar */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "spin 8s linear infinite",
              zIndex: 1,
            }}
          >
            <svg viewBox="0 0 100 100" width="90" height="90">
              <defs>
                <path
                  id="circlePath"
                  d="M50,50 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0"
                />
              </defs>
              <text fill="white" fontSize="8" fontWeight="bold" letterSpacing="2">
                <textPath href="#circlePath" startOffset="0%">
                  B I S M I L L A H • B I S M I L L A H •
                </textPath>
              </text>
            </svg>
          </div>
        </div>
      </Tooltip>

      {/* Animasi CSS */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Sider>
  );
};

export default Sidebar;
