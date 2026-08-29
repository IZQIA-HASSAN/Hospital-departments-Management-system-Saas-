import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


const API_BASE = "http://localhost:5000/api/icu"

function authHeaders(extra = {}){
    const token = localStorage.getItem("token")
    return {
        ...extra,
        ...(token ? {Authorization:`Bearer ${token}`} : {}),
    }
}

export async function occupiedbeds(){
    const res = await fetch(`${API_BASE}?status=occupied`,{
        headers : authHeaders(),
    })
    if(!res.ok) throw new Error("Failed to fetch ICU patients")
    return res.json()
}

// now chart things

const severities = ["critical" , "serious" , "stable"]

const severity_color = {
 Critical: "#dc2626", // red-600
  Serious: "#d97706", // amber-600
  Stable: "#047857",
}

const ICUpatientchart = () => {

    const {data:beds=[] , isLoading , isError ,} = useQuery({queryKey : ["icu" , "beds" , "occupied"] , queryFn:occupiedbeds , refetchInterval :15000 ,})
  
  const data = severities.map((sev)=>({
    severity : sev[0].toUpperCase() + sev.slice(1),
    count : beds.filter((b)=> b.severity === sev).length

  }))

  const totalpatients = beds.length;
  const noData = !isLoading && !isError && totalpatients === 0;
  
    return (
    <div className="border border-neutral-200 rounded-xl p-6 bg-white ">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs tracking-wide text-neutral-500">
          ICU PATIENTS BY SEVERITY
        </span>
        {!isLoading && !isError && (
          <span className="text-xs text-neutral-400">{totalpatients} total</span>
        )}
      </div>
 
      <div className="mt-4">
        {isLoading ? (
          <p className="text-sm text-neutral-400">Loading chart…</p>
        ) : isError ? (
          <p className="text-sm text-red-600">Couldn't load ICU data.</p>
        ) : noData ? (
          <p className="text-sm text-neutral-400">No patients currently in ICU.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="severity" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.severity} fill={severity_color[entry.severity]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default ICUpatientchart