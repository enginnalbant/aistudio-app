import React, { useState } from "react";
import { Manga } from "./mangaTypes";
import { MangaDashboard } from "./MangaDashboard";
import { MangaReader } from "./MangaReader";

export const MangaAppContainer: React.FC = () => {
  const [selectedManga, setSelectedManga] = useState<Manga | null>(null);

  if (selectedManga) {
    return (
      <MangaReader
        manga={selectedManga}
        onBack={() => setSelectedManga(null)}
      />
    );
  }

  return (
    <MangaDashboard
      onSelectManga={(manga) => setSelectedManga(manga)}
    />
  );
};
