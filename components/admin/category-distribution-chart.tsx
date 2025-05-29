"use client"

import { useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

// Generate mock category distribution data
const generateCategoryData = () => {
  const categories = [
    { name: "Fiction", value: 35 },
    { name: "Science Fiction", value: 20 },
    { name: "Mystery", value: 15 },
    { name: "Self-Help", value: 10 },
    { name: "Biography", value: 8 },
    { name: "History", value: 7 },
    { name: "Other", value: 5 },
  ]

  return categories
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FCCDE5"]

export function CategoryDistributionChart() {
  const [data, setData] = useState([])

  useEffect(() => {
    setData(generateCategoryData())
  }, [])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name, props) => [
            `${value} books (${((value / props.payload.payload.total) * 100).toFixed(1)}%)`,
            name,
          ]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
