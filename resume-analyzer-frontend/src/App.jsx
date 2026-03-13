import { useState } from "react";
import UploadPage from "./pages/UploadPage";
import ResultsPage from "./pages/ResultsPage";

export default function App() {

  const [result,setResult] = useState(null)
  const [loading,setLoading] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">

      {!result && (
        <UploadPage
          setResult={setResult}
          setLoading={setLoading}
          loading={loading}
        />
      )}

      {result && (
        <ResultsPage
          result={result}
          reset={()=>setResult(null)}
        />
      )}

    </div>
  );
}