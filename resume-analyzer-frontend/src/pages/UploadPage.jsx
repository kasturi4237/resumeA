import { useState } from "react";
import UploadCard from "../components/UploadCard";
import Loader from "../components/Loader";
import { analyzeResume } from "../api/analyzeApi";

export default function UploadPage({setResult,setLoading,loading}){

 const [resumeText,setResumeText]=useState("")
 const [jobDesc,setJobDesc]=useState("")

 const handleAnalyze = async()=>{

  setLoading(true)

  const data = await analyzeResume(resumeText,jobDesc)

  setResult(data)

  setLoading(false)

 }

 if(loading) return <Loader/>

 return(

  <div className="max-w-3xl mx-auto pt-16">

   <header className="text-center mb-12">

    <h1 className="text-5xl font-bold text-blue-600">
      AI Resume Analyzer
    </h1>

    <p className="text-gray-500 mt-3">
      Get AI feedback to improve your resume
    </p>

   </header>

   <UploadCard
    resumeText={resumeText}
    setResumeText={setResumeText}
    jobDesc={jobDesc}
    setJobDesc={setJobDesc}
    handleAnalyze={handleAnalyze}
   />

  </div>

 )

}