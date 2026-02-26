
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
Demo Video:https://drive.google.com/file/d/1lM-0aLw8tk1mEF8m0c_ChcLw7lrNMjFa/view?usp=sharing

Task Manager: During inference, observe the NPU/GPU utilization in Windows Task Manager to verify local AMD execution.

:🎙️ Accessibility & InclusionSkillLens AI is built to ensure that no learner is left behind.Screen Reader Optimization: ARIA labels and semantic HTML for seamless navigation.Voice Commands: Integration with local Speech-to-Text (STT) so visually impaired students can interact naturally.Vernacular Switcher: Instant translation between English and regional Indian languages to bridge the rural-urban gap.🧠 Explainable AI (XAI) LogicUnlike ChatGPT which often gives the full answer immediately, SkillLens AI uses a Socratic Prompting technique:Level 1 (The Hint): If a student is stuck, the AI provides a conceptual hint.Level 2 (The Breakdown): If the student still struggles, the AI breaks the problem into smaller sub-tasks.Level 3 (The Analogy): The AI uses real-world examples (e.g., explaining "Gravity" using a falling cricket ball).🛠️ AMD Hardware Implementation DetailsComponentAMD SolutionRole in SkillLens AIEdge InferenceRyzen™ AI NPURuns the Phi-3 model locally to save data and battery.Model TrainingAMD Instinct™ GPUUsed to fine-tune the model on regional language datasets.BackendAMD EPYC™Handles user authentication and progress tracking for 1,000+ users.OptimizationROCm™ StackUsed to convert the model to FP16/INT8 for faster local performance.🛤️ Project Roadmap[x] Phase 1: Core Offline Chat Logic with Ollama & Phi-3.[ ] Phase 2: Multi-modal support (Analyzing images of hand-written notes).[ ] Phase 3: Integration with government skilling portals (e.g., Skill India).[ ] Phase 4: Specialized "Career Path" mapping for students based on their mastery levels.
