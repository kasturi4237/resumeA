export default function UploadCard({
 resumeText,
 setResumeText,
 jobDesc,
 setJobDesc,
 handleAnalyze
}){

 return(

  <div className="bg-white p-8 rounded-xl shadow-lg border">

   <textarea
   placeholder="Paste your resume..."
   value={resumeText}
   onChange={(e)=>setResumeText(e.target.value)}
   className="w-full border p-4 rounded-lg mb-6"
   rows={7}
   />

   <textarea
   placeholder="Paste job description (optional)"
   value={jobDesc}
   onChange={(e)=>setJobDesc(e.target.value)}
   className="w-full border p-4 rounded-lg mb-6"
   rows={5}
   />

   <button
   onClick={handleAnalyze}
   className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold"
   >
    Analyze Resume
   </button>

  </div>

 )

}