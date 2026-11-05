import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import TopBar from "./TopBar";
import Header from "./Header";
import Footer from "./Footer";
import ThemeSwitcher from "../common/ThemeSwitcher";
import WhatsAppButton from "../common/WhatsAppButton";
import { pageView } from "../../lib/metaPixel";

export default function Layout() {
  const { pathname, search } = useLocation();
  const lastTracked = useRef(null);

  // Meta Pixel PageView on first load and on every SPA route change.
  useEffect(() => {
    const key = pathname + search;
    if (lastTracked.current === key) return;
    lastTracked.current = key;
    pageView();
  }, [pathname, search]);

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <TopBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ThemeSwitcher />
      <WhatsAppButton />
    </div>
  );
}
