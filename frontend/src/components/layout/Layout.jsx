import { Outlet } from "react-router-dom";
import TopBar from "./TopBar";
import Header from "./Header";
import Footer from "./Footer";
import ThemeSwitcher from "../common/ThemeSwitcher";
import WhatsAppButton from "../common/WhatsAppButton";

export default function Layout() {
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
