"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  Verified,
  ExternalLink,
  Github,
  Monitor,
  Calendar,
  Heart,
  Loader2,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";

const CURATED_PORTRAITS = [
  "photo-1534528741775-53994a69daeb", // Original
  "photo-1517841905240-472988babdf9", // Girl model
  "photo-1539571696357-5a69c17a67c6", // Man in hoodie
  "photo-1524504388940-b1c1722653e1", // Girl fashion
  "photo-1507003211169-0a1dd7228f2d", // Man smiling
  "photo-1494790108377-be9c29b29330", // Girl smiling
  "photo-1500648767791-00dcc994a43e", // Man gritty
  "photo-1529626455594-4ff0802cfb7e", // Girl posing
];

const CURATED_BANNERS = [
  "photo-1557683311-eac922347aa1", // Purple Gradient
  "photo-1557682250-33bd709cbe85", // Blue Gradient
  "photo-1558591710-4b4a1ae0f04d", // Abstract texture
  "photo-1550684848-fac1c5b4e853", // Neon
  "photo-1567359781514-3b964e2b04d6", // Colorful liquid
  "photo-1618005182384-a83a8bd57fbe", // Abstract shapes
  "photo-1506318137071-a8e063b4b4bf", // Deep space
  "photo-1620121692029-d088224efc74", // Abstract render
];

const CURATED_PRODUCTS = [
  "photo-1555066931-4365d14bab8c", // Code
  "photo-1498050108023-c5249f4df085", // Tech
  "photo-1460925895917-afdab827c52f", // Marketing
  "photo-1581291518066-6ee16960098f", // UX
  "photo-1519389950473-47ba0277781c", // Collaboration
  "photo-1454165833968-3f8681f17ed3", // Growth
  "photo-1551434678-e076c223a692", // Team
  "photo-1551288049-bbbda5366a41", // Statistics
];

const ROLES = [
  "Criadores",
  "Empreendedores",
  "Mentores",
  "Designers",
  "Lojistas",
];

const ACTIONS = [
  { verb: "Venda", text: "produtos digitais" },
  { verb: "Divulgue", text: "seu melhor trabalho" },
  { verb: "Centralize", text: "toda sua audiência" },
  { verb: "Monetize", text: "sua expertise real" },
];

