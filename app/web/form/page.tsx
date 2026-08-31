import { Suspense } from "react";
import FormContent from "./FormContent"; // we'll create this

export default function FormPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <FormContent />
    </Suspense>
  );
}