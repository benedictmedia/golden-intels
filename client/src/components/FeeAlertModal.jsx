import { AlertCircle, ArrowRight } from 'lucide-react'

export default function FeeAlertModal({ alerts, onPayNow }) {
  if (!alerts || alerts.length === 0) return null

  const alert = alerts[0]
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
            <h2 className="text-xl font-bold text-gray-800">Fee Payment Required</h2>
            {alerts.length > 1 && (
              <p className="text-sm text-gray-500 mt-1">
                {alerts.length} outstanding fee alerts on your account
              </p>
            )}
          </div>
        </div>

        {/* Message */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded mb-6">
          <p className="text-gray-700 leading-relaxed">
            Hello! The fee for <span className="font-semibold">{studentName}</span> ({monthYear}) is still outstanding. Kindly complete payment as soon as possible. We nurture for nature!
          </p>
          <p className="text-sm text-gray-600 mt-3 font-medium">
            {balanceText}
          </p>
        </div>

        {/* Admin Notes */}
        {alert.notes && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded mb-6">
            <p className="text-xs font-semibold text-blue-900 mb-1">School Note:</p>
            <p className="text-sm text-blue-800">{alert.notes}</p>
          </div>
        )}

        {/* Single Action Button */}
        <button
          onClick={() => onPayNow(alert)}
          className="w-full bg-[#128038] hover:bg-[#15803d] text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
        >
          Proceed to Payment
          <ArrowRight size={18} />
        </button>

        {/* Alert Count Indicator */}
        {alerts.length > 1 && (
          <div className="mt-6 flex gap-1 justify-center">
            {alerts.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full ${idx === 0 ? 'bg-blue-500' : 'bg-gray-300'}`}
              ></div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 text-center mt-6">
          Please pay the outstanding fee to continue accessing your child's academic records.
        </p>
      </div>
    </div>
  )
}