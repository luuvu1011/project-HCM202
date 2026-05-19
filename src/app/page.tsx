"use client";

import { useState } from "react";
import { SiteHeader }       from "@/components/layout/SiteHeader";
import { HeroSection }       from "@/components/landing/HeroSection";
import { IntroSection }      from "@/components/sections/IntroSection";
import { JourneyMapWorld }   from "@/components/map/JourneyMapWorld";
import { MeaningSection }    from "@/components/sections/MeaningSection";
import { GamesSection }      from "@/components/games/GamesSection";
import { EndingSection }     from "@/components/ending/EndingSection";
import { EndingFinal }       from "@/components/sections/EndingFinal";
import { Footer }            from "@/components/layout/Footer";
import { AIAssistant }       from "@/components/assistant/AIAssistant";
import { ChapterProgress }   from "@/components/ui/ChapterProgress";
import { OceanDivider }      from "@/components/ui/OceanDivider";
import { LoadingScreen }     from "@/components/loading/LoadingScreen";
import { PhotoDocumentary }  from "@/components/sections/PhotoDocumentary";
import { TimelineScrubber }  from "@/components/ui/TimelineScrubber";
import { GlobeSection }      from "@/components/map/GlobeSection";
import { SoundToggle }       from "@/components/ui/SoundToggle";
import { GestureSection }    from "@/components/gestures/GestureSection";

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {/* Màn chào cinematic — hiện trong 3-4s rồi tự ẩn */}
      <LoadingScreen onDone={() => setLoaded(true)} />

      <SiteHeader />

      <main style={{ visibility: loaded ? "visible" : "hidden" }}>

        {/* 1 ── Hero đỏ cinematic */}
        <HeroSection />

        {/* Sóng chuyển: đỏ → trắng */}
        <OceanDivider variant="red-to-white" height={90} />

        {/* 2 ── Lịch sử Việt Nam trước 1911 */}
        <IntroSection />

        {/* Sóng chuyển: trắng → cream */}
        <OceanDivider variant="white-to-cream" height={72} />

        {/* 3 ── Bản đồ hành trình tương tác */}
        <JourneyMapWorld />

        {/* Sóng chuyển: cream → tối */}
        <OceanDivider variant="cream-to-dark" height={88} />

        {/* 4 ── Cột Mốc — 6 cảnh cinematic */}
        <PhotoDocumentary />

        {/* Sóng chuyển: tối → tối (ocean deep) */}
        <OceanDivider variant="dark-to-dark" height={60} />

        {/* 5 ── Địa cầu 3D lịch sử */}
        <GlobeSection />

        {/* Sóng chuyển: tối → đỏ thẫm */}
        <OceanDivider variant="dark-to-red" height={72} />

        {/* 6 ── Dòng thời gian 1911–1930 */}
        <TimelineScrubber />

        {/* Sóng chuyển: tối đỏ → trắng */}
        <OceanDivider variant="dark-to-white" height={88} />

        {/* 7 ── Ý nghĩa tư tưởng Hồ Chí Minh */}
        <div id="y-nghia">
          <MeaningSection />
        </div>

        {/* Sóng chuyển: trắng → cream */}
        <OceanDivider variant="white-to-cream" height={56} />

        {/* 7.5 ── Tương tác cử chỉ (webcam + MediaPipe) */}
        <GestureSection />

        {/* Sóng chuyển: cream → trắng (flip lật chiều) */}
        <OceanDivider variant="white-to-cream" height={56} flip />

        {/* 8 ── Mini-game giáo dục */}
        <GamesSection />

        {/* Sóng chuyển: trắng → tối */}
        <OceanDivider variant="white-to-dark" height={80} />

        {/* 9 ── Tổng kết + trích dẫn + tài liệu */}
        <EndingSection />

        {/* 10 ── Kết thúc cinematic đỏ */}
        <EndingFinal />
      </main>

      <Footer />

      {/* Floating UI */}
      <AIAssistant />
      <ChapterProgress />
      <SoundToggle />
    </>
  );
}
