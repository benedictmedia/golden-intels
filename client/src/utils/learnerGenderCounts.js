export const countLearnersByGender = (learners) => {
  return (Array.isArray(learners) ? learners : []).reduce((counts, learner) => {
    const gender = String(learner?.gender ?? '').trim().toLocaleLowerCase()
    if (gender === 'male') counts.male++
    if (gender === 'female') counts.female++
    return counts
  }, { male: 0, female: 0 })
}