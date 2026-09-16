
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

// Change this:
// export const changePassword = (currentPassword, newPassword) => ...

// To this:
export const changePassword = ({ currentPassword, newPassword, confirmNewPassword }) =>
  request(API_BASE, "/password", "PATCH", { currentPassword, newPassword, confirmNewPassword })

// Hospital Endpoints
export const getMyHospital = async () => {
  const data = await request(HOSPITAL_API_BASE, "/me")
  return data.hospital
}

export const updateHospital = (data) =>
  request(HOSPITAL_API_BASE, "/hospital", "PATCH", data)