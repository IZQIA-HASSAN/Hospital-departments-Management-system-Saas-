
import Login from "./pages/auth/Login"
import Signup from "./pages/auth/Signup"
import Home from "./pages/Home"
import Forgotpassword from "./pages/auth/Forgotpassword"
import {  Route , Routes } from "react-router-dom"

import './App.css'


function App() {

  return (
     <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/Signup" element={<Signup/>}/>
      <Route path="/Login" element={<Login/>}/>
      <Route path="/Forgotpassword" element={<Forgotpassword/>}/>
     </Routes>
  
  )
}

export default App
