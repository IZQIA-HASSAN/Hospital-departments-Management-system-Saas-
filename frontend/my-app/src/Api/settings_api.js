const API_BASE = "http://localhost/api/account"
const HOSPITAL_API_BASE = "http://localhost:5000/api/hospitals" 

async function request(path , method , body){
    const res = await fetch(`{API_BASE}${path}`,{
        method,
        headers : {"Content-Type" : "application/json"},
        credentials : "include",
        body : body? JSON.stringify(body) : undefined

    })
    const data = await res.json().catch(()=>({}))
    if(!res.ok){
        throw new Error(data.message || "Something went wrong")
    }
    return data
}

export const getMyHospital = async () => {
  const res = await fetch(`${HOSPITAL_API_BASE}/me`, {
    credentials: "include",
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || "Failed to load hospital info")
  return data.hospital
}

export const getMe = async () => {
  const res = await apiFetch("http://localhost:5000/api/auth/me")
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || "Failed to load session")
  return data.user
}

export const logout = async () => {
  const res = await apiFetch("http://localhost:5000/api/auth/logout", { method: "POST" })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || "Failed to log out")
  return data
}

export const ChangeEmail = (email)=> request("/email" , "PATCH" , {email})
export const changePassword = (currentPassword , newPassword) => request("/password" , "PATCH" , {currentPassword , newPassword})
export const updateHospital = (data)=> request("/hospital" , "PATCH" , data)