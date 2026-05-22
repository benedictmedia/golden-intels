import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function LearnerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [assignments, setAssignments] = useState([])
  const [lessons, setLessons] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [submissions, setSubmissions] = useState({ assignments: {}, quizzes: {} })
  const [quizAnswers, setQuizAnswers] = useState({})
  const [assignmentAnswers, setAssignmentAnswers] = useState({})
  const [quizStartTimes, setQuizStartTimes] = useState({})
  const [assignmentStartTimes, setAssignmentStartTimes] = useState({})
  const [activeQuizId, setActiveQuizId] = useState(null)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const saved = window.localStorage.getItem('goldenIntelsLms')
    if (saved) {
      const parsed = JSON.parse(saved)
      setAssignments(parsed.assignments || [])
      setLessons(parsed.lessons || [])
      setQuizzes(parsed.quizzes || [])
    }
    const savedSubmissions = window.localStorage.getItem('goldenIntelsSubmissions')
    if (savedSubmissions) setSubmissions(JSON.parse(savedSubmissions))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    window.localStorage.setItem('goldenIntelsSubmissions', JSON.stringify(submissions))
  }, [submissions])

  const saveTeacherSubmissionRecord = (record) => {
    const existing = JSON.parse(window.localStorage.getItem('goldenIntelsSubmissionRecords') || '[]')
    const updated = [record, ...existing.filter(r => !(r.type === record.type && r.itemId === record.itemId && r.learnerEmail === record.learnerEmail))]
    window.localStorage.setItem('goldenIntelsSubmissionRecords', JSON.stringify(updated))
  }

  const getDeviceInfo = () => {
    if (typeof navigator === 'undefined') return 'Unknown device'
    return navigator.userAgent || navigator.platform || 'Unknown device'
  }

  const handleDownloadLearnerPdf = async (record) => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text('Learner Submission Report', 14, 20)
      doc.setFontSize(11)
      doc.text(`Name: ${record.learnerName || 'Learner'}`, 14, 30)
      doc.text(`Email: ${record.learnerEmail || 'No email'}`, 14, 36)
      doc.text(`Device: ${record.device || 'Unknown device'}`, 14, 42)
      doc.text(`Submitted: ${formatDateTime(record.submittedAt)}`, 14, 48)
      doc.text(`Time used: ${record.timeUsedSeconds != null ? `${Math.round(record.timeUsedSeconds)} sec` : 'N/A'}`, 14, 54)
      doc.text(`Resource: ${record.type} - ${record.title || 'N/A'}`, 14, 60)
      if (record.score != null) {
        doc.text(`Score: ${record.score} / ${record.totalQuestions ?? record.questions?.length ?? 'N/A'}`, 14, 66)
      }
      doc.text('Question Review:', 14, 76)
      let y = 84
      ;(record.questions || []).forEach((question, index) => {
        if (y > 260) {
          doc.addPage()
          y = 20
        }
        const selected = question.selected || 'No answer'
        const correct = question.answer || 'N/A'
        const match = question.answer != null && selected.trim().toLowerCase() === correct.trim().toLowerCase()
        const symbol = match ? '✔' : '✖'
        doc.setFontSize(12)
        doc.text(`Q${index + 1}. ${question.prompt}`, 14, y)
        y += 6
        doc.text(`${symbol} Your answer: ${selected}`, 18, y)
        y += 6
        doc.text(`Correct answer: ${correct}`, 18, y)
        y += 8
      })
      doc.save(`${record.learnerName || 'Learner'}-${record.type}-submission.pdf`)
    } catch (error) {
      console.error('Failed to generate learner PDF:', error)
    }
  }

  const formatDateTime = (value) => {
    if (!value) return '-'
    const date = new Date(value)
    return isNaN(date.getTime()) ? value : date.toLocaleString()
  }

  const publishedAssignments = assignments.filter(item => item.published)
  const publishedLessons = lessons.filter(item => item.published)
  const publishedQuizzes = quizzes.filter(item => item.published)

  const handleStartQuiz = (quizId) => {
    setActiveQuizId(quizId)
    setQuizStartTimes(prev => ({
      ...prev,
      [quizId]: prev[quizId] || new Date().toISOString()
    }))
  }

  const handleAssignmentAnswerChange = (assignmentId, value) => {
    setAssignmentAnswers(prev => ({ ...prev, [assignmentId]: value }))
    setAssignmentStartTimes(prev => ({
      ...prev,
      [assignmentId]: prev[assignmentId] || new Date().toISOString()
    }))
  }

  const handleSubmitAssignment = (assignment) => {
    const answer = assignmentAnswers[assignment.id] || ''
    if (!answer.trim()) return
    const submittedAt = new Date().toISOString()
    const startedAt = assignmentStartTimes[assignment.id] || submittedAt
    const timeUsedSeconds = Math.round((new Date(submittedAt).getTime() - new Date(startedAt).getTime()) / 1000)
    const learnerName = user?.name || 'Learner'
    const learnerEmail = user?.email || ''
    const device = getDeviceInfo()
    const record = {
      type: 'assignment',
      itemId: assignment.id,
      title: assignment.title,
      learnerName,
      learnerEmail,
      device,
      startedAt,
      submittedAt,
      timeUsedSeconds,
      answer,
      questions: [
        { prompt: assignment.description || assignment.title, selected: answer, answer: 'Student response' }
      ]
    }

    saveTeacherSubmissionRecord(record)
    setSubmissions(prev => ({
      ...prev,
      assignments: {
        ...prev.assignments,
        [assignment.id]: { answer, submittedAt, learnerName, learnerEmail, device, startedAt, timeUsedSeconds }
      }
    }))
    setAssignmentAnswers(prev => ({ ...prev, [assignment.id]: '' }))
  }

  const handleQuizAnswer = (quizId, questionIndex, value) => {
    setQuizStartTimes(prev => ({
      ...prev,
      [quizId]: prev[quizId] || new Date().toISOString()
    }))
    setQuizAnswers(prev => ({
      ...prev,
      [quizId]: {
        ...prev[quizId],
        [questionIndex]: value
      }
    }))
  }

  const handleSubmitQuiz = (quiz) => {
    const answers = quizAnswers[quiz.id] || {}
    const score = quiz.questions.reduce((sum, question, index) => {
      const value = answers[index]
      if (value === question.answer) return sum + 1
      return sum
    }, 0)
    const submittedAt = new Date().toISOString()
    const startedAt = quizStartTimes[quiz.id] || submittedAt
    const timeUsedSeconds = Math.round((new Date(submittedAt).getTime() - new Date(startedAt).getTime()) / 1000)
    const learnerName = user?.name || 'Learner'
    const learnerEmail = user?.email || ''
    const device = getDeviceInfo()
    const record = {
      type: 'quiz',
      itemId: quiz.id,
      title: quiz.title,
      learnerName,
      learnerEmail,
      device,
      startedAt,
      submittedAt,
      timeUsedSeconds,
      score,
      questions: quiz.questions.map((question, idx) => ({
        prompt: question.prompt,
        selected: answers[idx] || 'No answer',
        answer: question.answer
      }))
    }

    saveTeacherSubmissionRecord(record)
    setSubmissions(prev => ({
      ...prev,
      quizzes: {
        ...prev.quizzes,
        [quiz.id]: { answers, score, submittedAt, learnerName, learnerEmail, device, startedAt, timeUsedSeconds }
      }
    }))
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const activeAssignmentCount = publishedAssignments.length
  const activeQuizCount = publishedQuizzes.length
  const activeLessonCount = publishedLessons.length

  return (
    <div className="flex h-screen bg-blue-100 overflow-hidden">
      <div className="w-72 bg-[#0f6e56] text-white flex flex-col">
        <div className="p-6 border-b border-green-800">
          <p className="text-xs uppercase text-cyan-100 tracking-[0.2em] mb-2">Golden-Intels</p>
          <h1 className="text-2xl font-bold">Learner Portal</h1>
          <p className="text-sm text-blue-100 mt-2">Welcome, {user?.name || 'Learner'}</p>
        </div>
        <nav className="flex-1 p-6 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'resources', label: 'Resources' },
            { id: 'assignments', label: 'Assignments' },
            { id: 'quizzes', label: 'Quizzes' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-4 py-3 rounded-2xl transition-colors ${activeTab === item.id ? 'bg-blue-500 text-cyan-700 font-bold' : 'hover:bg-green-800 text-green-100'}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-green-800">
          <button onClick={handleLogout} className="w-full bg-blue-500 text-[#0f6e56] font-bold py-3 rounded-xl">Logout</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div>
            <span className="inline-block bg-yellow-400 text-[#0f6e56] uppercase text-xs font-bold px-3 py-1 rounded-full mb-3">Learner Portal</span>
            <h2 className="text-3xl font-bold text-[#0f6e56]">Your Learning Hub</h2>
            <p className="text-gray-600 mt-2 max-w-2xl">Access published lessons, complete assignments online and take quizzes with time-bound delivery.</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 text-center">
              <p className="text-xs uppercase text-gray-500">Lessons</p>
              <p className="text-3xl font-bold text-[#0f6e56]">{activeLessonCount}</p>
            </div>
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 text-center">
              <p className="text-xs uppercase text-gray-500">Assignments</p>
              <p className="text-3xl font-bold text-[#0f6e56]">{activeAssignmentCount}</p>
            </div>
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 text-center">
              <p className="text-xs uppercase text-gray-500">Quizzes</p>
              <p className="text-3xl font-bold text-[#0f6e56]">{activeQuizCount}</p>
            </div>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-[#0f6e56] mb-4">Latest Lesson</h3>
              {publishedLessons.length === 0 ? (
                <p className="text-gray-500">No lessons published yet.</p>
              ) : (
                <div>
                  <h4 className="text-lg font-bold text-[#0f6e56]">{publishedLessons[0].title}</h4>
                  <p className="text-sm text-gray-500 mb-4">{publishedLessons[0].subject} · {publishedLessons[0].gradeLevel}</p>
                  <p className="text-gray-600 leading-relaxed">{publishedLessons[0].content}</p>
                </div>
              )}
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-[#0f6e56] mb-4">Progress</h3>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Assignments completed: {Object.keys(submissions.assignments || {}).length}</p>
                <p className="text-sm text-gray-500">Quizzes completed: {Object.keys(submissions.quizzes || {}).length}</p>
                <p className="text-sm text-gray-500">Latest quiz score: {publishedQuizzes.length === 0 ? '-' : submissions.quizzes?.[publishedQuizzes[0].id]?.score ?? '-'}</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-[#0f6e56] mb-4">Next Deadline</h3>
              {publishedAssignments.length === 0 && publishedQuizzes.length === 0 ? (
                <p className="text-gray-500">No upcoming items yet.</p>
              ) : (
                <div className="space-y-3">
                  {publishedAssignments.slice(0, 1).map(item => (
                    <div key={item.id}>
                      <p className="text-sm font-bold text-[#0f6e56]">Assignment: {item.title}</p>
                      <p className="text-xs text-gray-500">Due {formatDateTime(item.dueDate)}</p>
                    </div>
                  ))}
                  {publishedQuizzes.slice(0, 1).map(item => (
                    <div key={item.id}>
                      <p className="text-sm font-bold text-[#0f6e56]">Quiz: {item.title}</p>
                      <p className="text-xs text-gray-500">Due {formatDateTime(item.dueDate)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div>
            <h3 className="text-2xl font-bold text-[#0f6e56] mb-4">Learning Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {publishedLessons.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center text-gray-400">No published lessons available.</div>
              ) : (
                publishedLessons.map(lesson => (
                  <div key={lesson.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <span className="inline-block bg-blue-100 text-cyan-700 text-xs font-bold px-3 py-1 rounded-full mb-3">{lesson.gradeLevel}</span>
                    <h4 className="text-xl font-bold text-[#0f6e56] mb-2">{lesson.title}</h4>
                    <p className="text-sm text-gray-500 mb-4">{lesson.subject}</p>
                    <p className="text-gray-600 leading-relaxed">{lesson.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div>
            <h3 className="text-2xl font-bold text-[#0f6e56] mb-4">Assignments</h3>
            <div className="grid grid-cols-1 gap-6">
              {publishedAssignments.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center text-gray-400">No active assignments yet.</div>
              ) : (
                publishedAssignments.map(assignment => {
                  const submission = submissions.assignments?.[assignment.id]
                  return (
                    <div key={assignment.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                        <div>
                          <h4 className="text-xl font-bold text-[#0f6e56]">{assignment.title}</h4>
                          <p className="text-sm text-gray-500">{assignment.subject} · {assignment.gradeLevel}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          Due {formatDateTime(assignment.dueDate)}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{assignment.description}</p>
                      {submission ? (
                        <div className="space-y-4">
                          <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4">
                            <p className="font-bold">Submitted</p>
                            <p className="text-sm">{submission.answer}</p>
                            <p className="text-xs text-gray-500 mt-2">{new Date(submission.submittedAt).toLocaleString()}</p>
                          </div>
                          <button
                            onClick={() => handleDownloadLearnerPdf({
                              ...submission,
                              type: 'assignment',
                              title: assignment.title,
                              questions: [{ prompt: assignment.description || assignment.title, selected: submission.answer, answer: 'Student response' }]
                            })}
                            className="bg-[#0f6e56] hover:bg-[#085041] text-white font-bold px-6 py-3 rounded-xl"
                          >
                            Download Answer PDF
                          </button>
                        </div>
                      ) : (
                                        <div className="space-y-4">
                          <label className="block text-sm font-bold text-[#0f6e56]">Fill in your answer</label>
                          <textarea
                            placeholder="Write your assignment answer here..."
                            value={assignmentAnswers[assignment.id] || ''}
                            onChange={e => handleAssignmentAnswerChange(assignment.id, e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700"
                          />
                          <button
                            onClick={() => handleSubmitAssignment(assignment)}
                            className="bg-[#0f6e56] hover:bg-[#085041] text-white font-bold px-6 py-3 rounded-xl"
                          >
                            Submit Assignment
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div>
            <h3 className="text-2xl font-bold text-[#0f6e56] mb-4">Quizzes</h3>
            <div className="grid grid-cols-1 gap-6">
              {publishedQuizzes.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center text-gray-400">No active quizzes yet.</div>
              ) : (
                publishedQuizzes.map(quiz => {
                  const submission = submissions.quizzes?.[quiz.id]
                  const startedAt = quizStartTimes[quiz.id] ? new Date(quizStartTimes[quiz.id]).getTime() : null
                  const durationMs = quiz.durationMinutes * 60 * 1000
                  const elapsed = startedAt ? Math.max(0, now - startedAt) : 0
                  const timeLeft = startedAt ? Math.max(0, durationMs - elapsed) : null
                  const dueDateExpired = quiz.dueDate ? new Date(quiz.dueDate).getTime() <= now : false
                  const expired = dueDateExpired || (startedAt !== null && timeLeft <= 0)
                  return (
                    <div key={quiz.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                        <div>
                          <h4 className="text-xl font-bold text-[#0f6e56]">{quiz.title}</h4>
                          <p className="text-sm text-gray-500">{quiz.subject} · {quiz.gradeLevel}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {expired
                            ? 'Quiz closed'
                            : startedAt
                              ? `Time left: ${Math.floor(timeLeft / 1000 / 60)}:${String(Math.floor((timeLeft / 1000) % 60)).padStart(2, '0')}`
                              : 'Not started'}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">Due {formatDateTime(quiz.dueDate)} · Duration: {quiz.durationMinutes} mins.</p>
                      {submission ? (
                        <div className="space-y-4">
                          <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4">
                            <p className="font-bold">Quiz submitted</p>
                            <p className="text-sm">Score: {submission.score} / {quiz.questions.length}</p>
                            <p className="text-xs text-gray-500 mt-2">{new Date(submission.submittedAt).toLocaleString()}</p>
                          </div>
                          <div className="space-y-4">
                            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                              <h4 className="text-lg font-bold text-[#0f6e56] mb-4">Review your answers</h4>
                              <div className="space-y-4">
                                {quiz.questions.map((question, idx) => {
                                  const selected = submission.answers?.[idx] || 'No answer'
                                  const isCorrect = String(selected).trim().toLowerCase() === String(question.answer).trim().toLowerCase()
                                  return (
                                    <div key={idx} className={`rounded-2xl p-4 border ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                      <div className="flex items-start justify-between gap-4">
                                        <p className="font-bold text-[#0f6e56]">Q{idx + 1}. {question.prompt}</p>
                                        <span className={`text-xs font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                          {isCorrect ? '✔ Correct' : '✖ Incorrect'}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-700 mt-2">Your answer: {selected}</p>
                                      <p className="text-sm text-gray-500">Correct answer: {question.answer}</p>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDownloadLearnerPdf({
                                ...submission,
                                type: 'quiz',
                                title: quiz.title,
                                questions: quiz.questions.map((question, idx) => ({
                                  prompt: question.prompt,
                                  selected: submission.answers?.[idx] || 'No answer',
                                  answer: question.answer
                                }))
                              })}
                              className="bg-[#0f6e56] hover:bg-[#085041] text-white font-bold px-6 py-3 rounded-xl"
                            >
                              Download Quiz PDF
                            </button>
                          </div>
                        </div>
                      ) : !activeQuizId || activeQuizId !== quiz.id ? (
                        <div className="space-y-4">
                          <button
                            onClick={() => handleStartQuiz(quiz.id)}
                            className="bg-[#0f6e56] hover:bg-[#085041] text-white font-bold px-6 py-3 rounded-xl"
                          >
                            {quizStartTimes[quiz.id] ? 'Continue Quiz' : 'Start Quiz'}
                          </button>
                        </div>
                      ) : expired ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4">This quiz is now closed.</div>
                      ) : (
                        <div className="space-y-6">
                          {quiz.questions.map((question, idx) => {
                            const selectedAnswer = quizAnswers[quiz.id]?.[idx] || ''
                            const isFillIn = question.type === 'fill-in'
                            return (
                              <div key={idx} className="bg-blue-50 rounded-2xl p-4">
                                <div className="flex items-center justify-between gap-4 mb-2">
                                  <p className="font-bold text-[#0f6e56]">Q{idx + 1}. {question.prompt}</p>
                                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">{isFillIn ? 'Fill in' : 'Multiple choice'}</span>
                                </div>
                                {isFillIn ? (
                                  <input
                                    type="text"
                                    value={selectedAnswer}
                                    placeholder="Type your answer here"
                                    onChange={e => handleQuizAnswer(quiz.id, idx, e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f6e56] text-gray-700"
                                  />
                                ) : (
                                  <div className="space-y-2">
                                    {question.options.map((option, optionIndex) => (
                                      <label key={optionIndex} className="flex items-center gap-3 cursor-pointer rounded-2xl border border-gray-200 p-3 hover:bg-white bg-white">
                                        <input
                                          type="radio"
                                          name={`quiz-${quiz.id}-q-${idx}`}
                                          value={option}
                                          checked={selectedAnswer === option}
                                          onChange={() => handleQuizAnswer(quiz.id, idx, option)}
                                          className="h-4 w-4 text-[#0f6e56]"
                                        />
                                        <span className="text-gray-700">{option}</span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                          <button
                            onClick={() => handleSubmitQuiz(quiz)}
                            className="bg-[#0f6e56] hover:bg-[#085041] text-white font-bold px-6 py-3 rounded-xl"
                          >
                            Submit Quiz
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
