import { useEffect, useState } from 'react'
import axios from 'axios'
import API_URL from '../api/config'

const DEFAULT_YEAR = '2026/2027'
const DEFAULT_TERM = 'Term 1'

export default function useAcademicPeriods() {
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(DEFAULT_YEAR)
  const [selectedTerm, setSelectedTerm] = useState(DEFAULT_TERM)
  const [academicYears, setAcademicYears] = useState([DEFAULT_YEAR])
  const [terms, setTerms] = useState([DEFAULT_TERM])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    const token = localStorage.getItem('token')
    axios.get(`${API_URL}/api/academic-context`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(({ data }) => {
      if (cancelled) return
      const year = data.academicYear || DEFAULT_YEAR
      const term = data.term || DEFAULT_TERM
      setSelectedAcademicYear(year)
      setSelectedTerm(term)
      setAcademicYears(data.availableAcademicYears || [year])
      setTerms(data.availableTerms || [term])
      setLoaded(true)
    }).catch(() => {
      if (!cancelled) setLoaded(true)
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!loaded) return undefined
    let cancelled = false
    const token = localStorage.getItem('token')
    axios.get(`${API_URL}/api/academic-context`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { academicYear: selectedAcademicYear }
    }).then(({ data }) => {
      if (cancelled) return
      const allowedTerms = data.availableTerms || []
      setTerms(allowedTerms)
      setSelectedTerm(current => allowedTerms.includes(current) ? current : (allowedTerms.at(-1) || DEFAULT_TERM))
    }).catch(() => {})
    return () => { cancelled = true }
  }, [loaded, selectedAcademicYear])

  return {
    academicYears,
    terms,
    selectedAcademicYear,
    setSelectedAcademicYear,
    selectedTerm,
    setSelectedTerm
  }
}