import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteContent } from "@/lib/content";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const content = await getSiteContent();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader content={content} />
      <main className="flex-1">{children}</main>
      <SiteFooter content={content} />
    </div>
  );
}
