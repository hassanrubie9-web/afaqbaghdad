"use client";

import dynamic from "next/dynamic";

const ChartResultView = dynamic(() => import("@/components/chart/ChartResultView"), {
  ssr: false,
});

export default function ChartResultClient() {
  return <ChartResultView />;
}
