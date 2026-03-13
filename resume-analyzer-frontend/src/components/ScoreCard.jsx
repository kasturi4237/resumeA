import { CircularProgressbar } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"

export default function ScoreCard({score}){

 return(

 <div className="w-40 mx-auto">

 <CircularProgressbar
 value={score}
 text={`${score}%`}
 />

 </div>

 )

}