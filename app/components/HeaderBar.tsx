"use client";

import React from "react";
import { Layout, Button } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

const { Header } = Layout;

interface HeaderBarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  bgColor: string;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ collapsed, setCollapsed, bgColor }) => {
  return (
    <Header
      style={{
        padding: "0 16px",
        background: bgColor,
        display: "flex",
        alignItems: "center",
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{
          fontSize: "16px",
          width: 64,
          height: 64,
        }}
      />
      <div style={{ marginLeft: 16, fontWeight: "bold", fontSize: 18 }}>
        🚀 Ar-Hapalan
      </div>
    </Header>
  );
};

export default HeaderBar;
