import React, {useState, useEffect} from 'react';
import axios from "axios";
import FeedbackCard from './FeedbackCard'

const Allfeedback = () => {

  const [feedback, setFeedback] = useState([]);

  useEffect(() =>{
    console.log("API call made");
    axios.get("http://localhost:4000/api/feedback")
    .then((res)=>{ 
      setFeedback(res.data);
      console.log(res.data);
    }).catch(()=>{
      console.log("Error while retreiving data");
    });


  },[]);

  const feedbackList = feedback.lenght === 0 ? "no feedback found !" : feedback.slice(-2).map((feedback, index)=>(<FeedbackCard key={feedback._id|| index} feedback={feedback}/>))

  return (
    <div className="Show+feedbacklist" >
      <div className='container'>
      <div className='list'>{feedbackList}</div>

      </div>

    </div>
  )
}

export default Allfeedback
