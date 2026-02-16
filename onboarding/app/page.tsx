import { Main } from "../src/app/index";
import HomePage from "./HomePage/page";
import { Suspense } from 'react';

export default function Page() {
  return (
    <>
    <Suspense fallback={<div>Loading...</div>}>
      <HomePage />
      </Suspense>
    </>
  );
}
