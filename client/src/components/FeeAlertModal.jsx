import { useState } from 'react'
import { AlertCircle, Send } from 'lucide-react'
import axios from 'axios'
import API_URL from '../api/config'

export default function FeeAlertModal({ alerts, onClose, token }) {
  const [respondingId, setRespondingId] = useState(null)
  const [error, setError] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!alerts || alerts.length === 0) return null

  const alert = alerts[currentIndex]

  const handleResponse = async (responseType) => {
    if (!alert) return
    setRespondingId(alert.id)
    setError('')

    try {
      const headers = { Authorization: `Bearer ${token}` }
      
      // Send response to admin
      await axios.post(
        `${API_URL}/api/fees/payments/${alert.id}/response`,
        { responseType },
        { headers }
      )

      // Move to next alert or close modal
      if (currentIndex < alerts.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setRespondingId(null)
      } else {
        onClose()
      }
    } catch (err) {
      console.error('Failed to send response:', err)
      setError('Failed to send response. Please try again.')
      setRespondingId(null)
    }
  }

  const studentName = `${alert.student.firstName} ${alert.student.lastName}`.trim()
  const monthYear = `${alert.month} ${alert.year}`
  const balanceText = alert.balance > 0 
    ? `GH₵ ${alert.balance.toFixed(2)} outstanding`
    : `Due: GH₵ ${alert.amountDue.toFixed(2)}`

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <div className="flex-shrink-0">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Fee Update</h2>
            <p className="text-sm text-gray-500 mt-1">
              Alert {currentIndex + 1} of {alerts.length}
            </p>
          </div>
        </div>

        {/* Message */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded mb-6">
          <p className="text-gray-700 leading-relaxed">
            Hello! We noticed that the fee for <span className="font-semibold">{studentName}</span> ({monthYear}) is still outstanding. We understand life happens—kindly let us know if you've made a payment or when you plan to. Thanks for supporting your child's education. We nurture for nature!
          </p>
          <p className="text-sm text-gray-600 mt-3 font-medium">
            {balanceText}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleResponse('paid-part-or-full')}
            disabled={respondingId !== null}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            {respondingId === alert.id ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Sending...
              </>
            ) : (
              <>
                <Send size={18} />
                I've Paid Part or Full
              </>
            )}
          </button>

          <button
            onClick={() => handleResponse('will-soon-pay')}
            disabled={respondingId !== null}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            {respondingId === alert.id ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Sending...
              </>
            ) : (
              <>
                <Send size={18} />
                I'll Soon Pay
              </>
            )}
          </button>
        </div>

        {/* Alert Count Indicator */}
        {alerts.length > 1 && (
          <div className="mt-6 flex gap-1 justify-center">
            {alerts.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  idx <= currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              ></div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 text-center mt-6">
          Your response helps us understand your payment status and keeps your account updated.
        </p>
      </div>
    </div>
  )
}
