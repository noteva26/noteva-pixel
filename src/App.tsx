import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import PluginSlot from "@/components/PluginSlot";
import { FullScreenLoader } from "@/components/PixelLoader";
import HomePage from "@/pages/home";
import PostPage from "@/pages/post";
import ArchivesPage from "@/pages/archives";
import CategoriesPage from "@/pages/categories";
import TagsPage from "@/pages/tags";
import CustomPage from "@/pages/custom-page";

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 等待 SDK 就绪，展示小恐龙 loading
    const check = () => {
      if ((window as any).Noteva) {
        (window as any).Noteva.ready().then(() => {
          setReady(true);
        });
      } else {
        setTimeout(check, 50);
      }
    };
    check();
    // 兜底：最多等 3 秒
    const timer = setTimeout(() => {
      setReady(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) return <FullScreenLoader />;

  return (
    <>
      <PluginSlot name="body_start" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/archives" element={<ArchivesPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/tags" element={<TagsPage />} />
        <Route path="/posts/*" element={<PostPage />} />
        <Route path="/:slug" element={<CustomPage />} />
      </Routes>
      <PluginSlot name="body_end" />
    </>
  );
}
