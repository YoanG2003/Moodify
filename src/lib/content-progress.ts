export function toggleCompletedStep(checkedSteps: number[], stepIndex: number) {
  return checkedSteps.includes(stepIndex)
    ? checkedSteps.filter((index) => index !== stepIndex)
    : [...checkedSteps, stepIndex].sort((left, right) => left - right);
}

export function areAllStepsComplete(stepIndexes: number[], checkedSteps: number[]) {
  return stepIndexes.length > 0 && stepIndexes.every((index) => checkedSteps.includes(index));
}
