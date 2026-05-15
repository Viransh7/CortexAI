const API_URL = import.meta.env.VITE_API_URL

export async function askQuestion(question) {

  const response = await fetch(`${API_URL}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to fetch response")
  }

  return await response.json()
}