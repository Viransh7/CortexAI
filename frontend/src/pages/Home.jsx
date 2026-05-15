import { motion } from "framer-motion"
import { useState } from "react"
import { askQuestion } from "../services/api"

function Home() {

  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [documents, setDocuments] = useState(["sample.pdf"])

  const handleUpload = async (event) => {

    const file = event.target.files[0]

    if (!file) return

    setError("")

    const formData = new FormData()
    formData.append("file", file)

    try {

      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: "POST",
        body: formData,
      })

      await response.json()

      setDocuments((prev) => [...prev, file.name])

    } catch (error) {

      console.error(error)
      setError("Failed to upload PDF.")

    }

  }

  const deleteDocument = async (filename) => {

    try {

      await fetch(`${import.meta.env.VITE_API_URL}/delete/${filename}`, {
        method: "DELETE",
      })

      setDocuments((prev) =>
        prev.filter((doc) => doc !== filename)
      )

    } catch (error) {

      console.error(error)
      setError("Failed to delete document.")

    }

  }

  const handleSend = async () => {

    if (!question.trim()) return

    setError("")

    const userMessage = {
      type: "user",
      text: question,
    }

    setMessages((prev) => [...prev, userMessage])

    const currentQuestion = question
    setQuestion("")

    try {

      setLoading(true)

      const response = await askQuestion(currentQuestion)

      const aiMessage = {
        type: "ai",
        text: response.answer,
        sources: response.sources,
      }

      setMessages((prev) => [...prev, aiMessage])

    } catch (error) {

      const errorMessage = {
        type: "ai",
        text: "Unable to connect to CortexAI backend.",
      }

      setError("Backend connection failed.")

      setMessages((prev) => [...prev, errorMessage])

    } finally {

      setLoading(false)

    }

  }

  return (

    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">

      {/* Sidebar */}
      <div className="w-80 border-r border-slate-800 bg-slate-900 p-5 flex flex-col">

        <h1 className="text-5xl font-bold mb-10 tracking-tight">
          CortexAI
        </h1>

        {/* Upload */}
        <label className="cursor-pointer block w-full">

          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleUpload}
          />

          <div className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 rounded-2xl p-4 text-center shadow-lg hover:shadow-blue-500/20">
            Upload PDF
          </div>

        </label>

        {/* Documents */}
        <div className="mt-10 flex-1 overflow-y-auto">

          <h2 className="text-lg mb-4 text-slate-300">
            Documents
          </h2>

          <div className="space-y-3">

            {documents.map((doc, index) => (

              <div
                key={index}
                className="bg-slate-800 hover:bg-slate-700 transition p-3 rounded-xl text-sm border border-slate-700 flex justify-between items-center"
              >

                <span className="truncate">
                  {doc}
                </span>

                <button
                  onClick={() => deleteDocument(doc)}
                  className="text-red-400 hover:text-red-300 text-xs ml-3"
                >
                  Delete
                </button>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* Main Area */}
      <div className="flex flex-col flex-1">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scroll-smooth p-6">

          <div className="max-w-6xl mx-auto">

            {messages.length === 0 ? (

              <div className="mt-32 text-center">

                <h1 className="text-7xl font-bold mb-6 tracking-tight">
                  CortexAI
                </h1>

                <p className="text-slate-400 text-xl mb-12">
                  Context-Aware Developer Knowledge System
                </p>

                <div className="grid grid-cols-3 gap-6 max-w-5xl mx-auto">

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                    <h3 className="text-lg font-semibold mb-3">
                      Upload PDFs
                    </h3>

                    <p className="text-slate-400 text-sm leading-7">
                      Upload technical documents, resumes, research papers, or reports for intelligent querying.
                    </p>

                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                    <h3 className="text-lg font-semibold mb-3">
                      Grounded Retrieval
                    </h3>

                    <p className="text-slate-400 text-sm leading-7">
                      CortexAI retrieves relevant chunks before generating responses for explainable AI outputs.
                    </p>

                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                    <h3 className="text-lg font-semibold mb-3">
                      Source Attribution
                    </h3>

                    <p className="text-slate-400 text-sm leading-7">
                      Every answer includes retrieved source chunks with metadata and traceability.
                    </p>

                  </div>

                </div>

              </div>

            ) : (

              <div className="space-y-8 pb-10">

                {error && (

                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-2xl">
                    {error}
                  </div>

                )}

                {messages.map((msg, index) => (

                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`p-5 rounded-2xl ${
                      msg.type === "user"
                        ? "bg-blue-600 ml-auto max-w-xl shadow-lg"
                        : "bg-slate-800/95 border border-slate-700 max-w-3xl shadow-xl"
                    }`}
                  >

                    <div>

                      <p className="text-sm mb-2 font-semibold text-slate-300">
                        {msg.type === "user" ? "You" : "CortexAI"}
                      </p>

                      <p className="leading-8 text-[15px]">
                        {msg.text}
                      </p>

                    </div>

                    {/* Sources */}
                    {msg.sources && (

                      <div className="mt-5 space-y-3">

                        <h3 className="text-sm text-slate-300">
                          Retrieved Sources
                        </h3>

                        {msg.sources.map((source, i) => (

                          <div
                            key={i}
                            className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 shadow-md hover:border-blue-500 transition-all"
                          >

                            <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300 mb-2">
                              Page {source.metadata.page} • Chunk {source.metadata.chunk_id}
                            </p>

                            <p className="text-sm text-slate-400 leading-7">
                              {source.content.slice(0, 160)}...
                            </p>

                          </div>

                        ))}

                      </div>

                    )}

                  </motion.div>

                ))}

                {loading && (

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-slate-800 border border-slate-700 max-w-md p-5 rounded-2xl flex items-center gap-3 shadow-lg"
                  >

                    <div className="flex gap-1">

                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>

                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.15s]"></div>

                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.3s]"></div>

                    </div>

                    <p className="text-slate-300 text-sm">
                      CortexAI is analyzing your documents...
                    </p>

                  </motion.div>

                )}

              </div>

            )}

          </div>

        </div>

        {/* Input */}
        <div className="border-t border-slate-800 p-4 bg-slate-950">

          <div className="max-w-5xl mx-auto flex gap-3">

            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask CortexAI about your documents..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl p-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend()
                }
              }}
            />

            <button
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700 transition px-8 rounded-2xl shadow-lg"
            >
              Send
            </button>

          </div>

        </div>

      </div>

    </div>

  )
}

export default Home