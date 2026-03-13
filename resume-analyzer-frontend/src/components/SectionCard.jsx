export default function SectionCard({title,items,type}){

 return(

 <div className="bg-white p-6 rounded-xl shadow border">

 <h3 className="font-semibold mb-4">{title}</h3>

 <ul className="space-y-2">

 {items.map((i,index)=>(
  <li key={index}
  className={type==="good"?"text-green-600":"text-red-500"}>
   {type==="good"?"✓":"⚠"} {i}
  </li>
 ))}

 </ul>

 </div>

 )

}
