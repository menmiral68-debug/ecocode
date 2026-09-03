const KEY='eco-code-progress-v1'
const initial={name:'',xp:0,risk:42,completed:[],badges:[]}
export function loadState(){try{return {...initial,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return initial}}
export function saveState(state){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
export function resetState(){try{localStorage.removeItem(KEY)}catch{}return initial}
