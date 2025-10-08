"use client";

import React, { useEffect, useState } from "react";
import { Layout, Button, message } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

const { Header } = Layout;

interface HeaderBarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  bgColor: string;
}

interface PrayerTimes {
  Subuh: string;
  Dzuhur: string;
  Ashar: string;
  Maghrib: string;
  Isya: string;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ collapsed, setCollapsed, bgColor }) => {
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [cityName, setCityName] = useState<string>("");
  const [activePrayer, setActivePrayer] = useState<string>("");

  // ✅ Ambil jadwal sholat
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const cityCode = "1108"; // Jakarta
        const res = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${cityCode}/${today}`);
        if (!res.ok) throw new Error("Gagal mengambil jadwal sholat");
        const data = await res.json();
        setCityName(data.data.lokasi);
        setTimes({
          Subuh: data.data.jadwal.subuh,
          Dzuhur: data.data.jadwal.dzuhur,
          Ashar: data.data.jadwal.ashar,
          Maghrib: data.data.jadwal.maghrib,
          Isya: data.data.jadwal.isya,
        });
      } catch (error) {
        console.error(error);
        message.error("Gagal mengambil jadwal sholat");
      }
    };
    fetchPrayerTimes();
  }, []);

  // 🔔 Cek otomatis waktu salat
  const toTimestamp = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0).getTime();
  };

  useEffect(() => {
    if (!times) return;
    const checkPrayerTimes = () => {
      const now = Date.now();
      const tolerance = 30000;
      for (const [name, time] of Object.entries(times)) {
        if (Math.abs(now - toTimestamp(time)) <= tolerance) {
          playStaticAdzan(name);
        }
      }
    };
    const interval = setInterval(checkPrayerTimes, 15000);
    return () => clearInterval(interval);
  }, [times]);

  // 🔊 Putar file MP3
  const playStaticAdzan = (prayerName: string) => {
    const audioFile = prayerName === "Subuh" ? "/mp3/subuh.mp3" : "/mp3/adzan.mp3";
    const audio = new Audio(audioFile);
    audio.play().catch((err) => console.error("Gagal memutar adzan:", err));
    message.success(`🕌 Waktu ${prayerName} telah tiba — Memutar adzan...`);
  };

  // ✨ Deteksi waktu aktif
  useEffect(() => {
    if (!times) return;
    const getMinutes = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    const subuh = getMinutes(times.Subuh);
    const dzuhur = getMinutes(times.Dzuhur);
    const ashar = getMinutes(times.Ashar);
    const maghrib = getMinutes(times.Maghrib);
    const isya = getMinutes(times.Isya);

    let active = "";
    if (current >= subuh && current < dzuhur) active = "Subuh";
    else if (current >= dzuhur && current < ashar) active = "Dzuhur";
    else if (current >= ashar && current < maghrib) active = "Ashar";
    else if (current >= maghrib && current < isya) active = "Maghrib";
    else active = "Isya";

    setActivePrayer(active);
  }, [times]);

  // 🕌✨ Kubah Glassmorphism Style
  const highlightStyle = (label: string, time: string) => {
    const isActive = label === activePrayer;
    return (
      <span
        style={{
          display: "inline-block",
          padding: "8px 12px 5px",
          margin: "0 4px",
          background: isActive ? "rgba(255, 255, 255, 0.25)" : "transparent",
          border: isActive ? "1px solid rgba(255, 255, 255, 0.3)" : "none",
          color: isActive ? "#115620" : "#333",
          fontWeight: isActive ? 600 : 400,
          backdropFilter: isActive ? "blur(10px)" : "none",
          WebkitBackdropFilter: isActive ? "blur(10px)" : "none",
          boxShadow: isActive ? "0 4px 10px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.4)" : "none",
          borderTopLeftRadius: "50%",
          borderTopRightRadius: "50%",
          borderBottomLeftRadius: "8px",
          borderBottomRightRadius: "8px",
          transition: "all 0.3s ease",
        }}
      >
        {label} {time}
      </span>
    );
  };

  // 🕌 Teks berjalan
  const renderMarqueeText = () => {
    if (!times) return "⏳ Memuat jadwal sholat...";
    return (
      <>
        🕌 Jadwal Sholat {cityName} •{" "}
        {highlightStyle("Subuh", times.Subuh)} •{" "}
        {highlightStyle("Dzuhur", times.Dzuhur)} •{" "}
        {highlightStyle("Ashar", times.Ashar)} •{" "}
        {highlightStyle("Maghrib", times.Maghrib)} •{" "}
        {highlightStyle("Isya", times.Isya)} •
      </>
    );
  };

  return (
    <Header
      style={{
        padding: "0 16px",
        background: bgColor,
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Tombol Sidebar */}
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{ fontSize: "16px", width: 64, height: 64 }}
      />

      {/* Logo */}
      <div style={{ marginLeft: 16, fontWeight: "bold", fontSize: 18 }}>
        🚀 Ar-Hapalan
      </div>

      {/* Running Text dengan Masking Gradient */}
      <div className="marquee-wrapper">
        <div className="marquee-text">{renderMarqueeText()}</div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-200%);
          }
        }

        .marquee-wrapper {
          position: absolute;
          left: 180px;
          right: 0;
          overflow: hidden;
          mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
        }

        .marquee-text {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 25s linear infinite;
          font-size: 16px;
          font-weight: 600;
          color: #0f5132;
          background: linear-gradient(90deg, #d4edda, #c3e6cb, #d4edda);
          padding: 4px 12px;
          border-radius: 8px;
        }
      `}</style>
    </Header>
  );
};

export default HeaderBar;
