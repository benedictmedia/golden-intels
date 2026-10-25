import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Check, ExternalLink } from 'lucide-react'
import API_URL from '../../api/config'
import BrandLogo from '../../components/layout/BrandLogo'
import { WAVE_FINANCE_URL } from '../../utils/financePortal'

export default function FeePayment() {
  const location = useLocation()
  const navigate = useNavigate()
  const paymentId = new URLSearchParams(location.search).get('paymentId')
  const [alert, setAlert] = useState(null)
  const [loadingAlert, setLoadingAlert] = useState(Boolean(paymentId))

  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')
  const [amountReported, setAmountReported] = useState('')
  const [transactionReference, setTransactionReference] = useState('')

  useEffect(() => {
    if (!paymentId) return
    const token = localStorage.getItem('token')
    axios.get(`${API_URL}/api/fees/payments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        const payment = response.data.find(item => String(item.id) === paymentId)
        if (!payment) {
          setError('This fee statement could not be found for your account.')
          return
        }
        setAlert(payment)
      })
      .catch(fetchError => {
        console.error('Failed to reload fee statement:', fetchError)
        setError('Could not load this fee statement. Please return to the parent portal and try again.')
      })
      .finally(() => setLoadingAlert(false))
  }, [paymentId])

  const studentName = alert?.student ? `${alert.student.firstName} ${alert.student.lastName}`.trim() : null
  const monthYear = alert
    ? (alert.term ? `${alert.academicYear} · ${alert.term}` : `${alert.month || 'Legacy'} ${alert.year || ''}`)
    : null
  const amountText = alert
    ? (alert.balance > 0 ? `GH₵ ${Number(alert.balance).toFixed(2)}` : `GH₵ ${Number(alert.amountDue).toFixed(2)}`)
    : null

  const handleConfirmPayment = async () => {
    if (!alert?.id) {
      setError('Please open a fee statement from your parent portal before reporting payment.')
      return
    }
    setConfirming(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${API_URL}/api/fees/payments/${alert.id}/response`,
        { responseType: 'paid-part-or-full', amountReported, transactionReference },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setConfirmed(true)
    } catch (err) {
      console.error('Failed to confirm payment:', err)
      setError('Could not confirm that your payment report was sent. Please retry or contact the school office.')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-lg">
        <button
          onClick={() => navigate('/parent')}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#2563eb] mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <BrandLogo className="w-10 h-10 shadow-sm" />
            <div>
              <h1 className="text-xl font-bold text-[#2563eb] font-serif">Complete Fee Payment</h1>
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

          {loadingAlert ? (
            <p className="py-8 text-center text-sm text-gray-500">Loading fee statement…</p>
          ) : confirmed ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
              <Check className="mx-auto text-blue-600 mb-2" size={32} />
              <p className="font-bold text-blue-700 mb-1">Payment reported to the school</p>
              <p className="text-sm text-blue-700 mb-4">
                Your report is in the parent-school Messages conversation and the admin has been notified. Academic records will remain locked until the school verifies your payment and updates the fee balance.
              </p>
              <button
                onClick={() => navigate('/parent')}
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            alert ? (
            <>
              <p className="text-sm text-gray-600 mb-5">
                Make your payment in the school’s Wave Finance portal. When you return here, report the payment so the school can verify it. Reporting a payment does not unlock academic records; an administrator must verify it and update the fee balance.
              </p>

                <a
                  href={WAVE_FINANCE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-5 py-3 font-bold text-white transition-colors hover:bg-[#1d4ed8]"
                >
                  Open Wave Finance
                  <ExternalLink size={18} />
                </a>

                <div className="mb-6 space-y-4">
                  <div>
                    <label htmlFor="reported-payment-amount" className="mb-1 block text-sm font-semibold text-gray-700">Amount paid (GH₵, optional)</label>
                    <input id="reported-payment-amount" type="number" min="0.01" step="0.01" value={amountReported} onChange={event => setAmountReported(event.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-800" />
                  </div>
                  <div>
                    <label htmlFor="payment-reference" className="mb-1 block text-sm font-semibold text-gray-700">Wave transaction reference (optional)</label>
                    <input id="payment-reference" type="text" maxLength={120} value={transactionReference} onChange={event => setTransactionReference(event.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-800" />
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
                className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
              >
                {confirming ? 'Sending report...' : 'Report Payment to School'}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">
                Your report will appear in Messages for both you and the school. The admin must verify payment before access is restored.
              </p>
            </>
            ) : (
              <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                {error || 'Open a fee statement from the parent portal to continue.'}
              </p>
            )
          )}
        </div>
      </div>
    </div>
  )
}