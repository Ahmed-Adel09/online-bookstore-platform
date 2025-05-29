"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Generate mock rating distribution data
const generateRatingData = () => {
  return [
    { rating: "5 Stars", count: Math.floor(Math.random() * 100) + 50 },
    { rating: "4 Stars", count: Math.floor(Math.random() * 80) + 40 },
    { rating: "3 Stars", count: Math.floor(Math.random() * 40) + 20 },
    { rating: "2 Stars", count: Math.floor(Math.random() * 20) + 10 },
    { rating: "1 Star", count: Math.floor(Math.random() * 10) + 5 },
  ]
}

export function RatingDistributionChart() {
  const [data, setData] = useState([])

  useEffect(() => {
    setData(generateRatingData())
  }, [])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <XAxis dataKey="rating" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip formatter={(value, name) => [value, "Reviews"]} />
        <Bar
          dataKey="count"
          fill={(entry) => {
            if (entry.rating === "5 Stars") return "#16a34a"
            if (entry.rating === "4 Stars") return "#22c55e"
            if (entry.rating === "3 Stars") return "#facc15"
            if (entry.rating === "2 Stars") return "#f97316"
            return "#ef4444"
          }}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
