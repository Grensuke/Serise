import React, { useState, useEffect, useRef } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/layout/PageHeader'
import styles from './Simulator.module.css'
import { apiFetch, authHeaders } from '../../utils/api'

const SCENARIOS = [
  { id: 'smalltalk', title: 'Small Talk Practice', icon: '💬', desc: 'Practice casual conversation starters.' },
  { id: 'ask-teacher', title: 'Asking a Doubt to a Teacher', icon: '📚', desc: 'Politely ask for clarification.' },
  { id: 'classmate', title: 'Start with a Classmate', icon: '😅', desc: 'Open a friendly chat.' },
  { id: 'awkward', title: 'Handling Awkward Silence', icon: '😬', desc: 'Smoothly recover the conversation.' },
  { id: 'say-no', title: 'Saying No Politely', icon: '✋', desc: 'Decline without guilt.' },
  { id: 'end', title: 'Ending Gracefully', icon: '🫶', desc: 'Wrap up a talk warmly.' },
  { id: 'apologize', title: 'Apologizing', icon: '🙏', desc: 'Say sorry sincerely.' },
  { id: 'new-message', title: 'Messaging Someone New', icon: '📩', desc: 'Start a DM with confidence.' },
]

export default function Simulator(){
  const [stage, setStage] = useState('home') // home | chat
  const [scenario, setScenario] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [aiTyping, setAiTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tone, setTone] = useState('Friendly')
  const [difficulty, setDifficulty] = useState('Normal')
  const [role, setRole] = useState('classmate')
  const [tonePreview, setTonePreview] = useState('')
  const [difficultyNote, setDifficultyNote] = useState('')
  const [roleNote, setRoleNote] = useState('')
  const scrollRef = useRef(null)

  useEffect(()=>{ if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [messages, aiTyping])

  const startScenario = (s) => {
    setScenario(s)
    setMessages([{ id:'sys', who:'ai', text: `Scenario: ${s.title}. The AI will play a ${role} in a ${tone} tone. Say hi to begin.` }])
    setStage('chat')
    setInput('')
  }

  // AI-integrated control actions
  async function restartWithAI(){
    if(!scenario) return restart()
    setLoading(true)
    try{
      const prompt = `Start the scenario '${scenario.title}' as a ${role} using a ${tone} tone and ${difficulty} difficulty. Provide one opening reply.`
      const res = await apiFetch('/api/simulate', { method:'POST', headers: authHeaders({ 'Content-Type':'application/json' }), body: JSON.stringify({ prompt, scenario: scenario.id }) })
      const data = await res.json()
      const reply = data.result?.reply || data.result || data.reply || `Hello — let's start.`
      setMessages([{ id:'sys', who:'ai', text: `Scenario: ${scenario.title}.` }, { id:Date.now(), who:'ai', text: reply }])
      setAiTyping(false)
    }catch(e){
      console.error(e)
      restart()
    }finally{ setLoading(false) }
  }

  async function send(){
    if(!input.trim()) return
    const userMsg = { id: Date.now(), who: 'user', text: input, ts: new Date().toISOString() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setAiTyping(true)

    try{
      const body = { prompt: input, scenario: scenario ? scenario.id : 'general', tone, difficulty, role }
      const res = await apiFetch('/api/simulate', { method:'POST', headers: authHeaders({ 'Content-Type':'application/json' }), body: JSON.stringify(body) })
      const data = await res.json()
      // aiService.simulate returns { reply: '...' } or stub
      const reply = data.result?.reply || data.result || (data.reply) || `Simulated reply (stub) to: ${input}`
      const aiMsg = { id: Date.now()+1, who:'ai', text: reply, ts: new Date().toISOString() }
      // simulate typing delay
      await new Promise(r=>setTimeout(r, 600))
      setMessages(m => [...m, aiMsg])
    }catch(e){
      setMessages(m => [...m, { id: Date.now()+2, who:'ai', text: 'Sorry, something went wrong (simulation failed).' }])
    }finally{
      setAiTyping(false)
    }
  }

  function restart(){
    if(!scenario) return setStage('home')
    startScenario(scenario)
  }

  async function coachAnalyze(text){
    // ask backend to simulate coach suggestions by calling simulate with a targeted prompt
    const coachPrompt = `Analyze tone and suggest 3 alternative replies for: "${text}" in a ${tone} tone.`
    const res = await apiFetch('/api/simulate', { method:'POST', headers: authHeaders({ 'Content-Type':'application/json' }), body: JSON.stringify({ prompt: coachPrompt, scenario: scenario?.id || 'coach' }) })
    const data = await res.json()
    return data.result?.reply || data.result || data.reply || 'No suggestions'
  }

  async function saveToVault(analysis){
    // Export current chat to Conversation Vault via POST /api/conversations
    const transcript = messages.map(m=>`${m.who}: ${m.text}`).join('\n')
    const body = { summary: transcript.slice(0,300), transcript, mood: 'confident', tags: ['simulation'] }
    if(analysis) body.analysis = analysis
    try{
      const res = await apiFetch('/api/conversations', { method:'POST', headers: authHeaders({ 'Content-Type':'application/json' }), body: JSON.stringify(body) })
      if(res.ok) alert('Saved to Vault')
      else alert('Save failed')
    }catch(e){ alert('Save failed') }
  }

  return (
    <AppLayout>
    <div className={`page-shell ${styles.page}`}>
      {stage === 'home' ? (
        <>
          <PageHeader
            title="Conversation Simulator"
            subtitle="Choose a scenario and practice safely — the AI responds like a real person."
          />
          <div className={styles.scenarioGrid}>
            {SCENARIOS.map(s=> (
              <div key={s.id} className={`ui-card ${styles.scenarioCard}`}>
                <div className={styles.icon}>{s.icon}</div>
                <div className={styles.scTitle}>{s.title}</div>
                <div className={styles.scDesc}>{s.desc}</div>
                <div className={styles.scActions}>
                  <button type="button" className="btn btn-primary" onClick={()=>startScenario(s)}>Start</button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.chatWrap}>
          <button type="button" className={styles.chatBack} onClick={() => setStage('home')}>
            ← Back to scenarios
          </button>
          <div className={styles.chatMain}>
            <div className={`ui-card ${styles.chatHeader}`}>
              <div>
                <h2>{scenario?.title}</h2>
                <div className={styles.chatMeta}><small>{scenario?.desc}</small></div>
              </div>
                <div className={styles.chatControls}>
                <button type="button" className="btn" onClick={restartWithAI} disabled={loading}>Restart</button>
                <label className={styles.controlInline}>
                  <select value={tone} onChange={async e=>{ const t=e.target.value; setTone(t);
                      const prompt = `Provide a one-line example reply in a ${t} tone for the scenario: ${scenario?.title || ''}`
                      try{ const res = await apiFetch('/api/simulate', { method:'POST', headers: authHeaders({ 'Content-Type':'application/json' }), body: JSON.stringify({ prompt, scenario: scenario?.id }) }); const d=await res.json(); setTonePreview(d.result?.reply||d.result||d.reply||'') }catch(err){ setTonePreview('') }
                    }}>
                    <option>Friendly</option>
                    <option>Formal</option>
                    <option>Cool</option>
                    <option>Confident</option>
                    <option>Shy</option>
                  </select>
                </label>

                <label className={styles.controlInline}>
                  <select value={difficulty} onChange={async e=>{ const d=e.target.value; setDifficulty(d); const prompt = `As difficulty ${d}, give one hint or behavior change for the AI in scenario ${scenario?.title || ''}`; try{ const res = await apiFetch('/api/simulate', { method:'POST', headers: authHeaders({ 'Content-Type':'application/json' }), body: JSON.stringify({ prompt, scenario: scenario?.id }) }); const data=await res.json(); setDifficultyNote(data.result?.reply||data.result||data.reply||'') }catch(err){ setDifficultyNote('') } }}>
                    <option>Easy</option>
                    <option>Normal</option>
                    <option>Social Challenge</option>
                  </select>
                </label>

                <label className={styles.controlInline}>
                  <select value={role} onChange={async e=>{ const r=e.target.value; setRole(r); const prompt = `You are changing role to ${r} for scenario ${scenario?.title||''}. Provide a one-line example reply and role description.`; try{ const res = await apiFetch('/api/simulate', { method:'POST', headers: authHeaders({ 'Content-Type':'application/json' }), body: JSON.stringify({ prompt, scenario: scenario?.id }) }); const data=await res.json(); setRoleNote(data.result?.reply||data.result||data.reply||'') }catch(err){ setRoleNote('') } }}>
                    <option value="classmate">Classmate</option>
                    <option value="teacher">Teacher</option>
                    <option value="friend">Friend</option>
                    <option value="stranger">Stranger</option>
                  </select>
                </label>
                <button type="button" className="btn" onClick={async ()=>{
                  const transcript = messages.map(m=>`${m.who}: ${m.text}`).join('\n')
                  const prompt = `Return ONLY a JSON object with keys: summary (one-line), tone (label), confidence (0-100 number), keyPoints (array of up to 3 short strings). Do not include any other text. Conversation:\n${transcript}`
                  try{
                    const res = await apiFetch('/api/simulate', { method:'POST', headers: authHeaders({ 'Content-Type':'application/json' }), body: JSON.stringify({ prompt, scenario: 'analysis' }) })
                    const data = await res.json()
                    const reply = data.result?.reply || data.result || data.reply || ''
                    let analysisObj = null
                    try{ analysisObj = typeof reply === 'string' ? JSON.parse(reply) : reply }catch(err){ analysisObj = { raw: reply } }
                    const pretty = JSON.stringify(analysisObj, null, 2)
                    if(!confirm('AI analysis:\n'+pretty+'\n\nSave to Vault?')) return
                    await saveToVault(analysisObj)
                  }catch(e){ alert('Analysis failed, saving without AI.'); await saveToVault(null) }
                }}>Save to Vault</button>
              </div>
              <div className={styles.controlNotes}>
                {tonePreview && <div><strong>Tone preview:</strong> {tonePreview}</div>}
                {difficultyNote && <div><strong>Difficulty:</strong> {difficultyNote}</div>}
                {roleNote && <div><strong>Role note:</strong> {roleNote}</div>}
              </div>
            </div>

            <div className={styles.chatWindow} ref={scrollRef}>
              {messages.map(m=> (
                <div key={m.id} className={m.who==='ai' ? styles.bubbleAi : styles.bubbleUser}>
                  <div className={styles.bubbleText}>{m.text}</div>
                  <div className={styles.bubbleTs}>{new Date(m.ts||Date.now()).toLocaleTimeString()}</div>
                </div>
              ))}
              {aiTyping && <div className={styles.typing}>AI is typing…</div>}
            </div>

            <div className={styles.chatInputRow}>
              <input className="form-input" value={input} onChange={e=>setInput(e.target.value)} placeholder="Type your message" onKeyDown={e=>{ if(e.key==='Enter') send() }} />
              <button type="button" className="btn btn-primary" onClick={send}>Send</button>
            </div>
          </div>

          <aside className={`ui-card ${styles.coachPanel}`}>
            <h3>Coach View</h3>
            <div className={styles.coachSection}>
              <strong>Tone Analysis</strong>
              <div className={styles.muted}>Select a user message and press Analyze</div>
              <button className="btn" onClick={async ()=>{
                const lastUser = [...messages].reverse().find(m=>m.who==='user')
                if(!lastUser) return alert('No user message')
                const r = await coachAnalyze(lastUser.text)
                alert('Coach suggestions:\n'+r)
              }}>Analyze Last Message</button>
            </div>

            <div className={styles.coachSection}>
              <strong>Better Alternatives</strong>
              <div className={styles.muted}>Quick rescue options</div>
              <button className="btn" onClick={async ()=>{
                const lastUser = [...messages].reverse().find(m=>m.who==='user')
                if(!lastUser) return alert('No user message')
                const res = await coachAnalyze(lastUser.text)
                // show as simple split
                alert('Alternatives:\n'+res)
              }}>Suggest Alternatives</button>
            </div>

            <div className={styles.coachSection}>
              <strong>Confidence Meter</strong>
              <div className={styles.muted}>Your message clarity: <strong>—</strong></div>
            </div>

            <div className={styles.coachSection}>
              <strong>Conversation Tips</strong>
              <ul>
                <li>Try asking a question to keep it going.</li>
                <li>Keep messages short to reduce overthinking.</li>
              </ul>
            </div>
          </aside>
        </div>
      )}
    </div>
    </AppLayout>
  )
}
