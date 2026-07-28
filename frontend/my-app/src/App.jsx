
import Login from "./pages/auth/Login"
import Signup from "./pages/auth/Signup"
import {  Route , Routes } from "react-router-dom"

import './App.css'


function App() {

  return (
     <Routes>
      <Route path="/" element={<Signup/>}/>
      <Route path="/Login" element={<Login/>}/>
     </Routes>
  
  )
}

export default App
