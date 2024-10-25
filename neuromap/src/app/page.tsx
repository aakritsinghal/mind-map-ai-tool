'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession, signIn, signOut } from "next-auth/react"
import { Mic, StopCircle, BrainCircuit, CheckSquare, Plus, LogIn, LogOut, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/trpc/react"

// Simulated AI function to extract topics from text
const extractTopics = (text: string) => {
  const topics = text.split(' ').filter(word => word.length > 5)
  return topics.slice(0, 5) // Return up to 5 topics
}

export default function VoiceNotes() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('voice')
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [topics, setTopics] = useState<string[]>([])
  const [todos, setTodos] = useState<{ text: string; priority: number }[]>([])
  const [newTodo, setNewTodo] = useState('')
  const recognitionRef = useRef<any>(null)
  const [isUpsertingText, setIsUpsertingText] = useState(false)
  const [upsertSuccess, setUpsertSuccess] = useState(false)

  const saveSpeechToText = api.speech.saveSpeechToText.useMutation()

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('')
        setTranscript(transcript)
      }
    }
  }, [])

  const startRecording = () => {
    setIsRecording(true)
    recognitionRef.current?.start()
  }

  const stopRecording = async () => {
    setIsRecording(false)
    recognitionRef.current?.stop()
    const extractedTopics = extractTopics(transcript)
    setTopics(extractedTopics)

    // Save the transcript to the database using tRPC
    setIsUpsertingText(true)
    setUpsertSuccess(false)
    try {
      await saveSpeechToText.mutateAsync({ text: transcript })
      console.log('Speech to text saved successfully')
      setUpsertSuccess(true)
    } catch (error) {
      console.error('Error saving speech to text:', error)
    } finally {
      setIsUpsertingText(false)
    }
  }

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { text: newTodo, priority: todos.length + 1 }])
      setNewTodo('')
    }
  }

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-8 flex items-center justify-center">
        <div className="w-full max-w-md bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden p-8 text-center">
          <h1 className="text-3xl font-bold mb-6">Welcome to VoiceNotes</h1>
          <p className="mb-6">Please sign in to access your personalized note-taking experience.</p>
          <Button onClick={() => signIn()} className="w-full">
            <LogIn className="w-5 h-5 mr-2" />
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden">
        <div className="p-4 flex justify-between items-center bg-white bg-opacity-50">
          <h1 className="text-xl font-bold">Welcome, {session?.user?.name}</h1>
          <Button onClick={() => signOut()} variant="ghost">
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white bg-opacity-50">
            <TabsTrigger value="voice" className="data-[state=active]:bg-white data-[state=active]:text-black">
              <Mic className="w-5 h-5 mr-2" />
              Voice Input
            </TabsTrigger>
            <TabsTrigger value="mindmap" className="data-[state=active]:bg-white data-[state=active]:text-black">
              <BrainCircuit className="w-5 h-5 mr-2" />
              Mindmap
            </TabsTrigger>
            <TabsTrigger value="todo" className="data-[state=active]:bg-white data-[state=active]:text-black">
              <CheckSquare className="w-5 h-5 mr-2" />
              Todo List
            </TabsTrigger>
          </TabsList>
          <TabsContent value="voice" className="p-6">
            <div className="space-y-4">
              <div className="flex justify-center">
                {isRecording ? (
                  <Button onClick={stopRecording} variant="destructive" size="lg" className="rounded-full">
                    <StopCircle className="w-6 h-6 mr-2" />
                    Stop Recording
                  </Button>
                ) : (
                  <Button onClick={startRecording} variant="default" size="lg" className="rounded-full">
                    <Mic className="w-6 h-6 mr-2" />
                    Start Recording
                  </Button>
                )}
              </div>
              <div className="bg-white bg-opacity-50 rounded-xl p-4 h-48 overflow-auto">
                <p className="text-gray-700">{transcript}</p>
              </div>
              {isUpsertingText && (
                <div className="flex items-center justify-center space-x-2 text-blue-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving speech to text...</span>
                </div>
              )}
              {upsertSuccess && (
                <div className="text-center text-green-600">
                  Speech to text saved successfully!
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="mindmap" className="p-6">
            <div className="bg-white bg-opacity-50 rounded-xl p-4 h-96 flex items-center justify-center">
              <svg width="100%" height="100%" viewBox="0 0 500 500">
                <circle cx="250" cy="250" r="100" fill="rgba(147, 51, 234, 0.5)" />
                {topics.map((topic, index) => {
                  const angle = (index / topics.length) * Math.PI * 2
                  const x = 250 + Math.cos(angle) * 150
                  const y = 250 + Math.sin(angle) * 150
                  return (
                    <g key={index}>
                      <line x1="250" y1="250" x2={x} y2={y} stroke="rgba(147, 51, 234, 0.5)" strokeWidth="2" />
                      <circle cx={x} cy={y} r="40" fill="rgba(59, 130, 246, 0.5)" />
                      <text x={x} y={y} textAnchor="middle" dy=".3em" fill="white" fontSize="12">
                        {topic}
                      </text>
                    </g>
                  )
                })}
                <text x="250" y="250" textAnchor="middle" dy=".3em" fill="white" fontSize="16">
                  Main Topic
                </text>
              </svg>
            </div>
          </TabsContent>
          <TabsContent value="todo" className="p-6">
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Add a new todo"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  className="flex-grow"
                />
                <Button onClick={addTodo}>
                  <Plus className="w-5 h-5" />
                  Add
                </Button>
              </div>
              <ul className="space-y-2">
                {todos.sort((a, b) => a.priority - b.priority).map((todo, index) => (
                  <li
                    key={index}
                    className="bg-white bg-opacity-50 rounded-xl p-4 flex items-center justify-between"
                  >
                    <span>{todo.text}</span>
                    <span className="text-sm text-gray-500">Priority: {todo.priority}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
