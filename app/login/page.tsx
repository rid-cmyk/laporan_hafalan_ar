"use client";

import React, { useState } from "react";
import { Input, Button } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import "./login.css";

export default function LoginPage() {
  const [passcode, setPasscode] = useState("");

  return (
    <div className="login-container">
      {/* 🌍 3D Floating Planet Background */}
      <div className="planet" />
      <div className="stars" />
      <div className="stars2" />

      {/* ✨ Glass Login Card */}
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h2 className="title">🌙 Ar-Hapalan</h2>
        <p className="subtitle">Masukkan 10-digit Passcode untuk masuk</p>

        <Input
          maxLength={10}
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="••••••••••"
          prefix={<LockOutlined />}
          size="large"
          className="passcode-input"
        />

        <Button type="primary" size="large" block className="login-button">
          Masuk
        </Button>
      </motion.div>

      {/* ✨ Islamic Footer */}
      <div className="footer">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</div>
    </div>
  );
}
