"use client";

import { useChapterProgress } from "@/hooks/useChapterProgress";
import { useScrollShip } from "@/hooks/useScrollShip";
import { ATMOSPHERES, PORT_ATMOSPHERES } from "@/lib/atmospheres";
import { WorldOcean } from "@/components/world/WorldOcean";
import { VoyageShip } from "@/components/world/VoyageShip";

export function WorldOceanProvider() {
  const chapter = useChapterProgress();
  const ship    = useScrollShip(chapter);

  // Port atmosphere takes precedence inside the arrivals chapter
  const atmosphere =
    chapter.chapterId === "arrivals" && chapter.portId
      ? PORT_ATMOSPHERES[chapter.portId]
      : ATMOSPHERES[chapter.chapterId];

  return (
    <>
      <WorldOcean atmosphere={atmosphere} />
      <VoyageShip state={ship} />
    </>
  );
}
