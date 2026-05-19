"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Navigation } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { VOYAGE_ORDERED_IDS } from "@/hooks/useVoyageSequence";
import { IdeologyJourneyStrip } from "@/components/voyage/IdeologyJourneyStrip";
import { LocationInfoPanel } from "@/components/voyage/LocationInfoPanel";
import { useJourney } from "@/lib/journeyContext";
import type { LocationId } from "@/types/voyage";

const VoyageMap = dynamic(
  () => import("@/components/voyage/VoyageMap").then((m) => m.VoyageMap),
  { ssr: false, loading: () => <MapSkeleton /> },
);

function MapSkeleton() {
  return (
    <div className="flex aspect-[880/460] w-full animate-pulse items-center justify-center rounded-[28px] border border-glass-border bg-ocean-mid/50 text-sm text-parchment-muted">
      Đang tải khung hành trình điện ảnh…
    </div>
  );
}

export function VoyageMapSection() {
  const { startJourney } = useJourney();
  const [selectedId, setSelectedId] = useState<LocationId>("ben-nha-rong");

  const lightingIndex = useMemo(
    () => Math.max(0, VOYAGE_ORDERED_IDS.indexOf(selectedId)),
    [selectedId],
  );

  return (
    <section
      id="ban-do"
      className="relative scroll-mt-24 py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(194,59,59,0.07),transparent_52%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(26,75,124,0.2),transparent_55%)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Trung tâm trải nghiệm"
            title="Hải trình điện ảnh — hành trình tìm đường cứu nước"
            description="Một chuyến hải hành mang nhịp điệu điện ảnh: đại dương, sương mờ, ánh sáng và lời dẫn đồng bộ với từng cập bến — biến hành trình của Nguyễn Tất Thành thành trải nghiệm lịch sử giàu cảm xúc, không còn là một bản đồ tĩnh."
          />
        </ScrollReveal>

        <ScrollReveal className="mt-10" delay={0.04}>
          <IdeologyJourneyStrip
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </ScrollReveal>

        <div className="mt-6">
          <ScrollReveal delay={0.08}>
            <div className="vv-map-frame relative">
              <VoyageMap
                selectedId={selectedId}
                lightingStopIndex={lightingIndex}
              />
              <LocationInfoPanel locationId={selectedId} />
            </div>

            {/* Start Journey CTA */}
            <motion.div
              className="mt-6 flex flex-col items-center gap-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              <Button
                type="button"
                onClick={startJourney}
                className="gap-2 px-7 py-3"
              >
                <Navigation className="h-4 w-4" aria-hidden />
                Khởi hành tìm đường cứu nước
              </Button>
              <p className="max-w-md text-center text-xs leading-relaxed text-parchment-muted/70">
                Thuyền rời Bến Nhà Rồng — hành trình điện ảnh dừng tại từng bến, chờ bạn đọc và quyết định tiếp tục.
              </p>
            </motion.div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
