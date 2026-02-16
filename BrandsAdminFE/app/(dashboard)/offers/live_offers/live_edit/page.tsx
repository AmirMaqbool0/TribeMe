import { LiveEdit } from "@/src/index";
import { Suspense } from "react";
export default function LiveOffersEdit() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LiveEdit />
    </Suspense>
  );
}
