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
  
  // Coach States
  const [coachAnalysis, setCoachAnalysis] = useState('')
  const [coachAlternatives, setCoachAlternatives] = useState('')
  const [coachConfidence, setCoachConfidence] = useState('—')
  const [coachLoading, setCoachLoading] = useState(false)
  
  // Save Vault States
  const [savingVault, setSavingVault] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')

  const scrollRef = useRef(null)

  useEffect(()=>{ if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [messages, aiTyping])

  const startScenario = (s) => {
    setScenario(s)
    setMessages([{ id:'sys', who:'ai', text: `Scenario: ${s.title}. The AI will play a ${role} in a ${tone} tone. Say hi to begin.` }])
    setStage('chat')
    setInput('')
    setCoachAnalysis('')
    setCoachAlternatives('')
    setCoachConfidence('—')
    setSaveStatus('')
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
      setCoachAnalysis('')
      setCoachAlternatives('')
      setCoachConfidence('—')
    }catch(e){
      console.error(e)
      restart()
    }finally{ setLoading(false) }
  }

  async function send(){
    if(!input.trim()) return
    const userMsg = { id: Date.now(), who: 'user', text: input, ts: new Date().toISOString() }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setAiTyping(true)
    setCoachAnalysis('') // Clear coach on new message
    setCoachAlternatives('')
    setCoachConfidence('—')

    try{
      const transcript = updatedMessages.map(m => `${m.who === 'user' ? 'Me' : 'AI'}: ${m.text}`).join('\n')
      const fullPrompt = `Scenario: ${scenario?.title || 'general'}
Role: ${role}
Tone: ${tone}
Difficulty: ${difficulty}

Conversation history:
${transcript}
AI:`
      
      const body = { prompt: fullPrompt, scenario: scenario ? scenario.id : 'general', tone, difficulty, role }
      const res = await apiFetch('/api/simulate', { method:'POST', headers: authHeaders({ 'Content-Type':'application/json' }), body: JSON.stringify(body) })
      const data = await res.json()
      
      const reply = data.result?.reply || data.result || (data.reply) || `Simulated reply (stub) to: ${input}`
      const aiMsg = { id: Date.now()+1, who:'ai', text: reply, ts: new Date().toISOString() }
      
      // simulate typing delay
      await new Promise(r=>setTimeout(r, 600))
      setMessages(m => [...m, aiMsg])
    }catch(err){
      console.error(err)
      setMessages(m => [...m, { id: Date.now()+2, who:'ai', text: 'Sorry, something went wrong (simulation failed).' }])
    }finally{
      setAiTyping(false)
    }
  }

  function restart(){
    if(!scenario) return setStage('home')
    startScenario(scenario)
  }

  async function handleAnalyzeMsg() {
    const lastUser = [...messages].reverse().find(m => m.who === 'user')
    if (!lastUser) return
    setCoachLoading(true)
    try {
      const prompt = `Return a JSON object analyzing this user message: "${lastUser.text}". Keys required: "analysis" (string, short feedback), "confidence" (number 0-100). Do not include any markdown blocks.`
      const res = await apiFetch('/api/simulate', { method:'POST', headers: authHeaders({ 'Content-Type':'application/json' }), body: JSON.stringify({ prompt, scenario: 'coach' }) })
      const data = await res.json()
      const reply = data.result?.reply || data.result || data.reply || ''
      let obj = {}
      try { obj = typeof reply === 'string' ? JSON.parse(reply.replace(/^```json\s*/, '').replace(/\s*```$/, '')) : reply } 
      catch (err) { console.error('Parse error', err); obj = { analysis: reply } }
      
      setCoachAnalysis(obj.analysis || 'Analysis complete.')
      setCoachConfidence(obj.confidence ? `${obj.confidence}%` : '—')
    } catch (err) {
      console.error(err)
      setCoachAnalysis('Analysis failed.')
    } finally {
      setCoachLoading(false)
    }
  }

  async function handleSuggestAlts() {
    const lastUser = [...messages].reverse().find(m => m.who === 'user')
    if (!lastUser) return
    setCoachLoading(true)
    try {
      const prompt = `Suggest 3 short, better alternative ways to say: "${lastUser.text}" in a ${tone} tone. Keep it encouraging.`
      const res = await apiFetch('/api/simulate', { method:'POST', headers: authHeaders({ 'Content-Type':'application/json' }), body: JSON.stringify({ prompt, scenario: 'coach' }) })
      const data = await res.json()
      setCoachAlternatives(data.result?.reply || data.result || data.reply || 'No suggestions.')
    } catch(err) {
      console.error(err)
      setCoachAlternatives('Failed to generate alternatives.')
    } finally {
      setCoachLoading(false)
    }
  }

  async function handleSaveVault() {
    setSavingVault(true)
    setSaveStatus('')
    const transcript = messages.map(m=>`${m.who}: ${m.text}`).join('\n')
    const prompt = `Return ONLY a JSON object with keys: summary (one-line), tone (label), confidence (0-100 number), keyPoints (array of up to 3 short strings). Do not include any other text or markdown blocks. Conversation:\n${transcript}`
    
    let analysisObj = null
    try {
      const res = await apiFetch('/api/simulate', { method:'POST', headers: authHeaders({ 'Content-Type':'application/json' }), body: JSON.stringify({ prompt, scenario: 'analysis' }) })
      const data = await res.json()
      const reply = data.result?.reply || data.result || data.reply || ''
      try { analysisObj = typeof reply === 'string' ? JSON.parse(reply.replace(/^```json\s*/, '').replace(/\s*```$/, '')) : reply } catch (err) { console.error('Parse error', err) }
    } catch (err) {
      console.error('AI Analysis failed during save', err)
    }

    const body = { summary: transcript.slice(0,300), transcript, mood: 'confident', tags: ['simulation'] }
    if (analysisObj) body.analysis = analysisObj

    try {
      const res = await apiFetch('/api/conversations', { method:'POST', headers: authHeaders({ 'Content-Type':'application/json' }), body: JSON.stringify(body) })
      if(res.ok) setSaveStatus('✅ Saved!')
      else setSaveStatus('❌ Failed to save')
    } catch(e) {
      console.error(e)
      setSaveStatus('❌ Failed to save')
    } finally {
      setSavingVault(false)
      setTimeout(() => setSaveStatus(''), 3000)
    }
  }

  return (
    <AppLayout>
    <div className="page-shell">
      {stage === 'home' ? (
        <>
          <PageHeader
            title="Conversation Simulator"
            subtitle="Choose a scenario and practice safely — the AI remembers your context."
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
          <div className={styles.chatMain}>
            <button type="button" className={styles.chatBack} onClick={() => setStage('home')}>
              ← Back to scenarios
            </button>
            <div className={styles.chatHeader}>
              <div>
                <h2>{scenario?.title}</h2>
                <div className={styles.chatMeta}><small>{scenario?.desc}</small></div>
              </div>
              <div className={styles.chatControls}>
                <button type="button" className="btn" onClick={restartWithAI} disabled={loading}>Restart</button>
                <label className={styles.controlInline}>
                  <select value={tone} onChange={e=>setTone(e.target.value)}>
                    <option>Friendly</option>
                    <option>Formal</option>
                    <option>Cool</option>
                    <option>Confident</option>
                    <option>Shy</option>
                  </select>
                </label>

                <label className={styles.controlInline}>
                  <select value={difficulty} onChange={e=>setDifficulty(e.target.value)}>
                    <option>Easy</option>
                    <option>Normal</option>
                    <option>Social Challenge</option>
                  </select>
                </label>

                <label className={styles.controlInline}>
                  <select value={role} onChange={e=>setRole(e.target.value)}>
                    <option value="classmate">Classmate</option>
                    <option value="teacher">Teacher</option>
                    <option value="friend">Friend</option>
                    <option value="stranger">Stranger</option>
                  </select>
                </label>
                <button type="button" className="btn" onClick={handleSaveVault} disabled={savingVault || messages.length < 2}>
                  {savingVault ? 'Saving...' : saveStatus || 'Save to Vault'}
                </button>
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
              <button type="button" className="btn btn-primary" onClick={send} disabled={aiTyping}>Send</button>
            </div>
          </div>

          <aside className={styles.coachPanel}>
            <h3>Coach View</h3>
            <div className={styles.coachSection}>
              <strong>Tone Analysis</strong>
              <div className={styles.muted}>Select a user message and press Analyze</div>
              <button className="btn" onClick={handleAnalyzeMsg} disabled={coachLoading || messages.length < 2}>
                {coachLoading ? 'Analyzing...' : 'Analyze Last Message'}
              </button>
              {coachAnalysis && <div className={styles.coachResult}>{coachAnalysis}</div>}
            </div>

            <div className={styles.coachSection}>
              <strong>Better Alternatives</strong>
              <div className={styles.muted}>Quick rescue options</div>
              <button className="btn" onClick={handleSuggestAlts} disabled={coachLoading || messages.length < 2}>
                Suggest Alternatives
              </button>
              {coachAlternatives && <div className={styles.coachResult} style={{whiteSpace: 'pre-line'}}>{coachAlternatives}</div>}
            </div>

            <div className={styles.coachSection}>
              <strong>Confidence Meter</strong>
              <div className={styles.muted}>Your message clarity: <strong>{coachConfidence}</strong></div>
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
