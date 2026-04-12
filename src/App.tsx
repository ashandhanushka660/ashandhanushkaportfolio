import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, User, Trash2, Briefcase, Code, Mail, Github, Linkedin, Instagram, MessageSquare, X, ExternalLink, ChevronRight, Globe, Zap, Cpu, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { IMAGES } from './images';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ASHAN_CONTEXT = `
You are the AI Assistant. You were developed by Ashan Dhanushka. 
Developer Profile:
- Name: Ashan Dhanushka
- Birthday: 1996/03/24
- Hometown: Ruwanwella, Kegalle
- Education: 
    * School: Royal International School (O/Ls in English Medium)
    * Diploma: Graphic Designing at VTA Narahenpita
    * Higher Diploma: ICT Level 4/5/6 at College of Technology, Maradana
    * Degree: B.Tech in Web and Creative Media at UNIVOTEC, Ratmalana
- Professional Identity: Founder of Dhanushka Productions, Software Engineer, DevOps Freelancer, and UI/UX Designer.
- Expertise & Experience:
    * Firebase: Expert in Firestore, Authentication, Security Rules, and real-time data synchronization.
    * Database Integration: Extensive experience in SQL (MySQL, PostgreSQL) and NoSQL (MongoDB, Firestore) integration with complex backend architectures.
    * DevOps: Freelance experience in CI/CD pipelines, cloud deployment (Cloud Run, AWS), and system optimization.
- Contact Details:
    * Phone: 0710118916
    * Email: WCM24B126@UOVT.AC.LK
- Major Projects:
    1. BankDB — Enterprise Banking Ledger: Industrial-standard banking pipeline with RBAC and real-time ledger using Firebase and React 19.
    2. CBDC & Digital Wallet Ecosystem: Secure CBDC wallets using .NET, Spring Boot, and Blockchain (Quasar).
    3. AI Portfolio Assistant: Integrating Gemini AI into a professional portfolio for real-time interaction.
    4. Domain-Specific Software Suite: Library management, sports scoreboards, and secure voting systems using Java and C#.
    5. Full-Stack Development Ecosystems: MERN stack applications for health-tech and content management.
    6. Mobile & System Utility Tools: Native Android apps and C++/Java system utilities.
    7. Camera Simulation Tools: 3D educational simulations using Three.js and React.
    8. SOAP Protocol Architecture: Enterprise webservices using SOAP, XML, and PHP.
`;

const SUGGESTIONS = [
  { text: "Who is Ashan?", icon: <User className="w-3 h-3" /> },
  { text: "View projects", icon: <Briefcase className="w-3 h-3" /> },
  { text: "Tech stack", icon: <Code className="w-3 h-3" /> },
  { text: "Contact details", icon: <Mail className="w-3 h-3" /> },
];

