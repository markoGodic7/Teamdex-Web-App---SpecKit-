import React, { useState } from "react";
import SearchBox from "./components/SearchBox";
import ResultsGrid from "./components/ResultsGrid";
import TeamPanel from "./components/TeamPanel";
import DetailDrawer from "./components/DetailDrawer";
import ThemeToggle from "./components/ThemeToggle";

export default function App() {
  const [selected, setSelected] = useState<string | number | null>(null);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">TeamDex — Pokedex with Team Builder</h1>
          <ThemeToggle />
        </div>
      </header>
      <main className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-2">
          <SearchBox onSelect={(q) => setSelected(q)} />
          <ResultsGrid onOpen={(idOrName) => setSelected(idOrName)} />
        </section>
        <aside className="md:col-span-1">
          <TeamPanel />
        </aside>
      </main>
      <DetailDrawer idOrName={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
