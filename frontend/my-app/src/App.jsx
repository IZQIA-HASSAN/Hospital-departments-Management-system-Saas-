
import Login from "./pages/auth/Login"
import Signup from "./pages/auth/Signup"
import Home from "./pages/Home"
import Forgotpassword from "./pages/auth/Forgotpassword"
import {  Route , Routes } from "react-router-dom"
import Staffdash from "./pages/Dashboards/Staff/Staffdash"
import Admindash from "./pages/Dashboards/Admin/Admindash"

import './App.css'


function App() {

  return (
     <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/Signup" element={<Signup/>}/>
      <Route path="/Login" element={<Login/>}/>
      <Route path="/Staffdash" element={<Staffdash/>}/>
      <Route path="/Admindash" element={<Admindash/>}/>
      <Route path="/Forgotpassword" element={<Forgotpassword/>}/>
     </Routes>
  
  )
}

export default App
