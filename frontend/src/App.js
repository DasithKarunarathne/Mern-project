import './App.css';
import AddFeedback from './components/addfeedback';
import Allfeedback from './components/Allfeedback';
import ShowFeedbackDetailsIn from './components/showIndividualCarddetails';
import UpdateFeedback from './components/updateFeedback'
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"

function App() {
  return (
    <div className="App">



<Routes>
<Route
    path="/Feedbackpage"
    element={
      <div>
        <Allfeedback />
        <AddFeedback />
        
      </div>
    }
  />

<Route path="/showdetails/:_id"  element={<ShowFeedbackDetailsIn/>}/>
<Route path="/updatefeedback/:_id"  element={<UpdateFeedback/>}/>

</Routes>

      
    
    </div>
  );
}

export default App;
