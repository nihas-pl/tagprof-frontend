import { useState } from 'react'
import { Search, CheckCircle, XCircle, AlertCircle, User, Calendar, Tag as TagIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export default function Verification() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleCheck = async (e) => {
    e.preventDefault()
    
    if (!code.trim()) {
      toast.error('Please enter a code')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await api.verification.check(code.trim().toUpperCase())
      setResult(response.data)
    } catch (error) {
      toast.error('Failed to verify code')
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = async () => {
    if (!code.trim()) return

    setLoading(true)

    try {
      const response = await api.verification.redeem(code.trim().toUpperCase())
      toast.success('Code redeemed successfully!')
      setResult({ ...result, valid: false, status: 'already_redeemed', message: 'Code has been redeemed' })
      setCode('')
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to redeem code'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = () => {
    if (!result) return 'gray'
    switch (result.status) {
      case 'valid':
        return 'green'
      case 'not_found':
      case 'invalid':
      case 'expired':
        return 'red'
      case 'already_redeemed':
        return 'yellow'
      default:
        return 'gray'
    }
  }

  const getStatusIcon = () => {
    if (!result) return null
    const color = getStatusColor()
    
    switch (color) {
      case 'green':
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case 'red':
        return <XCircle className="h-16 w-16 text-red-500" />
      case 'yellow':
        return <AlertCircle className="h-16 w-16 text-yellow-500" />
      default:
        return null
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Code Verification</h1>
        <p className="text-gray-600 mt-2">Verify and redeem discount codes at checkout</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Enter Discount Code</CardTitle>
          <CardDescription>
            Enter the customer's discount code to verify its validity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheck} className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <TagIcon className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter code (e.g., A7B2X9)"
                  className="pl-12 h-14 text-lg font-mono uppercase"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={10}
                  autoFocus
                />
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className="h-14 px-8"
                disabled={loading || !code.trim()}
              >
                {loading ? (
                  'Checking...'
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Verify
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className={`border-2 ${
          getStatusColor() === 'green' ? 'border-green-500 bg-green-50/50' :
          getStatusColor() === 'red' ? 'border-red-500 bg-red-50/50' :
          'border-yellow-500 bg-yellow-50/50'
        }`}>
          <CardContent className="pt-8">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                {getStatusIcon()}
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {result.message}
              </h2>
              <Badge 
                variant={result.valid ? 'default' : 'secondary'}
                className={`text-sm ${
                  getStatusColor() === 'green' ? 'bg-green-500' :
                  getStatusColor() === 'red' ? 'bg-red-500' :
                  'bg-yellow-500'
                }`}
              >
                {result.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            {result.discount && (
              <div className="bg-white rounded-lg p-6 space-y-4 border">
                <h3 className="font-semibold text-lg mb-4">Code Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <TagIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Code</p>
                      <p className="font-mono font-bold text-lg">{result.discount.code}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <TagIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Value</p>
                      <p className="font-semibold">
                        {result.discount.value}
                        {result.discount.discount_type === 'percentage' ? '%' : ' AED'} off
                      </p>
                    </div>
                  </div>

                  {result.discount.assigned_to && (
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Assigned To</p>
                        <p className="font-semibold">@{result.discount.assigned_to}</p>
                      </div>
                    </div>
                  )}

                  {result.discount.expiry_date && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Expires</p>
                        <p className="font-semibold">
                          {new Date(result.discount.expiry_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {result.mention && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold mb-3">Instagram Mention</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-600">Handle:</span>{' '}
                        <span className="font-semibold">@{result.mention.ig_handle}</span>
                      </p>
                      <p>
                        <span className="text-gray-600">Sentiment Score:</span>{' '}
                        <Badge variant="outline">{result.mention.sentiment_score}/100</Badge>
                      </p>
                      {result.mention.content_url && (
                        <p>
                          <span className="text-gray-600">Content:</span>{' '}
                          <a 
                            href={result.mention.content_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-brand hover:underline"
                          >
                            View on Instagram
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {result.valid && (
              <div className="mt-6 flex justify-center">
                <Button 
                  size="lg" 
                  onClick={handleRedeem}
                  disabled={loading}
                  className="w-full max-w-xs h-14 text-lg"
                >
                  {loading ? 'Redeeming...' : 'Redeem Code'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!result && (
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="py-12 text-center">
            <TagIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Enter a code above to verify</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
