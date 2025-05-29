"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Generate mock customer data
const generateCustomerData = () => {
  const data = []
  const now = new Date()

  let newCustomers = 50
  let returningCustomers = 30

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Add some randomness but keep a trend
    newCustomers = Math.max(1, Math.floor(newCustomers + (Math.random() * 10 - 3)))
    returningCustomers = Math.max(1, Math.floor(returningCustomers + (Math.random() * 8 - 2)))

    data.push({
      date: date.toISOString().split("T")[0],
      new: newCustomers,
      returning: returningCustomers,
      total: newCustomers + returningCustomers,
    })
  }

  return data
}

export function CustomerChart() {
  const [data, setData] = useState([])

  useEffect(() => {
    setData(generateCustomerData())
  }, [])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          formatter={(value, name) => {
            if (name === "new") return [value, "New Customers"]
            if (name === "returning") return [value, "Returning Customers"]
            return [value, "Total Customers"]
          }}
          labelFormatter={(label) => {
            const date = new Date(label)
            return date.toLocaleDateString()
          }}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.1}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Area
          type="monotone"
          dataKey="new"
          stroke="#82ca9d"
          fill="#82ca9d"
          fillOpacity={0.1}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Area
          type="monotone"
          dataKey="returning"
          stroke="#ffc658"
          fill="#ffc658"
          fillOpacity={0.1}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