export function Hero() {
  const [username, setUsername] = useState("");
  const [availability, setAvailability] = useState<{
    available: boolean;
    message: string;
    suggestions?: string[];
  } | null>(null);
  const [checking, setChecking] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileImage, setProfileImage] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces"
  );
  const [bannerImage, setBannerImage] = useState(
    "https://images.unsplash.com/photo-1614851099511-773084f6911d?w=800&h=400&fit=crop"
  );
  const [product1Image, setProduct1Image] = useState(
    "https://images.unsplash.com/photo-1626785774573-4b799314346d?w=400&h=400&fit=crop"
  );
  const [product2Image, setProduct2Image] = useState(
  const [product2Image, setProduct2Image] = useState(
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=400&fit=crop"
  );
  const [currentTime, setCurrentTime] = useState("9:41");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ROLES.length); // Roles and Actions sync
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMounted(true);

    // Randomize Profile
    const randomPortraitId = CURATED_PORTRAITS[Math.floor(Math.random() * CURATED_PORTRAITS.length)];
    setProfileImage(`https://images.unsplash.com/${randomPortraitId}?w=400&h=400&fit=crop&crop=faces`);

    // Randomize Banner
    const randomBannerId = CURATED_BANNERS[Math.floor(Math.random() * CURATED_BANNERS.length)];
    setBannerImage(`https://images.unsplash.com/${randomBannerId}?w=800&h=400&fit=crop`);

    // Randomize unique Products with absolute fallback safety
    const shuffledProducts = [...CURATED_PRODUCTS].sort(() => Math.random() - 0.5);
    const p1 = shuffledProducts[0] || CURATED_PRODUCTS[0];
    const p2 = shuffledProducts[1] || CURATED_PRODUCTS[1];

    setProduct1Image(`https://images.unsplash.com/${p1}?w=600&h=600&fit=crop&q=80`);
    setProduct2Image(`https://images.unsplash.com/${p2}?w=600&h=600&fit=crop&q=80`);
  }, []);

  useEffect(() => {
    if (username.length < 3) {
      setAvailability(null);
      return;
    }

    const timer = setTimeout(async () => {
      setChecking(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(
          `${apiUrl}/profiles/check_username?username=${username.toLowerCase()}`
        );

        if (!res.ok) throw new Error("API Offline");

        const data = await res.json();

        if (data.available === false) {
          data.suggestions = data.suggestions || [
            `${username}pro`,
            `${username}hq`,
            `sou${username}`
          ];
        }

        setAvailability(data);
      } catch (err) {
        console.error("Error checking username:", err);
        // Fail-safe for local dev without backend
        if (username.toLowerCase() === "admin" || username.toLowerCase() === "vasta") {
          setAvailability({
            available: false,
            message: "indisponível",
            suggestions: [`${username}pro`, `${username}hq`, `sou${username}`]
          });
        } else {
          setAvailability({ available: true, message: "Disponível!" });
        }
      } finally {
        setChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const { openAuthModal } = useAuth();

  return (
    <section className="relative overflow-hidden border-b border-vasta-border pt-24 pb-20 md:pb-32 lg:pt-40 bg-vasta-bg">
      {/* Background radial gradients for depth */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.15),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.05),transparent_50%)]" />

      {/* Floating abstract decorative elements */}
      <div className="absolute top-20 left-10 h-24 w-24 rounded-full bg-vasta-primary/5 blur-2xl animate-pulse-soft" />
      <div className="absolute bottom-40 right-10 h-32 w-32 rounded-full bg-vasta-accent/5 blur-3xl animate-pulse-soft delay-500" />

      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 md:flex-row md:items-center lg:gap-24">
        {/* Left Side: Content */}
        <div
          className={`flex-1 space-y-8 text-center md:text-left transition-opacity duration-700 ${mounted ? "opacity-100" : "opacity-0"
            }`}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-vasta-primary/30 bg-vasta-primary/10 px-4 py-1.5 text-xs font-bold tracking-wide text-vasta-primary md:text-sm shadow-sm animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-vasta-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-vasta-primary"></span>
            </span>
            COMECE GRATUITAMENTE
          </div>

          <div className="space-y-6 animate-fade-in-up delay-100 fill-mode-forwards opacity-0 text-left">
            <h1 className="text-4xl xs:text-[2.75rem] font-black tracking-tighter text-vasta-text sm:text-7xl lg:text-8xl leading-[0.95] md:leading-[0.9]">
              A plataforma para <br className="hidden md:block" />
              <span key={ROLES[index]} className="gradient-title relative inline-block animate-fade-in-up">
                {ROLES[index]}.
                <div className="absolute -bottom-2 left-0 h-2 w-full bg-vasta-primary/20 blur-md rounded-full -z-10 animate-pulse-soft" />
              </span>
            </h1>
            <p className="max-w-xl text-lg text-vasta-muted md:text-xl leading-relaxed font-medium">
              A solução completa para sua marca.{" "}
              <span key={ACTIONS[index % ACTIONS.length].verb} className="text-vasta-text font-bold inline-block animate-fade-in">
                {ACTIONS[index % ACTIONS.length].verb}
              </span>{" "}
              {ACTIONS[index % ACTIONS.length].text} e escale seu negócio com o Vasta.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:mx-auto sm:max-w-md md:mx-0 animate-fade-in-up delay-200 fill-mode-forwards opacity-0">
            <div
              className={`group flex items-center gap-1 rounded-[2.5rem] border p-1 transition-all duration-300 shadow-lg hover:shadow-xl ${availability?.available
                  ? "border-emerald-500/50 bg-emerald-500/5 ring-4 ring-emerald-500/10"
                  : availability?.available === false
                    ? "border-red-500/50 bg-red-500/5 ring-4 ring-red-500/10"
                    : "border-vasta-border bg-vasta-surface-soft/80 ring-4 ring-vasta-border/20"
                }`}
            >
              <div className="flex flex-1 items-center pl-3 pr-1 py-1 min-w-0">
                <span className="text-sm font-bold text-vasta-muted shrink-0">
                  vasta.pro/
                </span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                  placeholder="seu-nome"
                  className="w-full bg-transparent px-1 text-sm font-bold text-vasta-text placeholder:text-vasta-muted/50 focus:outline-none min-w-0"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                />
                {checking && (
                  <Loader2 className="h-4 w-4 animate-spin text-vasta-primary shrink-0 ml-1" />
                )}
              </div>
              <button
                onClick={() => openAuthModal('signup', username ? `Criar minha conta como ${username}` : undefined)}
                className={`flex shrink-0 items-center justify-center gap-2 rounded-[2rem] px-4 py-2 sm:px-5 sm:py-3 text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg whitespace-nowrap ${availability?.available
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : "bg-vasta-text text-vasta-bg hover:bg-vasta-text-soft"
                  }`}
                disabled={
                  checking || (username.length > 0 && username.length < 3)
                }
              >
                {availability?.available ? "Garantir nome" : "Criar grátis"}
                <ArrowRight className="h-4 w-4 shrink-0" />
              </button>
            </div>

            <div className="min-h-[24px] px-4">
              {checking ? (
                <div className="flex items-center gap-2 text-xs font-bold text-vasta-muted animate-pulse">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Verificando disponibilidade...
                </div>
              ) : availability && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                  <div
                    className={`flex items-center gap-2 text-xs font-bold ${availability.available ? "text-emerald-500" : "text-red-500"
                      }`}
                  >
                    {availability.available ? (
                      <>
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
                          <Check className="h-3 w-3" />
                        </div>
                        <span>Excelente escolha! Garanta seu nome agora.</span>
                      </>
                    ) : (
                      <>
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/10">
                          <span className="text-[10px]">!</span>
                        </div>
                        <span>Puxa, este já tem dono. Tente uma alternativa abaixo:</span>
                      </>
                    )}
                  </div>

                  {!availability.available && availability.suggestions && (
                    <div className="flex flex-wrap gap-2 animate-in fade-in zoom-in-95 duration-500">
                      {availability.suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setUsername(suggestion)}
                          className="group flex items-center gap-1.5 rounded-full border border-vasta-border bg-vasta-surface/50 px-3 py-1.5 text-[10px] font-bold text-vasta-text transition-all hover:border-vasta-primary hover:text-vasta-primary hover:scale-105"
                        >
                          <Sparkles className="h-2.5 w-2.5 text-vasta-primary/40 group-hover:text-vasta-primary" />
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-bold text-vasta-muted md:justify-start">
              <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                <div className="rounded-full bg-emerald-500/10 p-1">
                  <Check className="h-3 w-3 text-emerald-500" />
                </div>
                <span>Plano Grátis para sempre</span>
              </div>
              <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                <div className="rounded-full bg-emerald-500/10 p-1">
                  <Check className="h-3 w-3 text-emerald-500" />
                </div>
                <span>Sem cartão de crédito</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Enhanced Phone Mockup */}
        <div className="flex flex-1 justify-center lg:justify-end perspective-[2000px]">
          <div className="relative group animate-float">
            {/* Glow behind phone */}
            <div className="absolute -inset-10 rounded-[4rem] bg-gradient-to-tr from-vasta-primary/40 to-vasta-accent/40 opacity-50 blur-3xl transition-opacity duration-1000 group-hover:opacity-70 dark:mix-blend-screen" />

            {/* Phone Frame - "Titanium" Look */}
            <div className="relative h-[680px] w-[340px] rounded-[3.5rem] bg-gradient-to-br from-gray-300 via-gray-100 to-gray-300 dark:from-gray-700 dark:via-gray-600 dark:to-gray-800 p-[4px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] ring-1 ring-black/10 transition-transform duration-500 hover:rotate-[-2deg] hover:scale-[1.01]">
              {/* Inner Frame Border */}
              <div className="absolute inset-0 rounded-[3.5rem] border-[6px] border-black/5 dark:border-black/20 pointer-events-none z-20" />
              {/* Screen Bezel */}
              <div className="h-full w-full rounded-[3.2rem] bg-black p-[10px] relative overflow-hidden">
                {/* Dynamic Island / Notch */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 h-8 w-28 bg-black z-50 rounded-full flex items-center justify-between px-3">
                  <div className="h-2 w-2 rounded-full bg-[#1c1c1e]/80" />{" "}
                  {/* Camera */}
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500/50 animate-pulse" />{" "}
                  {/* Privacy Indicator */}
                </div>

                {/* Actual Screen Content */}
                <div className="h-full w-full rounded-[2.8rem] bg-vasta-bg overflow-hidden relative flex flex-col">
                  {/* Status Bar Mock */}
                  <div className="absolute top-0 w-full h-14 flex justify-between px-8 pt-5 text-[10px] font-semibold z-40 mix-blend-difference text-white">
                    <span>{currentTime}</span>
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full border border-current opacity-80" />
                      <div className="h-3 w-3 rounded-full bg-current opacity-80" />
                    </div>
                  </div>

                  {/* Scrollable Content Area */}
                  <div className="flex-1 overflow-y-auto mockup-scrollbar pb-32">
                    {/* Banner */}
                    <div className="h-40 w-full relative overflow-hidden">
                      <img
                        src={bannerImage}
                        alt="Banner"
                        className="h-full w-full object-cover transform scale-105"
                      />
                      <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-vasta-bg to-transparent" />
                    </div>

                    {/* Profile Info */}
                    <div className="-mt-16 flex flex-col items-center px-6 relative z-10 animate-fade-in-up delay-100 fill-mode-forwards opacity-0">
                      <div className="h-28 w-28 rounded-full border-[6px] border-vasta-bg bg-vasta-surface shadow-xl flex items-center justify-center p-1 relative group-hover:scale-105 transition-transform duration-500">
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="h-full w-full rounded-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 h-7 w-7 bg-blue-500 rounded-full border-4 border-vasta-bg flex items-center justify-center">
                          <Verified className="h-3.5 w-3.5 text-white" />
                        </div>
                      </div>

                      <div className="mt-4 text-center">
                        <h2 className="text-xl font-bold text-vasta-text">
                          {username ? username.charAt(0).toUpperCase() + username.slice(1) : "Seu Nome"}
                        </h2>
                        <p className="text-sm font-medium text-vasta-muted">
                          @{username || "username"}
                        </p>
                      </div>

                      <p className="mt-4 text-center text-sm font-medium text-vasta-text/80 leading-relaxed max-w-[240px]">
                        Product Designer at Tech &bull; Compartilhando recursos
                        de UX/UI todos os dias ✨
                      </p>

                      {/* Social Row */}
                      <div className="flex gap-4 mt-6">
                        <div className="h-10 w-10 index-center rounded-full bg-vasta-surface border border-vasta-border flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-sm">
                          <Github className="h-5 w-5 text-vasta-text" />
                        </div>
                        <div className="h-10 w-10 index-center rounded-full bg-vasta-surface border border-vasta-border flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-sm">
                          <Monitor className="h-5 w-5 text-vasta-text" />
                        </div>
                        <div className="h-10 w-10 index-center rounded-full bg-vasta-surface border border-vasta-border flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-sm">
                          <ExternalLink className="h-5 w-5 text-vasta-text" />
                        </div>
                      </div>
                    </div>

                    {/* Links Section */}
                    <div className="mt-8 space-y-3 px-5 relative z-10">
                      {[
                        {
                          icon: Monitor,
                          label: "Meu Portfólio 2024",
                          sub: "Behance",
                        },
                        {
                          icon: Calendar,
                          label: "Mentoria de Carreira",
                          sub: "Agenda Aberta",
                        },
                        {
                          icon: ShoppingBag,
                          label: "Wallpapers Pack 8K",
                          sub: "Loja Vasta",
                        },
                      ].map((link, i) => (
                        <div
                          key={i}
                          className={`group flex w-full items-center gap-3 rounded-2xl bg-vasta-surface-soft/40 backdrop-blur-md border border-vasta-border/50 px-4 py-3.5 text-left transition-all hover:bg-vasta-surface-soft hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm animate-fade-in-up fill-mode-forwards opacity-0`}
                          style={{ animationDelay: `${300 + i * 100}ms` }}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vasta-bg shadow-sm group-hover:bg-vasta-primary/10 transition-colors">
                            <link.icon className="h-5 w-5 text-vasta-muted group-hover:text-vasta-primary transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-vasta-text truncate">
                              {link.label}
                            </div>
                            <div className="text-[10px] font-semibold text-vasta-muted uppercase tracking-wide">
                              {link.sub}
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-vasta-border group-hover:text-vasta-primary -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                      ))}
                    </div>

                    {/* Products/Grid Section */}
                    <div className="mt-8 px-5 pb-6 relative z-10 animate-fade-in-up delay-[600ms] fill-mode-forwards opacity-0">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-vasta-text/60">
                          Destaques
                        </span>
                        <div className="flex gap-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-vasta-primary" />
                          <div className="h-1.5 w-1.5 rounded-full bg-vasta-border" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col rounded-[1.5rem] bg-vasta-surface border border-vasta-border/50 p-0 hover:border-indigo-500/30 transition-colors cursor-pointer group/card overflow-hidden ring-1 ring-black/5">
                          {/* Image Area */}
                          <div className="aspect-square relative overflow-hidden bg-gray-100">
                            <img
                              src={product1Image}
                              alt="Product 1"
                              className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                            />
                          </div>

                          {/* Content Area */}
                          <div className="p-3">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[9px] font-bold text-vasta-muted uppercase tracking-wider">
                                E-book
                              </span>
                              <div className="h-5 w-5 rounded-full bg-vasta-bg flex items-center justify-center border border-vasta-border/50">
                                <ShoppingBag className="h-2.5 w-2.5 text-vasta-text/70" />
                              </div>
                            </div>
                            <div className="text-xs font-bold text-vasta-text leading-tight mb-2 line-clamp-2">
                              UI Design Mastery
                            </div>
                            <div className="text-[10px] font-bold text-vasta-text bg-vasta-bg px-2 py-0.5 rounded-full inline-block shadow-sm border border-vasta-border/50">
                              R$ 47
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col rounded-[1.5rem] bg-vasta-surface border border-vasta-border/50 p-0 hover:border-pink-500/30 transition-colors cursor-pointer group/card overflow-hidden ring-1 ring-black/5">
                          {/* Image Area */}
                          <div className="aspect-square relative overflow-hidden bg-gray-100">
                            <img
                              src={product2Image}
                              alt="Product 2"
                              className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                            />
                          </div>

                          {/* Content Area */}
                          <div className="p-3">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[9px] font-bold text-vasta-muted uppercase tracking-wider">
                                Curso
                              </span>
                              <div className="h-5 w-5 rounded-full bg-vasta-bg flex items-center justify-center border border-vasta-border/50">
                                <Monitor className="h-2.5 w-2.5 text-vasta-text/70" />
                              </div>
                            </div>
                            <div className="text-xs font-bold text-vasta-text leading-tight mb-2 line-clamp-2">
                              Framer Zero to Hero
                            </div>
                            <div className="text-[10px] font-bold text-vasta-text bg-vasta-bg px-2 py-0.5 rounded-full inline-block shadow-sm border border-vasta-border/50">
                              R$ 197
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Logo Footer */}
                    <div className="mt-6 flex justify-center pb-8 opacity-40 hover:opacity-100 transition-opacity">
                      <div className="flex items-center">
                        <img src="/logo.svg" alt="Vasta Logo" className="h-6 w-auto dark:hidden" />
                        <img src="/logo_branca.svg" alt="Vasta Logo" className="h-6 w-auto hidden dark:block grayscale" />
                      </div>
                    </div>
                  </div>

                  {/* Floating Action Button / Notification */}
                  <div className="absolute bottom-10 inset-x-0 flex justify-center z-50 px-4">
                    <div className="bg-vasta-surface/95 backdrop-blur-xl border border-vasta-border/50 text-vasta-text pl-1.5 pr-4 py-1.5 rounded-full flex items-center gap-2 shadow-2xl animate-fade-in-up delay-[1000ms] fill-mode-forwards opacity-0 w-max max-w-full overflow-hidden">
                      <div className="flex -space-x-2 shrink-0">
                        {[CURATED_PORTRAITS[0], CURATED_PORTRAITS[1], CURATED_PORTRAITS[2]].map((id, i) => (
                          <div key={i} className="h-4 w-4 rounded-full border border-vasta-surface overflow-hidden">
                            <img
                              src={`https://images.unsplash.com/${id}?w=40&h=40&fit=crop`}
                              alt="User"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0 pr-1">
                        <span className="text-[8px] font-black text-vasta-text whitespace-nowrap uppercase tracking-tight">
                          28 buscas hoje
                        </span>
                        <div className="h-0.5 w-0.5 rounded-full bg-vasta-muted/40 shrink-0" />
                        <span className="text-[8px] font-bold text-vasta-muted/80 whitespace-nowrap">
                          SP
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Side Buttons (Physical) */}
              <div className="absolute -left-[5px] top-24 h-8 w-[4px] rounded-l-md bg-gray-400 dark:bg-gray-600" />{" "}
              {/* Mute */}
              <div className="absolute -left-[5px] top-36 h-14 w-[4px] rounded-l-md bg-gray-400 dark:bg-gray-600" />{" "}
              {/* Vol Up */}
              <div className="absolute -left-[5px] top-52 h-14 w-[4px] rounded-l-md bg-gray-400 dark:bg-gray-600" />{" "}
              {/* Vol Down */}
              <div className="absolute -right-[5px] top-40 h-20 w-[4px] rounded-r-md bg-gray-400 dark:bg-gray-600" />{" "}
              {/* Power */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
