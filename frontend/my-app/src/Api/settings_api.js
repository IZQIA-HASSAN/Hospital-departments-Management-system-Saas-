// const API_BASE = "http://localhost:5000/api/account"
// const HOSPITAL_API_BASE = "http://localhost:5000/api/hospitals" 

// async function request(path , method , body){
//     const res = await fetch(`{API_BASE}${path}`,{
//         method,
//         headers : {"Content-Type" : "application/json"},
//         credentials : "include",
//         body : body? JSON.stringify(body) : undefined

//     })
//     const data = await res.json().catch(()=>({}))
//     if(!res.ok){
//         throw new Error(data.message || "Something went wrong")
//     }
//     return data
// }

// export const getMyHospital = async () => {
//   const res = await fetch(`${HOSPITAL_API_BASE}/me`, {
//     credentials: "include",
//   })
//   const data = await res.json().catch(() => ({}))
//   if (!res.ok) throw new Error(data.message || "Failed to load hospital info")
//   return data.hospital
// }

// export const getMe = async () => {
//   const res = await apiFetch("http://localhost:5000/api/auth/me")
//   const data = await res.json().catch(() => ({}))
//   if (!res.ok) throw new Error(data.message || "Failed to load session")
//   return data.user
// }

// export const logout = async () => {
//   const res = await apiFetch("http://localhost:5000/api/auth/logout", { method: "POST" })
//   const data = await res.json().catch(() => ({}))
//   if (!res.ok) throw new Error(data.message || "Failed to log out")
//   return data
// }

// export async function changeEmail({ oldEmail, password, newEmail }) {
//   const res = await fetch(`${API_BASE}/email`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     credentials: "include",
//     body: JSON.stringify({ oldEmail, password, newEmail }),
//   })

//   const data = await res.json()

//   if (!res.ok) {
//     throw new Error(data.message || "Failed to update email")
//   }

//   return data
// }


// export const changePassword = (currentPassword , newPassword) => request("/password" , "PATCH" , {currentPassword , newPassword})
// export const updateHospital = (data)=> request("/hospital" , "PATCH" , data)

const API_BASE = "http://localhost:5000/api/account"
const HOSPITAL_API_BASE = "http://localhost:5000/api/hospitals"

// Reusable request helper that handles template literals, JSON stringifying, and error checking
async function request(baseUrl, path = "", method = "GET", body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  }

  if (body !== null && body !== undefined) {
    options.body = JSON.stringify(body)
  }

  const res = await fetch(`${baseUrl}${path}`, options)
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong")
  }

  return data
}

// User / Account Endpoints
export const getMe = async () => {
  const data = await request(API_BASE, "/me")
  return data.user
}

export const logout = () => request(API_BASE, "/logout", "POST")

export const changeEmail = ({ oldEmail, password, newEmail }) =>
  request(API_BASE, "/email", "PATCH", { oldEmail, password, newEmail })

export const changePassword = (currentPassword, newPassword) =>
  request(API_BASE, "/password", "PATCH", { currentPassword, newPassword })

// Hospital Endpoints
export const getMyHospital = async () => {
  const data = await request(HOSPITAL_API_BASE, "/me")
  return data.hospital
}

export const updateHospital = (data) =>
  request(HOSPITAL_API_BASE, "/hospital", "PATCH", data)