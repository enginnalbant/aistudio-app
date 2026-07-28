import React, { useState } from "react";
import { Manga } from "./mangaTypes";
import { MangaDashboard } from "./MangaDashboard";
import { MangaReader } from "./MangaReader";

interface MangaAppContainerProps {
  activeModule?: string;
}

export const MangaAppContainer: React.FC<MangaAppContainerProps> = ({ activeModule }) => {
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
      activeModule={activeModule}
      onSelectManga={(manga) => setSelectedManga(manga)}
    />
  );
};
