🚀 The Mission
SkillLens AI is a multilingual, accessibility-first skilling platform designed for rural, vernacular, and differently-abled learners. By moving the "AI Brain" from the cloud to the AMD Ryzen™ AI NPU, we provide high-quality tutoring with zero daily data consumption and 100% privacy.

🛠️ How it works (Local Architecture)
Unlike traditional EdTech tools that require high-speed internet, SkillLens AI runs entirely on the user's laptop:

Frontend: A React.js interface with Voice-to-Text for accessibility.

Orchestrator: A Node.js backend that manages local requests.

Inference Engine: Ollama serving the Phi-3 or Llama-3 models locally.

Hardware Acceleration: Uses the AMD Ryzen™ AI NPU and Radeon™ GPU via ROCm™ for low-latency, energy-efficient processing.

💎 AMD Hardware Optimization
This project is specifically optimized for the AMD Ecosystem:

AMD Ryzen™ AI NPU: Offloads LLM inference from the CPU, keeping the device cool and extending battery life for students in areas with limited electricity.

ROCm™ Software Stack: Utilized to optimize model execution and speech-to-text processing.

AMD Instinct™ & EPYC™: Conceptually designed for large-scale training of our custom vernacular datasets.

📈 Key Features
Zero-Data AI: After the initial 1.6GB model download, the system requires 0MB of data to function.

Explainable AI (XAI): Instead of giving direct answers, the AI provides Socratic hints and step-by-step guidance.

Multilingual Support: Supports Indian vernacular languages to ensure no student is left behind.

Voice-First Interaction: Built for visually impaired students using local STT (Speech-to-Text) engines.

📦 Local Setup Instructions
To run this prototype in Offline Mode:

Install Ollama: Download here.

Pull the Model:

Bash
ollama pull phi
Start the Backend:

Bash
cd server
npm install
node server.js
Start the Frontend:

Bash
cd client
npm install
npm start
Go Offline: Disconnect your Wi-Fi and experience the power of AMD Ryzen™ AI.

🎥 Proof of Work
Demo Video: [Link to your YouTube/Drive Video]

Task Manager: During inference, observe the NPU/GPU utilization in Windows Task Manager to verify local AMD execution.

Next Steps for you:
Open VS Code in your project folder.

Create a new file named README.md.

Paste the content above.

Save and Push: ```powershell
git add README.md
git commit -m "Add official AMD Slingshot documentation"
git push origin main
