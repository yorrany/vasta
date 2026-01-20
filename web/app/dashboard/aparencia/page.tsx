"use client";

import { useState, useEffect } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../../lib/canvasUtils";
import {
  Camera,
  Image as ImageIcon,
  Search,
  X,
  Loader2,
  Check,
  Sparkles,
  RefreshCcw,
  Palette,
  Type,
  Layout,
  Plus,
  Lock,
} from "lucide-react";
import { createClient } from "../../../lib/supabase/client";
import { useAuth } from "../../../lib/AuthContext";

import { useAppearance, useConfirm } from "../layout";



export default function AparenciaPage() {
  const { settings, updateSettings } = useAppearance();
  const { confirm } = useConfirm();
  const { user } = useAuth();
  const [isUnsplashOpen, setIsUnsplashOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unsplashResult, setUnsplashResult] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Username Logic
  const [isUsernameLocked, setIsUsernameLocked] = useState(true);
  const [usernameInput, setUsernameInput] = useState("");
  const [availability, setAvailability] = useState<{
    available: boolean;
    message: string;
    suggestions?: string[];
  } | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (settings.username && usernameInput === "") {
      setUsernameInput(settings.username);
    }
  }, [settings.username]);

  useEffect(() => {
    if (
      !usernameInput ||
      usernameInput === settings.username ||
      usernameInput.length < 3
    ) {
      setAvailability(null);
      return;
    }

    const timer = setTimeout(async () => {
      setChecking(true);
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(
          `${apiUrl}/profiles/check_username?username=${usernameInput.toLowerCase()}`,
        );

        if (!res.ok) throw new Error("API Offline");

        const data = await res.json();

        if (data.available === false) {
          data.suggestions = data.suggestions || [
            `${usernameInput}pro`,
            `${usernameInput}hq`,
            `sou${usernameInput}`,
          ];
        }

        setAvailability(data);
      } catch (err) {
        // Suppress critical error for network failures (backend likely offline)
        console.warn("API Offline: Defaulting username to available.");
        setAvailability({ available: true, message: "Disponível!" });
      } finally {
        setChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [usernameInput, settings.username]);

  // Crop State
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [croppingImage, setCroppingImage] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  const supabase = createClient();

  const handleUnsplashSearch = async (
    e?: React.FormEvent,
    overrideQuery?: string,
  ) => {
    e?.preventDefault();
    const query = overrideQuery || searchQuery;
    if (!query) return;

    setIsSearching(true);
    try {
      const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
      console.log("Searching Unsplash with Key:", accessKey ? "Present" : "Missing", "Query:", query);

      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&client_id=${accessKey}&per_page=12`,
      );

      if (!res.ok) {
        console.error("Unsplash API Error:", res.status, res.statusText);
        const errorData = await res.json();
        console.error("Unsplash Error Details:", errorData);
        return;
      }

      const data = await res.json();
      console.log("Unsplash Data:", data);
      setUnsplashResult(data.results || []);
    } catch (error) {
      console.error("Error searching Unsplash:", error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (isUnsplashOpen && unsplashResult.length === 0) {
      // Fetch initial suggestions without setting the search input
      handleUnsplashSearch(undefined, "minimal wallpaper");
    }
  }, [isUnsplashOpen]);

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const performUpload = async (
    file: File | Blob,
    type: "profile" | "cover",
  ) => {
    if (!user) return;
    setUploading(true);

    try {
      const fileExt =
        type === "profile"
          ? "jpg"
          : file instanceof File
            ? file.name.split(".").pop()
            : "jpg";
      const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          contentType: type === "profile" ? "image/jpeg" : undefined,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Add timestamp to force refresh if URL is same (though filename changes so it should be fine)
      const finalUrl = `${publicUrl}?t=${Date.now()}`;

      if (type === "profile") {
        updateSettings({ profileImage: finalUrl });
      } else {
        updateSettings({ coverImage: finalUrl });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      confirm({
        title: "Erro no Upload",
        description:
          'Erro ao fazer upload da imagem. Verifique se o bucket "avatars" existe e é público.',
        variant: "danger",
        confirmText: "OK",
        onConfirm: () => { },
      });
    } finally {
      setUploading(false);
      setIsCropOpen(false);
      setCroppingImage(null);
    }
  };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "cover",
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      confirm({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 5MB.",
        variant: "info",
        confirmText: "Entendi",
        onConfirm: () => { },
      });
      return;
    }

    if (type === "profile") {
      // Start Cropping Flow
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setCroppingImage(reader.result?.toString() || null);
        setIsCropOpen(true);
      });
      reader.readAsDataURL(file);
    } else {
      // Direct Upload for Cover
      performUpload(file, "cover");
    }
  };

  const handleCropConfirm = async () => {
    if (!croppingImage || !croppedAreaPixels) return;

    try {
      const croppedBlob = await getCroppedImg(croppingImage, croppedAreaPixels);
      if (croppedBlob) {
        await performUpload(croppedBlob, "profile");
      }
    } catch (e) {
      console.error(e);
      confirm({
        title: "Erro no Crop",
        description: "Erro ao cortar a imagem.",
        variant: "danger",
        confirmText: "OK",
        onConfirm: () => { },
      });
    }
  };

  const handleReset = () => {
    confirm({
      title: "Resetar Aparência",
      description:
        "Tem certeza que deseja resetar toda a aparência do perfil? Isso não pode ser desfeito.",
      variant: "danger",
      confirmText: "Resetar",
      onConfirm: () => {
        updateSettings({
          profileImage: null,
          coverImage: null,
          accentColor: "#6366F1", // @vasta-ux-exception: Default State Value
          bgColor: null,
          typography: "Inter",
          linkStyle: "glass",
          theme: "adaptive",
          username: "seunome",
          bio: "Sua bio inspiradora",
        });
      },
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-32">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vasta-text uppercase tracking-tight">
            Personalização da Página
          </h1>
          <p className="text-xs font-bold text-vasta-muted uppercase tracking-widest mt-1">
            Deixe seu perfil com a sua cara
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-vasta-surface-soft border border-vasta-border text-xs font-bold text-vasta-muted hover:text-vasta-text hover:bg-vasta-surface hover:border-vasta-muted transition-all"
        >
          <RefreshCcw size={16} />
          <span className="uppercase tracking-wider">Resetar</span>
        </button>
      </header>

      {/* Mídias do Perfil */}
      <section className="animate-fade-in [animation-delay:100ms] space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vasta-primary/10 text-vasta-primary">
            <ImageIcon size={18} />
          </div>
          <h3 className="text-sm font-bold text-vasta-text uppercase tracking-wider">
            Mídias do Perfil
          </h3>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Cover Photo */}
          <div className="group relative overflow-hidden rounded-3xl border border-vasta-border bg-vasta-surface p-1 shadow-card transition-all hover:shadow-xl">
            <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-vasta-surface-soft">
              {settings.coverImage ? (
                <img
                  src={settings.coverImage}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt="Capa"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-vasta-primary/10 to-vasta-accent/10">
                  <ImageIcon className="h-10 w-10 text-vasta-muted/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-2">
                <button
                  onClick={() => setIsUnsplashOpen(true)}
                  className="rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-black hover:bg-white shadow-lg flex items-center gap-2"
                >
                  <Search size={14} /> Buscar no Unsplash
                </button>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-vasta-text">
                  Capa do Perfil
                </h4>
                <p className="text-xs text-vasta-muted">
                  Recomendado: 1200x400px
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsUnsplashOpen(true)}
                  className="p-2 rounded-xl bg-vasta-surface-soft text-vasta-text hover:bg-vasta-border transition-colors border border-vasta-border"
                >
                  <Search size={16} />
                </button>
                <label className="p-2 rounded-xl bg-vasta-primary text-white hover:bg-vasta-primary-soft transition-colors cursor-pointer shadow-md shadow-vasta-primary/10">
                  <ImageIcon size={16} />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleUpload(e, "cover")}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Profile Photo */}
          <div className="group relative overflow-hidden rounded-3xl border border-vasta-border bg-vasta-surface p-1 shadow-card transition-all hover:shadow-xl">
            <div className="p-6 flex flex-col items-center justify-center">
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-4 border-vasta-surface bg-vasta-surface-soft shadow-xl overflow-hidden mb-4">
                  {settings.profileImage ? (
                    <img
                      src={settings.profileImage}
                      className="h-full w-full object-cover"
                      alt="Avatar"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-tr from-vasta-primary to-vasta-accent">
                      <ImageIcon className="h-8 w-8 text-white/50" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-4 right-0 p-2 rounded-full bg-vasta-primary text-white shadow-lg cursor-pointer border-2 border-vasta-surface hover:scale-110 transition-transform">
                  <Camera size={14} />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleUpload(e, "profile")}
                  />
                </label>
              </div>
              <div className="text-center">
                <h4 className="text-sm font-bold text-vasta-text">
                  Foto de Perfil
                </h4>
                <p className="text-xs text-vasta-muted">PNG, JPG até 5MB</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Informações do Perfil */}
      <section className="animate-fade-in [animation-delay:150ms] space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vasta-primary/10 text-vasta-primary">
            <Sparkles size={18} />
          </div>
          <h3 className="text-sm font-bold text-vasta-text uppercase tracking-wider">
            Informações do Perfil
          </h3>
        </div>

        <div className="rounded-[2.5rem] border border-vasta-border bg-vasta-surface p-2 shadow-card">
          <div className="grid gap-12 p-8 lg:grid-cols-2">
            {/* Username Field */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-4 px-1">
                <label className="text-[11px] font-bold text-vasta-muted uppercase tracking-[0.2em]">
                  Seu Link Vasta
                </label>
                {!isUsernameLocked &&
                  availability?.available &&
                  usernameInput !== settings.username && (
                    <span className="text-[10px] font-bold text-emerald-500 animate-pulse bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Disponível
                    </span>
                  )}
              </div>

              <div
                className={`group relative flex items-center rounded-2xl border-2 transition-all duration-300 min-h-[64px] ${isUsernameLocked
                  ? "border-vasta-border bg-vasta-surface-soft/40 hover:bg-vasta-surface-soft/60"
                  : usernameInput === settings.username
                    ? "border-vasta-border bg-vasta-surface-soft"
                    : checking
                      ? "border-vasta-primary/50 bg-vasta-surface-soft"
                      : availability?.available
                        ? "border-emerald-500/30 bg-emerald-500/5 ring-4 ring-emerald-500/10"
                        : "border-red-500/30 bg-red-500/5 ring-4 ring-red-500/10"
                  }`}
              >
                <div className="flex items-center pl-5 pr-1 text-vasta-muted select-none font-semibold text-sm">
                  vasta.pro/
                </div>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) =>
                    setUsernameInput(
                      e.target.value.toLowerCase().replace(/\s+/g, ""),
                    )
                  }
                  placeholder="seu-nome"
                  readOnly={isUsernameLocked}
                  className={`flex-1 bg-transparent py-4 pr-28 text-sm font-bold text-vasta-text placeholder:text-vasta-muted/20 focus:outline-none h-full transition-opacity ${isUsernameLocked ? "cursor-default opacity-90" : ""}`}
                  spellCheck={false}
                />

                <div className="absolute right-3 flex items-center gap-2">
                  {isUsernameLocked ? (
                    <button
                      onClick={() => setIsUsernameLocked(false)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-vasta-surface border border-vasta-border text-[11px] font-bold text-vasta-muted hover:text-vasta-primary hover:border-vasta-primary transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                      <Lock size={12} />
                      <span>Editar</span>
                    </button>
                  ) : checking ? (
                    <div className="p-2">
                      <Loader2
                        className="animate-spin text-vasta-primary"
                        size={18}
                      />
                    </div>
                  ) : usernameInput !== settings.username &&
                    usernameInput.length >= 3 ? (
                    availability?.available ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setUsernameInput(settings.username || "");
                            setIsUsernameLocked(true);
                            setAvailability(null);
                          }}
                          className="p-2.5 rounded-xl text-vasta-muted hover:bg-vasta-surface hover:text-red-400 transition-colors"
                          title="Cancelar"
                        >
                          <X size={16} />
                        </button>
                        <button
                          onClick={() => {
                            updateSettings({ username: usernameInput });
                            setIsUsernameLocked(true);
                          }}
                          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                        >
                          <Check size={16} /> <span>Salvar</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-2.5 text-red-500 bg-red-500/10 rounded-xl">
                        <X size={18} />
                      </div>
                    )
                  ) : (
                    <button
                      onClick={() => {
                        setUsernameInput(settings.username || "");
                        setIsUsernameLocked(true);
                      }}
                      className="p-2.5 rounded-xl text-vasta-muted hover:bg-vasta-surface transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Feedback & Suggestions */}
              <div className="min-h-[24px] mt-2 px-1">
                {!isUsernameLocked &&
                  !checking &&
                  availability &&
                  !availability.available &&
                  usernameInput !== settings.username && (
                    <div className="space-y-3 animate-slide-down">
                      <p className="text-[11px] font-medium text-red-400/80 flex items-center gap-1.5">
                        Username indisponível. Sugestões:
                      </p>
                      {availability.suggestions && (
                        <div className="flex flex-wrap gap-2">
                          {availability.suggestions.map((s) => (
                            <button
                              key={s}
                              onClick={() => setUsernameInput(s)}
                              className="px-3 py-1.5 rounded-lg bg-vasta-surface-soft border border-vasta-border text-[11px] font-bold text-vasta-text hover:border-vasta-primary hover:text-vasta-primary transition-all hover:-translate-y-0.5"
                            >
                              vasta.pro/
                              <span className="text-vasta-primary">{s}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>

            {/* Bio Field */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-4 px-1">
                <label className="text-[11px] font-bold text-vasta-muted uppercase tracking-[0.2em]">
                  Bio do Perfil
                </label>
                <span className="text-[10px] font-bold text-vasta-muted/40 uppercase tracking-widest">
                  {settings.bio?.length || 0}/160
                </span>
              </div>

              <div className="relative group flex items-center rounded-2xl border border-vasta-border bg-vasta-surface-soft focus-within:border-vasta-primary focus-within:ring-4 focus-within:ring-vasta-primary/10 transition-all duration-300 min-h-[64px]">
                <textarea
                  value={settings.bio}
                  onChange={(e) => updateSettings({ bio: e.target.value })}
                  placeholder="Escreva algo sobre você..."
                  maxLength={160}
                  rows={1}
                  className="w-full bg-transparent px-5 py-4 text-sm font-medium text-vasta-text focus:outline-none placeholder:text-vasta-muted/20 resize-none leading-relaxed"
                />
              </div>

              <div className="mt-3 px-1">
                <p className="text-[11px] font-medium text-vasta-muted/70 flex items-center gap-2">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-vasta-primary/50" />
                  Sua bio aparece logo abaixo do seu nome. Use emojis ✨
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Temas & Cores */}
      <section className="animate-fade-in [animation-delay:200ms] space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vasta-primary/10 text-vasta-primary">
            <Palette size={18} />
          </div>
          <h3 className="text-sm font-bold text-vasta-text uppercase tracking-wider">
            Temas & Cores
          </h3>
        </div>

        <div className="rounded-[2.5rem] border border-vasta-border bg-vasta-surface p-2 shadow-card">
          <div className="p-6">
            <h4 className="text-xs font-bold text-vasta-muted uppercase tracking-widest mb-4 px-1">
              Temas Prontos
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => updateSettings({ theme: "light" })}
                className={`relative group overflow-hidden rounded-3xl border-2 p-1 transition-all hover:scale-[1.02] active:scale-[0.98] ${settings.theme === "light" ? "border-vasta-primary shadow-lg shadow-vasta-primary/10" : "border-vasta-border hover:border-vasta-muted"}`}
              >
                <div className="h-20 w-full rounded-2xl bg-[#FAFAF9] flex items-center justify-center">
                  {" "}
                  {/* @vasta-ux-exception: Theme Preview Color */}
                  <div className="h-8 w-16 bg-white rounded-lg shadow-sm" />
                </div>
                <div className="p-3 text-center">
                  <span className="text-sm font-bold text-vasta-text">
                    Sol de Verão
                  </span>
                  {settings.theme === "light" && (
                    <div className="absolute top-2 right-2 bg-vasta-primary text-white p-1 rounded-full">
                      <Check size={10} />
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={() => updateSettings({ theme: "dark" })}
                className={`relative group overflow-hidden rounded-3xl border-2 p-1 transition-all hover:scale-[1.02] active:scale-[0.98] ${settings.theme === "dark" ? "border-vasta-primary shadow-lg shadow-vasta-primary/10" : "border-vasta-border hover:border-vasta-muted"}`}
              >
                <div className="h-20 w-full rounded-2xl bg-[#0B0E14] flex items-center justify-center">
                  {" "}
                  {/* @vasta-ux-exception: Theme Preview Color */}
                  <div className="h-8 w-16 bg-[#151923] rounded-lg shadow-sm" />{" "}
                  {/* @vasta-ux-exception: Theme Preview Color */}
                </div>
                <div className="p-3 text-center">
                  <span className="text-sm font-bold text-vasta-text">
                    Escuro Puro
                  </span>
                  {settings.theme === "dark" && (
                    <div className="absolute top-2 right-2 bg-vasta-primary text-white p-1 rounded-full">
                      <Check size={10} />
                    </div>
                  )}
                </div>
              </button>
            </div>

            <h4 className="text-xs font-bold text-vasta-muted uppercase tracking-widest mt-8 mb-4 px-1">
              Cor de Destaque
            </h4>
            <div className="flex flex-wrap gap-4 px-1">
              {[
                "#6366F1",
                "#EC4899",
                "#10B981",
                "#F59E0B",
                "#000000",
                "#EF4444",
              ].map(
                (
                  color, // @vasta-ux-exception: Color Picker Palette
                ) => (
                  <button
                    key={color}
                    onClick={() => updateSettings({ accentColor: color })}
                    className={`h-12 w-12 rounded-2xl transition-all hover:scale-110 active:scale-90 flex items-center justify-center group ${settings.accentColor === color ? "ring-4 ring-vasta-primary/10 border-2 border-vasta-primary" : "border border-vasta-border"}`}
                    style={{ backgroundColor: color }}
                  >
                    {settings.accentColor === color && (
                      <Check
                        className={
                          color === "#000000" ? "text-white" : "text-black/50"
                        }
                        size={20}
                      />
                    )}{" "}
                    {/* @vasta-ux-exception: Contrast Logic */}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Estilo dos Links */}
      <section className="animate-fade-in [animation-delay:250ms] space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vasta-primary/10 text-vasta-primary">
            <Layout size={18} />
          </div>
          <h3 className="text-sm font-bold text-vasta-text uppercase tracking-wider">
            Estilo dos Links
          </h3>
        </div>

        <div className="rounded-[2.5rem] border border-vasta-border bg-vasta-surface p-2 shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            {[
              { id: "glass", name: "Neon Glass" },
              { id: "solid", name: "Sólido" },
              { id: "outline", name: "Contorno" },
            ].map((style) => (
              <button
                key={style.id}
                onClick={() => updateSettings({ linkStyle: style.id as any })}
                className={`p-4 rounded-3xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center gap-3 ${settings.linkStyle === style.id ? "border-vasta-primary bg-vasta-primary/5" : "border-vasta-border"}`}
              >
                <div
                  className={`h-10 w-full rounded-xl border ${style.id === "glass" ? "bg-white/10 backdrop-blur-md border-white/20" : style.id === "solid" ? "bg-vasta-primary border-transparent" : "bg-transparent border-vasta-primary"}`}
                  style={{
                    backgroundColor:
                      style.id === "solid" ? settings.accentColor : undefined,
                    borderColor:
                      style.id === "outline" || style.id === "glass"
                        ? settings.accentColor
                        : undefined,
                  }}
                />
                <span className="text-xs font-bold text-vasta-text">
                  {style.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tipografia */}
      <section className="animate-fade-in [animation-delay:300ms] space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vasta-primary/10 text-vasta-primary">
            <Type size={18} />
          </div>
          <h3 className="text-sm font-bold text-vasta-text uppercase tracking-wider">
            Tipografia
          </h3>
        </div>

        <div className="rounded-[2.5rem] border border-vasta-border bg-vasta-surface p-2 shadow-card">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4">
            {["Inter", "Poppins", "Montserrat", "Outfit"].map((font) => (
              <button
                key={font}
                onClick={() => updateSettings({ typography: font })}
                className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${settings.typography === font ? "border-vasta-primary bg-vasta-primary/5" : "border-vasta-border hover:border-vasta-muted"}`}
              >
                <span
                  className="text-xl font-bold"
                  style={{ fontFamily: font }}
                >
                  Aa
                </span>
                <span className="text-[10px] font-bold text-vasta-muted uppercase tracking-widest">
                  {font}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Reset */}
      <div className="flex justify-center pt-8 pb-12">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 rounded-full border border-vasta-border bg-vasta-surface px-6 py-3 text-sm font-bold text-vasta-muted hover:bg-vasta-surface-soft hover:text-vasta-text transition-all"
        >
          <RefreshCcw size={16} /> Resetar Aparência
        </button>
      </div>

      {/* Unsplash Modal */}
      {isUnsplashOpen && (
        <div
          className="fixed inset-0 z-[200] w-screen h-screen flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm transition-all"
          onClick={() => setIsUnsplashOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded-[2rem] bg-vasta-surface border border-vasta-border shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-vasta-border px-6 py-5 shrink-0">
              <h3 className="text-lg font-bold text-vasta-text flex items-center gap-2">
                <Search className="text-vasta-primary" size={20} /> Buscar no
                Unsplash
              </h3>
              <button
                onClick={() => setIsUnsplashOpen(false)}
                className="rounded-full bg-vasta-surface-soft p-2 text-vasta-muted hover:text-vasta-text transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleUnsplashSearch} className="flex gap-3 mb-6">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-vasta-muted"
                    size={18}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ex: sunset, nature, minimalism..."
                    className="w-full rounded-xl bg-vasta-surface-soft border border-vasta-border px-12 py-3 text-sm font-medium text-vasta-text focus:outline-none focus:ring-2 focus:ring-vasta-primary/20 focus:border-vasta-primary transition-all shadow-inner"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="rounded-xl bg-vasta-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-vasta-primary/20 hover:bg-vasta-primary-soft transition-all disabled:opacity-50"
                >
                  {isSearching ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Buscar"
                  )}
                </button>
              </form>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-2">
                {unsplashResult.map((photo: any) => (
                  <button
                    key={photo.id}
                    onClick={() => {
                      updateSettings({
                        coverImage: photo.urls.regular,
                        coverImageCredit: `${photo.user.name}|${photo.user.username}`,
                      });
                      setIsUnsplashOpen(false);
                    }}
                    className="group relative aspect-video overflow-hidden rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-xl w-full"
                  >
                    <img
                      src={photo.urls.small}
                      className="h-full w-full object-cover"
                      alt={photo.alt_description}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Plus className="text-white drop-shadow-md" size={24} />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] text-white truncate px-1">
                        {photo.user.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-vasta-border px-6 py-3 bg-vasta-surface-soft/30 shrink-0">
              <p className="text-[10px] text-vasta-muted text-center uppercase tracking-widest font-bold">
                Powered by Unsplash API
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {isCropOpen && croppingImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[2rem] bg-vasta-surface border border-vasta-border shadow-2xl overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-vasta-border flex justify-between items-center bg-vasta-surface z-10">
              <h3 className="font-bold text-vasta-text">Ajuste sua Foto</h3>
              <button
                onClick={() => setIsCropOpen(false)}
                className="text-vasta-muted hover:text-vasta-text"
              >
                <X />
              </button>
            </div>

            <div className="relative flex-1 bg-black">
              <Cropper
                image={croppingImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="p-6 bg-vasta-surface flex flex-col gap-4 z-10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-vasta-muted">Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1 bg-vasta-surface-soft rounded-lg appearance-none cursor-pointer accent-vasta-primary"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsCropOpen(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm border border-vasta-border text-vasta-text hover:bg-vasta-surface-soft"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCropConfirm}
                  disabled={uploading}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-vasta-primary text-white hover:bg-vasta-primary-soft flex justify-center items-center gap-2"
                >
                  {uploading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Check size={16} />
                  )}
                  Salvar Foto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
