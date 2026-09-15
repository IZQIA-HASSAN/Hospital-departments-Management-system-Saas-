import { apiFetch } from '../utils/apiClient'

const HOSPITAL_BASE = "http://localhost:5000/api/hospitals" // confirm mount path

export const getMyHospital = async () => {
  const res = await apiFetch(`${HOSPITAL_BASE}/me`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Failed to load hospital info')
  return data.hospital
}

export const createHospital = async (payload) => {
  const res = await apiFetch(HOSPITAL_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Failed to create hospital')
  return data.hospital
}