"use client";

import React, { useState } from "react";
import { Layout } from "antd";
import Sidebar from "./Sidebar";
import HeaderBar from "./HeaderBar";
import MobileMenu from "./MobileMenu";
import { useMediaQuery } from "react-responsive";

const LayoutApp: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return isMobile ? (
    <MobileMenu>{children}</MobileMenu>
  ) : (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar collapsed={collapsed} />
      <Layout>
        <HeaderBar collapsed={collapsed} setCollapsed={setCollapsed} bgColor="white" />
        <Layout.Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: "white",
            borderRadius: 8,
          }}
        >
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

export default LayoutApp;
