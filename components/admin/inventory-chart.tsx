"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Generate mock inventory data
const generateInventoryData = () => {
  const bookTitles = [
    "The Midnight Library",
    "Atomic Habits",
    "Project Hail Mary",
    "Educated",
    "The Silent Patient",
    "Where the Crawdads Sing",
    "Sapiens",
    "The Four Winds",
  ]

  return bookTitles
    .map((title) => {
      const stock = Math.floor(Math.random() * 100) + 1
      const sold = Math.floor(Math.random() * 50) + 1

      return {
        title,
        stock,
        sold,
        lowStock: stock < 10,
      }
    })
    .sort((a, b) => b.sold - a.sold)
}

export function InventoryChart() {
  const [data, setData] = useState([])

  useEffect(() => {
    setData(generateInventoryData())
  }, [])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
        <XAxis type="number" />
        <YAxis type="category" dataKey="title" width={100} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value, name) => {
            if (name === "stock") return [value, "Current Stock"]
            return [value, "Units Sold"]
          }}
        />
        <Bar dataKey="stock" fill={(entry) => (entry.lowStock ? "#ef4444" : "#2563eb")} radius={[0, 4, 4, 0]} />
        <Bar dataKey="sold" fill="#16a34a" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
