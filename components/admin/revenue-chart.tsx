"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Generate mock revenue data
const generateRevenueData = () => {
  const data = []
  const now = new Date()

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    const revenue = (Math.random() * 500 + 200).toFixed(2)
    const expenses = (Math.random() * 200 + 100).toFixed(2)
    const profit = (Number.parseFloat(revenue) - Number.parseFloat(expenses)).toFixed(2)

    data.push({
      date: date.toISOString().split("T")[0],
      revenue: Number.parseFloat(revenue),
      expenses: Number.parseFloat(expenses),
      profit: Number.parseFloat(profit),
    })
  }

  return data
}

export function RevenueChart() {
  const [data, setData] = useState([])

  useEffect(() => {
    setData(generateRevenueData())
  }, [])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <XAxis
          dataKey="date"
          tickFormatter={(value) => {
            const date = new Date(value)
            return `${date.getDate()}/${date.getMonth() + 1}`
          }}
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          formatter={(value, name) => {
            return [`$${value}`, name.charAt(0).toUpperCase() + name.slice(1)]
          }}
          labelFormatter={(label) => {
            const date = new Date(label)
            return date.toLocaleDateString()
          }}
        />
        <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
        <Bar dataKey="profit" fill="#16a34a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
