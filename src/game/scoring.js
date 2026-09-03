export function applyDecision(state, scenario, option){
  const completed=state.completed.includes(scenario.id)?state.completed:[...state.completed,scenario.id]
  const xp=Math.min(120,state.xp+option.xp)
  const badges=[...new Set([...state.badges,...(option.good?[scenario.id]:[])])]
  return {...state,xp,risk:Math.max(0,Math.min(100,state.risk+option.risk)),completed,badges}
}
export function level(xp){return xp>=100?3:xp>=50?2:1}
