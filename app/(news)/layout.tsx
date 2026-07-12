/**
 * News-site shell — docs/03 §1. Every public news route renders inside
 * UtilityBar + TickerStrip + Footer. Terminal and auth have their own shells.
 */

import UtilityBar from "@/components/news/utility-bar";
import TickerStrip from "@/components/news/ticker-strip";
import Footer from "@/components/news/footer";

export default function NewsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <UtilityBar />
      <TickerStrip />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
