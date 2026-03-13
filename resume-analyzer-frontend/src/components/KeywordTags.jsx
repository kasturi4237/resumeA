export default function KeywordTags({keywords}){

 return(

 <div className="mt-10">

 <h3 className="font-semibold mb-4 text-center">
 Keyword Analysis
 </h3>

 <div className="flex flex-wrap gap-2 justify-center">

 {keywords.found.map((k,i)=>(
  <span key={i}
  className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm">
   {k}
  </span>
 ))}

 {keywords.missing.map((k,i)=>(
  <span key={i}
  className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm">
   {k}
  </span>
 ))}

 </div>

 </div>

 )
}