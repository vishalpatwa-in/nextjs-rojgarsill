'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Download, RefreshCw, MoreHorizontal } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface PaymentHistoryProps {
  paymentHistory: any[]
}

export function PaymentHistory({ paymentHistory }: PaymentHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')

  const filteredPayments = paymentHistory.filter((item) => {
    const matchesSearch = 
      item.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.invoice?.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || item.payment.status === statusFilter
    const matchesMethod = methodFilter === 'all' || item.payment.paymentMethod === methodFilter

    return matchesSearch && matchesStatus && matchesMethod
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-gray-100 text-gray-800'
      case 'partially_refunded':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'razorpay':
        return '💳'
      case 'cashfree':
        return '🏛️'
      default:
        return '💰'
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>

        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="razorpay">Razorpay</SelectItem>
            <SelectItem value="cashfree">Cashfree</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((item) => (
                <TableRow key={item.payment.id}>
                  <TableCell className="font-medium">
                    {format(new Date(item.payment.createdAt), 'MMM dd, yyyy')}
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(item.payment.createdAt), 'HH:mm')}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {item.course?.title || 'Subscription Payment'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Payment ID: {item.payment.paymentId}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{getMethodIcon(item.payment.paymentMethod)}</span>
                      <span className="capitalize">{item.payment.paymentMethod}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="font-medium">₹{parseFloat(item.payment.amount).toFixed(2)}</div>
                    {parseFloat(item.payment.refundedAmount) > 0 && (
                      <div className="text-xs text-red-600">
                        -₹{parseFloat(item.payment.refundedAmount).toFixed(2)} refunded
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={getStatusColor(item.payment.status)}>
                      {item.payment.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    {item.invoice ? (
                      <div className="text-sm">
                        <div className="font-medium">{item.invoice.invoiceNumber}</div>
                        <Badge variant="outline" className="text-xs">
                          {item.invoice.status}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download Receipt
                        </DropdownMenuItem>
                        {item.invoice && (
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download Invoice
                          </DropdownMenuItem>
                        )}
                        {item.payment.status === 'completed' && (
                          <DropdownMenuItem className="text-red-600">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Request Refund
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      {filteredPayments.length > 0 && (
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div>
            Showing {filteredPayments.length} of {paymentHistory.length} payments
          </div>
          <div>
            Total: ₹{filteredPayments.reduce((sum, item) => sum + parseFloat(item.payment.amount), 0).toFixed(2)}
          </div>
        </div>
      )}
    </div>
  )
} 