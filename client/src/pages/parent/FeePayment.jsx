import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Copy, Check, Smartphone, Landmark } from 'lucide-react'
import API_URL from '../../api/config'
import BrandLogo from '../../components/layout/BrandLogo'

// TODO: Replace these with Golden-Intels International School's actual
// Mobile Money and bank account details. Keeping them in one place here
// makes them easy to update later without touching the rest of the page.
const PAYMENT_DETAILS = {
  momo: [
    { network: 'MTN Mobile Money', number: '0598958215', accountName: 'Goldenintels Educare' },
  ],
  bank: {
    bankName: 'GCB',
    accountName: 'Goldenintels Educare',
    accountNumber: '5011440001106',
    branch: 'Ho-Main Branch',
  },
}

function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API unavailable, silently ignore
    }
  }

  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-bold text-gray-800">{value}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-[#0f6e56] hover:text-[#0f6e56] transition-colors text-gray-600"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

export default function FeePayment() {
  const location = useLocation()
  const navigate = useNavigate()
  const alert = location.state?.alert || null

  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')

  const studentName = alert?.student ? `${alert.student.firstName} ${alert.student.lastName}`.trim() : null
  const monthYear = alert ? `${alert.month} ${alert.year}` : null
  const amountText = alert
    ? (alert.balance > 0 ? `GH₵ ${Number(alert.balance).toFixed(2)}` : `GH₵ ${Number(alert.amountDue).toFixed(2)}`)
    : null

  const handleConfirmPayment = async () => {
    if (!alert?.id) {
      navigate('/parent')
      return
    }
    setConfirming(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${API_URL}/api/fees/payments/${alert.id}/response`,
        { responseType: 'paid-part-or-full' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setConfirmed(true)
    } catch (err) {
      console.error('Failed to confirm payment:', err)
      setError('Could not notify the school automatically. Your payment is still valid — please contact the school office if this keeps happening.')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-lg">
        <button
          onClick={() => navigate('/parent')}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#0f6e56] mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <BrandLogo className="w-10 h-10 shadow-sm" />
            <div>
              <h1 className="text-xl font-bold text-[#0f6e56] font-serif">Complete Fee Payment</h1>
              <p className="text-xs text-gray-500">Golden-Intels International School</p>
            </div>
          </div>

          {alert && (
            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                Payment for <span className="font-semibold">{studentName}</span> — {monthYear}
              </p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{amountText}</p>
            </div>
          )}

          {confirmed ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <Check className="mx-auto text-green-600 mb-2" size={32} />
              <p className="font-bold text-green-700 mb-1">Thank you!</p>
              <p className="text-sm text-green-600 mb-4">
                We've notified the school office of your payment. Records are usually updated within one working day.
              </p>
              <button
                onClick={() => navigate('/parent')}
                className="bg-[#0f6e56] hover:bg-[#085041] text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-5">
                Please make payment using one of the options below, then confirm on this page so the school office can verify and update your records.
              </p>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone size={18} className="text-[#0f6e56]" />
                  <h2 className="font-bold text-gray-800">Mobile Money</h2>
                </div>
                <div className="space-y-2">
                  {PAYMENT_DETAILS.momo.map((option) => (
                    <div key={option.number} className="border border-gray-100 rounded-xl p-3">
                      <p className="text-xs font-semibold text-gray-500 mb-2">{option.network}</p>
                      <div className="space-y-2">
                        <CopyRow label="Number" value={option.number} />
                        <CopyRow label="Account Name" value={option.accountName} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Landmark size={18} className="text-[#0f6e56]" />
                  <h2 className="font-bold text-gray-800">Bank Transfer</h2>
                </div>
                <div className="border border-gray-100 rounded-xl p-3 space-y-2">
                  <CopyRow label="Bank" value={PAYMENT_DETAILS.bank.bankName} />
                  <CopyRow label="Account Name" value={PAYMENT_DETAILS.bank.accountName} />
                  <CopyRow label="Account Number" value={PAYMENT_DETAILS.bank.accountNumber} />
                  <CopyRow label="Branch" value={PAYMENT_DETAILS.bank.branch} />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleConfirmPayment}
                disabled={confirming}
                className="w-full bg-[#0f6e56] hover:bg-[#085041] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
              >
                {confirming ? 'Confirming...' : "I've Completed This Payment"}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">
                Use your child's name as the payment reference so the office can match it quickly.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}