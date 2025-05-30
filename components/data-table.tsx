"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Sample data
const transactions = [
  {
    id: "T-1001",
    customer: "Alex Johnson",
    email: "alex@example.com",
    amount: 125.99,
    status: "completed",
    date: "2023-05-20T08:30:00",
  },
  {
    id: "T-1002",
    customer: "Sarah Williams",
    email: "sarah@example.com",
    amount: 89.99,
    status: "processing",
    date: "2023-05-19T14:20:00",
  },
  {
    id: "T-1003",
    customer: "Michael Brown",
    email: "michael@example.com",
    amount: 254.5,
    status: "completed",
    date: "2023-05-18T11:45:00",
  },
  {
    id: "T-1004",
    customer: "Emily Davis",
    email: "emily@example.com",
    amount: 45.0,
    status: "failed",
    date: "2023-05-17T09:15:00",
  },
  {
    id: "T-1005",
    customer: "James Wilson",
    email: "james@example.com",
    amount: 199.99,
    status: "completed",
    date: "2023-05-16T16:30:00",
  },
]

type SortDirection = "asc" | "desc" | null
type SortField = "customer" | "amount" | "status" | "date" | null

export function DataTable() {
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortField(null)
        setSortDirection(null)
      }
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="ml-2 h-4 w-4" />
    }
    return sortDirection === "asc" ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />
  }

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (!sortField || !sortDirection) return 0

    if (sortField === "amount") {
      return sortDirection === "asc" ? a.amount - b.amount : b.amount - a.amount
    }

    if (sortField === "date") {
      return sortDirection === "asc"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime()
    }

    const aValue = a[sortField]
    const bValue = b[sortField]

    if (sortDirection === "asc") {
      return aValue.localeCompare(bValue)
    } else {
      return bValue.localeCompare(aValue)
    }
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction ID</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("customer")}
                className="flex items-center p-0 font-medium hover:bg-transparent"
              >
                Customer {getSortIcon("customer")}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("amount")}
                className="flex items-center p-0 font-medium hover:bg-transparent"
              >
                Amount {getSortIcon("amount")}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("status")}
                className="flex items-center p-0 font-medium hover:bg-transparent"
              >
                Status {getSortIcon("status")}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("date")}
                className="flex items-center p-0 font-medium hover:bg-transparent"
              >
                Date {getSortIcon("date")}
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">{transaction.id}</TableCell>
              <TableCell>
                <div>
                  <div>{transaction.customer}</div>
                  <div className="text-sm text-muted-foreground">{transaction.email}</div>
                </div>
              </TableCell>
              <TableCell>${transaction.amount.toFixed(2)}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(transaction.status)}`}
                >
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </span>
              </TableCell>
              <TableCell>{formatDate(transaction.date)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
