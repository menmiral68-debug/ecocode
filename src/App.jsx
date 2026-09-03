import React,{useEffect,useState} from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import ProjectStory from './components/ProjectStory.jsx'
import Simulator from './components/Simulator.jsx'
import Progress from './components/Progress.jsx'
import Roadmap from './components/Roadmap.jsx'
import ProfileModal from './components/ProfileModal.jsx'
import {loadState,saveState,resetState} from './game/gameState'

export default function App(){const [page,setPage]=useState('home');const [state,setState]=useState(loadState);const [profile,setProfile]=useState(false);useEffect(()=>saveState(state),[state]);function start(){setPage('simulator');window.scrollTo({top:0,behavior:'smooth'})}return <><Header page={page} setPage={setPage} state={state}/>{page==='home'&&<><Hero start={start}/><ProjectStory/><section className="callout"><div><span>ЭКОКОД</span><h2>{state.name?`${state.name}, готов(а) проверить себя?`:'Проверь себя в трёх решениях.'}</h2><p>Без регистрации и оценок. Только практика, последствия и XP.</p></div><button className="primary" onClick={start}>Войти в игру →</button></section><Roadmap/></>}{page==='simulator'&&<Simulator state={state} setState={setState} onFinish={()=>setPage('progress')}/>} {page==='progress'&&<><Progress state={state} onReset={()=>setState(resetState())}/><section className="teacher"><div><span className="kicker">Для педагога</span><h2>Можно использовать<br/>как короткий интерактив.</h2></div><p>Сценарий занимает около 15 минут и не требует аккаунта. Проект не собирает аналитику и не отправляет введённые данные на сервер.</p><button className="ghost" onClick={()=>setProfile(true)}>Настроить имя</button></section></>}{profile&&<ProfileModal state={state} setState={setState} onClose={()=>setProfile(false)}/>}<footer><span>ЭкоКод · конкурсный MVP · ЯНАО · 2026</span><span>Без аналитики · локальный прогресс</span></footer></>}
