import { useSearchParams } from 'react-router-dom'

export default function usePortalSection(defaultSection, validSections) {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedSection = searchParams.get('tab')
  const activeSection = validSections.includes(requestedSection) ? requestedSection : defaultSection

  const setActiveSection = (section) => {
    const nextSection = validSections.includes(section) ? section : defaultSection
    setSearchParams(currentParams => {
      const nextParams = new URLSearchParams(currentParams)
      if (nextSection === defaultSection) {
        nextParams.delete('tab')
      } else {
        nextParams.set('tab', nextSection)
      }
      return nextParams
    })
  }

  return [activeSection, setActiveSection]
}
