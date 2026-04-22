import { AppHeader } from "@/components/app-header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AppHeader />
      <section className="flex-1">{children}</section>
    </>
  );
};

export default Layout;
