"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Layout, Button } from "antd";
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

const CACHE_KEY = "prayer_cache";
const CACHE_DURATION = 12 * 60 * 60 * 1000;

const DEFAULT_CODE = "1108";

const HeaderBar: React.FC<HeaderBarProps> = ({ collapsed, setCollapsed, bgColor }) => {
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [cityName, setCityName] = useState("");
  const [loaded, setLoaded] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    return () => { mounted.current = false; };
  }, []);

  const fetchPrayerTimes = useCallback(async (code: string) => {
    const today = new Date().toISOString().split("T")[0];
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.date === today && parsed.code === code && (Date.now() - parsed.ts) < CACHE_DURATION) {
          if (mounted.current) {
            setTimes(parsed.times);
            setCityName(parsed.city);
            setLoaded(true);
          }
          return;
        }
      }
    } catch { /* ignore */ }

    try {
      const res = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${code}/${today}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const newTimes: PrayerTimes = {
        Subuh: data.data.jadwal.subuh,
        Dzuhur: data.data.jadwal.dzuhur,
        Ashar: data.data.jadwal.ashar,
        Maghrib: data.data.jadwal.maghrib,
        Isya: data.data.jadwal.isya,
      };
      if (mounted.current) {
        setTimes(newTimes);
        setCityName(data.data.lokasi);
        setLoaded(true);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            times: newTimes, city: data.data.lokasi, code, date: today, ts: Date.now(),
          }));
        } catch { /* ignore */ }
      }
    } catch {
      // ignore fetch error
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const today = new Date().toISOString().split("T")[0];
        if (parsed.date === today && (Date.now() - parsed.ts) < CACHE_DURATION) {
          setTimes(parsed.times);
          setCityName(parsed.city);
          setLoaded(true);
          return;
        }
      } catch { /* ignore */ }
    }
    fetchPrayerTimes(DEFAULT_CODE);
  }, [fetchPrayerTimes]);

  const marqueeText = !loaded
    ? ""
    : `Jadwal Sholat ${cityName} • Subuh ${times?.Subuh} • Dzuhur ${times?.Dzuhur} • Ashar ${times?.Ashar} • Maghrib ${times?.Maghrib} • Isya ${times?.Isya}`;

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
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{ fontSize: "16px", width: 64, height: 64 }}
      />

      <div style={{ marginLeft: 16, fontWeight: "bold", fontSize: 18 }}>
        Ar-Hapalan
      </div>

      <div className="marquee-wrapper">
        <div className="marquee-text">{marqueeText}</div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-200%); }
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
          visibility: ${loaded ? "visible" : "hidden"};
        }
      `}</style>
    </Header>
  );
};

export default HeaderBar;
