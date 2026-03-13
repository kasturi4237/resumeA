import ScoreCard from "../components/ScoreCard"
import SectionCard from "../components/SectionCard"
import KeywordTags from "../components/KeywordTags"

export default function ResultsPage({result,reset}){

 return(

 <div className="max-w-6xl mx-auto py-16">

 <h2 className="text-4xl font-bold text-center mb-10">
  Resume Score
 </h2>

 <ScoreCard score={result.overallScore}/>

 <div className="grid md:grid-cols-2 gap-6 mt-12">

 <SectionCard title="Strengths" items={result.strengths} type="good"/>

 <SectionCard title="Improvements" items={result.improvements} type="bad"/>

 </div>

 <KeywordTags keywords={result.keywords}/>

 <div className="text-center mt-10">

 <button
 onClick={reset}
 className="px-6 py-3 bg-gray-800 text-white rounded-lg"
 >
 Analyze Another Resume
 </button>

 </div>

 </div>

 )

}