const PROJECTS = [
  {
    title: "Industrial Standard Banking Pipeline",
    description: "High-security banking infrastructure focusing on transaction integrity, ledger management, and secure API communication.",
    tags: ["Java", "React", "SQL", "Fintech"],
    icon: <Briefcase className="w-5 h-5" />,
    repo: "https://github.com/ashandhanushka660"
  },
  {
    title: "BankDB — Enterprise Banking Ledger",
    description: "Industrial-standard banking pipeline with RBAC and real-time ledger. Built with Firebase and React 19.",
    tags: ["Firebase", "React 19", "Fintech", "RBAC"],
    icon: <Zap className="w-5 h-5" />,
    repo: "https://github.com/ashandhanushka660"
  },
  {
    title: "CBDC & Digital Wallet Ecosystem",
    description: "Architecture of digital fiat currency across tech stacks, from microservices to frontend interfaces.",
    tags: [".NET", "Spring Boot", "Blockchain", "Quasar"],
    icon: <Globe className="w-5 h-5" />,
    repo: "https://github.com/ashandhanushka660/Digital-Wallet-Ecosystem"
  },
  {
    title: "AI Portfolio Assistant",
    description: "Intelligent AI chatbot integrated into a professional portfolio using Gemini AI and Framer Motion.",
    tags: ["Gemini AI", "React", "TypeScript", "AI"],
    icon: <Bot className="w-5 h-5" />,
    repo: "https://github.com/ashandhanushka660/ashandhanushka-portfolio"
  },
  {
    title: "Domain-Specific Software Suite",
    description: "Targeted software for library management, real-time sports scoreboards, and secure voting systems.",
    tags: ["Java Swing", "C#.NET", "SQL", "UI/UX"],
    icon: <Cpu className="w-5 h-5" />,
    repo: "https://github.com/ashandhanushka660"
  },
  {
    title: "Full-Stack Development Ecosystems",
    description: "Scalable web architectures focusing on health-tech and content management using the MERN stack.",
    tags: ["MongoDB", "Express", "React", "Node.js"],
    icon: <Layers className="w-5 h-5" />,
    repo: "https://github.com/ashandhanushka660"
  },
  {
    title: "Mobile & System Utility Tools",
    description: "Native Android development and performance-oriented system programming using C++ and Java.",
    tags: ["Android SDK", "Java", "C++", "Firebase"],
    icon: <Code className="w-5 h-5" />,
    repo: "https://github.com/ashandhanushka660"
  },
  {
    title: "Camera Simulation Education Tools",
    description: "Educational simulation to study camera anatomy and real-time rendering logic using Three.js.",
    tags: ["React", "Three.js", "Simulation", "JS"],
    icon: <Globe className="w-5 h-5" />,
    repo: "https://github.com/ashandhanushka660/camera-simulation-for-education-Tools"
  },
  {
    title: "SOAP Protocol Architecture",
    description: "Implementation of enterprise webservices using SOAP protocol, XML processing, and PHP.",
    tags: ["PHP", "SOAP", "XML", "API Design"],
    icon: <Layers className="w-5 h-5" />,
    repo: "https://github.com/ashandhanushka660/SOAP-webservices-development-for-beginners"
  }
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen) scrollToBottom();
  }, [messages, isChatOpen]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    if (!overrideInput) setInput('');
    setIsLoading(true);

    try {
      const possibleKeys = [
        process.env.GEMINI_API_KEY,
        (process.env as any).APP,
        (process.env as any).Gemini_API_Key,
        (process.env as any).gemini_api_key,
        (process.env as any).VITE_GEMINI_API_KEY
      ];

      let apiKey = possibleKeys.find(k => k && k.trim() !== '' && k !== 'MY_GEMINI_API_KEY');
      if (apiKey) {
        apiKey = apiKey.trim();
        if (apiKey.startsWith('l-')) apiKey = apiKey.substring(2);
      }

      if (!apiKey) throw new Error("API_KEY_MISSING");

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages, userMessage].map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: `You are a professional Portfolio Assistant for Ashan Dhanushka's website. 
          ${ASHAN_CONTEXT}
          Your goal is to answer questions ONLY about Ashan, his projects, skills, and experience.
          STRICT RULES:
          1. Do NOT answer general knowledge questions.
          2. If a user asks something outside of the portfolio context, politely say: "සමාවන්න, මට පිළිතුරු දිය හැක්කේ අශාන් ධනුෂ්කගේ Portfolio එක සහ එහි අන්තර්ගතය පිළිබඳව පමණි."
          3. Keep responses concise and professional.
          4. Support both Sinhala and English.`,
        }
      });

      const botText = response.text || "සමාවන්න, මට පිළිතුරක් ලබා දීමට නොහැකි වුණා.";
      setMessages(prev => [...prev, { role: 'model', text: botText }]);
    } catch (error: any) {
      console.error("Error calling Gemini API:", error);
      let errorMessage = "සමාවන්න, දෝෂයක් සිදු වුණා. කරුණාකර නැවත උත්සාහ කරන්න.";
      if (error.message === "API_KEY_MISSING") errorMessage = "API Key එක ඇතුළත් කර නැත.";
      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-blue-500/30">
      <div className="noise-overlay" />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">A</div>
            <span className="font-bold tracking-tight">ASHAN DHANUSHKA</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#projects" className="hover:text-white transition-colors">Projects</a>
            <a href="#contact" className="px-4 py-2 bg-zinc-900 border border-white/10 rounded-full text-white hover:bg-zinc-800 transition-all">Get in touch</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-blue-500 font-bold tracking-widest text-xs uppercase"
              >
                Software Engineer & Creative Developer
              </motion.h2>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold tracking-tighter leading-none"
              >
                Hi, I'm <br />
                <span className="text-zinc-400">Ashan Dhanushka! 👋</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-zinc-400 text-lg max-w-md leading-relaxed"
              >
                Specializing in Fintech, Spring Boot, Laravel and Full-Stack Architectures. Building scalable digital ecosystems.
              </motion.p>
            </div>
            <div className="flex gap-4">
              <button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex items-center gap-2 group">
                View Projects <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center gap-4 px-4">
                <a href="https://github.com/ashandhanushka660" className="text-zinc-500 hover:text-white transition-colors"><Github className="w-6 h-6" /></a>
                <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Linkedin className="w-6 h-6" /></a>
              </div>
            </div>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-square rounded-3xl overflow-hidden border border-white/10 bg-zinc-900 group"
          >
            <img 
              src={IMAGES.profile} 
              alt="Ashan Dhanushka" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-500">Based in Sri Lanka 🇱🇰</p>
              <p className="text-xl font-bold">UNIVOTEC Student</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-6 max-w-6xl mx-auto space-y-12">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Featured Projects</h2>
            <p className="text-zinc-500">A portfolio of engineering excellence across multiple domains.</p>
          </div>
          <a href="https://github.com/ashandhanushka660" target="_blank" rel="noreferrer" className="text-blue-500 font-bold text-sm flex items-center gap-1 hover:underline">View all on GitHub <ExternalLink className="w-4 h-4" /></a>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map((project, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-blue-500/30 transition-all space-y-6 group flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {project.icon}
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold tracking-tight">{project.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{project.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, ti) => (
                    <span key={ti} className="px-3 py-1 rounded-full bg-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-500">{tag}</span>
                  ))}
                </div>
              </div>
              <a 
                href={project.repo} 
                target="_blank" 
                rel="noreferrer"
                className="pt-4 text-xs font-bold text-blue-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                View Repository <ExternalLink className="w-3 h-3" />
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Multimedia & Arts Section */}
      <section id="multimedia" className="py-20 px-6 max-w-6xl mx-auto space-y-12">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">🎨 Multimedia Projects & Arts</h2>
          <p className="text-zinc-500">Exploring the intersection of design, culture, and technology.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="rounded-3xl overflow-hidden border border-white/5 bg-zinc-900/50 group"
          >
            <img 
              src={IMAGES.culture} 
              alt="Sri Lankan Cultural Collage" 
              className="w-full aspect-square object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              referrerPolicy="no-referrer"
            />
            <div className="p-6">
              <h3 className="text-lg font-bold">Socio-cultural Meanings of Color</h3>
              <p className="text-zinc-500 text-sm mt-2">A visual exploration of Sri Lankan design aesthetics and cultural symbolism.</p>
            </div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="rounded-3xl overflow-hidden border border-white/5 bg-zinc-900/50 group"
          >
            <img 
              src={IMAGES.art} 
              alt="Art and Design Course Cover" 
              className="w-full aspect-square object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              referrerPolicy="no-referrer"
            />
            <div className="p-6">
              <h3 className="text-lg font-bold">Foundational Art & Design</h3>
              <p className="text-zinc-500 text-sm mt-2">Professional website architecture integrated with foundational design principles.</p>
            </div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="rounded-3xl overflow-hidden border border-white/5 bg-zinc-900/50 group"
          >
            <img 
              src={IMAGES.room} 
              alt="3D Room Simulation" 
              className="w-full aspect-square object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              referrerPolicy="no-referrer"
            />
            <div className="p-6">
              <h3 className="text-lg font-bold">3D Interior Simulation</h3>
              <p className="text-zinc-500 text-sm mt-2">Low-poly 3D modeling and rendering of a modern workspace environment.</p>
            </div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="rounded-3xl overflow-hidden border border-white/5 bg-zinc-900/50 group"
          >
            <img 
              src={IMAGES.city} 
              alt="3D City Lights Simulation" 
              className="w-full aspect-square object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              referrerPolicy="no-referrer"
            />
            <div className="p-6">
              <h3 className="text-lg font-bold">Night City Environment</h3>
              <p className="text-zinc-500 text-sm mt-2">Real-time lighting and environment design for a stylized night city scene.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="p-12 rounded-[3rem] bg-zinc-900/30 border border-white/5 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-500">
              <Zap className="w-6 h-6" />
            </div>
            <h2 className="text-4xl font-bold tracking-tight">🚀 About Me</h2>
            <p className="text-zinc-400 text-lg leading-relaxed">
              I'm a dedicated University Student exploring the intersections of finance and technology. My journey is fueled by a passion for backend logic, distributed systems, and modern software architecture.
            </p>
            <div className="grid grid-cols-2 gap-y-8 gap-x-6 pt-4">
              <div className="space-y-1">
                <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest">Focus Areas</p>
                <p className="font-bold">Springboot, Python, Java, and C#</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest">Backend Core</p>
                <p className="font-bold">Spring Boot, Laravel, .NET</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest">2026 Milestone</p>
                <p className="font-bold">Full-scale Open Source Apps</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest">Workflow</p>
                <p className="font-bold">Mastering Clean Code & Scalability</p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-950/50 p-8 rounded-3xl border border-white/5 italic text-zinc-400 leading-relaxed relative">
            <span className="text-6xl text-blue-500/20 absolute -top-4 -left-2 font-serif">"</span>
            I speak fluent Python, but my Java is still learning to brew. I believe code is the ultimate form of documentation, though I'm getting much better at commenting!
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-20 px-6 border-t border-white/5 text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold tracking-tight">Get in touch</h2>
          <p className="text-zinc-500">Available for collaborations and professional networking.</p>
        </div>
        <a href="mailto:ashandhanushka660@gmail.com" className="inline-block px-8 py-4 bg-white text-zinc-950 font-bold rounded-xl hover:bg-zinc-200 transition-all">
          ashandhanushka660@gmail.com
        </a>
        <div className="flex justify-center gap-8 pt-8">
          <a href="https://github.com/ashandhanushka660" className="text-zinc-500 hover:text-white transition-colors">GitHub</a>
          <a href="#" className="text-zinc-500 hover:text-white transition-colors">LinkedIn</a>
          <a href="#" className="text-zinc-500 hover:text-white transition-colors">Instagram</a>
        </div>
        <p className="text-zinc-600 text-xs pt-12">© 2026 Ashan Dhanushka. All rights reserved.</p>
      </footer>

      {/* Floating Chatbot */}
      <div className="fixed bottom-2 right-2 z-[100]">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute bottom-16 right-0 w-[350px] md:w-[400px] h-[500px] md:h-[600px] bg-zinc-950 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">A</div>
                  <div>
                    <h3 className="text-sm font-bold">Ashan's AI</h3>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Online</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-4 h-4" /></button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                {messages.length === 0 && (
                  <div className="text-center space-y-4 py-12">
                    <div className="w-12 h-12 bg-zinc-900 rounded-2xl mx-auto flex items-center justify-center text-blue-500"><Bot className="w-6 h-6" /></div>
                    <p className="text-zinc-400 text-sm px-8">Hi! I'm Ashan's AI. Ask me anything about his projects or skills.</p>
                    <div className="flex flex-wrap justify-center gap-2 px-4">
                      {SUGGESTIONS.map((s, i) => (
                        <button key={i} onClick={() => handleSend(s.text)} className="px-3 py-1.5 rounded-full bg-zinc-900 border border-white/5 text-[10px] text-zinc-400 hover:border-blue-500/30 transition-all">{s.text}</button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-zinc-900 border border-white/5 text-zinc-100 rounded-tl-none'}`}>
                      <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="px-4 py-3 bg-zinc-900 border border-white/5 rounded-2xl rounded-tl-none flex gap-1">
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-white/10 bg-zinc-900/50">
                <div className="relative">
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask something..."
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm outline-none focus:border-blue-500/50 transition-all"
                  />
                  <button onClick={() => handleSend()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:text-blue-400"><Send className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${isChatOpen ? 'bg-zinc-900 rotate-90' : 'bg-blue-600 hover:scale-110'}`}
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .noise-overlay {
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.02'/%3E%3C/svg%3E");
          opacity: 0.3;
          pointer-events: none;
          z-index: 0;
        }
      `}</style>
    </div>
  );
}
