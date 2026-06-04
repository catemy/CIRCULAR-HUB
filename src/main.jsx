import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Brain,
  Building2,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Factory,
  Flame,
  GraduationCap,
  HeartHandshake,
  Home,
  Leaf,
  Lightbulb,
  LineChart,
  MessageSquareText,
  PackageCheck,
  Recycle,
  ScanLine,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Trophy,
  Upload,
  UserRound,
  Users,
  WandSparkles,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart as RLineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './styles.css'

const nav = [
  { to: '/app', label: 'Home', icon: Home },
  { to: '/app/waste', label: 'Waste Intel', icon: ScanLine },
  { to: '/app/learning', label: 'Learning', icon: GraduationCap },
  { to: '/app/community', label: 'Innovation Feed', icon: Users },
  { to: '/app/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { to: '/app/campaigns', label: 'Campaigns', icon: Trophy },
  { to: '/app/institution', label: 'Institution', icon: Building2 },
  { to: '/app/analytics', label: 'Impact Center', icon: BarChart3 },
  { to: '/app/profile', label: 'Profile', icon: UserRound },
  { to: '/app/admin', label: 'Admin', icon: ShieldCheck },
]

const AuthContext = createContext(null)
const PlatformContext = createContext(null)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000')

function readStore(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function usePersistentState(key, fallback) {
  const [value, setValue] = useState(() => readStore(key, fallback))
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  return [value, setValue]
}

function AuthProvider({ children }) {
  const [users, setUsers] = usePersistentState('circularhub.v3.users', [])
  const [token, setToken] = usePersistentState('circularhub.v3.token', null)
  const [currentUser, setCurrentUser] = usePersistentState('circularhub.v3.currentUser', null)

  async function fetchApi(path, method = 'GET', body = null, tokenValue = null) {
    const headers = { 'Content-Type': 'application/json' }
    if (tokenValue) headers.Authorization = `Bearer ${tokenValue}`

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(payload?.detail || payload?.message || 'API request failed')
    }
    return payload
  }

  const mergeUser = (user) => {
    return {
      interests: [],
      goals: [],
      badges: [],
      onboardingComplete: user.onboarding_complete || false,
      country: user.country || 'Global',
      ...user,
    }
  }

  const fetchCurrentUser = async (tokenValue) => {
    const fetched = await fetchApi('/auth/me', 'GET', null, tokenValue)
    const saved = readStore('circularhub.v3.currentUser', {}) || {}
    const current = {
      ...mergeUser(fetched),
      interests: saved.interests || [],
      goals: saved.goals || [],
      badges: saved.badges || [],
      onboardingComplete: saved.onboardingComplete ?? fetched.onboarding_complete ?? false,
    }
    setCurrentUser(current)
    return current
  }

  const signUp = async (payload) => {
    const user = await fetchApi('/auth/register', 'POST', payload)
    const tokenPayload = await fetchApi('/auth/login', 'POST', { username: payload.username, password: payload.password })
    const merged = {
      ...mergeUser(user),
      interests: [],
      goals: [],
      badges: [],
      onboardingComplete: false,
      country: payload.country || 'Global',
    }
    setUsers((items) => [merged, ...items])
    setToken(tokenPayload.access_token)
    setCurrentUser(merged)
    return merged
  }

  const signIn = async ({ username, password }) => {
    const tokenPayload = await fetchApi('/auth/login', 'POST', { username, password })
    setToken(tokenPayload.access_token)
    const current = await fetchCurrentUser(tokenPayload.access_token)
    setCurrentUser(current)
    return current
  }

  const resetPassword = async ({ currentPassword, newPassword }) => {
    await fetchApi('/auth/reset-password', 'POST', { current_password: currentPassword, new_password: newPassword }, token)
  }

  const updateProfile = async (updates) => {
    const payload = { ...updates }
    if ('onboardingComplete' in payload) {
      payload.onboarding_complete = payload.onboardingComplete
      delete payload.onboardingComplete
    }
    const updated = await fetchApi('/users/me', 'PUT', payload, token)
    const merged = { ...currentUser, ...mergeUser(updated) }
    setCurrentUser(merged)
    setUsers((items) => items.map((user) => user.id === merged.id ? merged : user))
    return merged
  }

  const signOut = () => {
    setToken(null)
    setCurrentUser(null)
  }

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token).catch(signOut)
    } else if (currentUser) {
      setCurrentUser(null)
    }
  }, [token])

  return (
    <AuthContext.Provider value={{ users, currentUser, token, signUp, signIn, signOut, resetPassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  return useContext(AuthContext)
}

const wasteTypes = [
  {
    name: 'Plastic Waste',
    hazard: 'Medium',
    tone: '#18a66b',
    timeline: '20 to 500 years',
    impact: 'Microplastic leakage, wildlife ingestion, blocked drainage, lifecycle carbon emissions.',
    disposal: 'Sort by polymer code, rinse containers, compress, and route through verified material recovery facilities.',
    recycle: 'PET flakes, HDPE pelletizing, polypropylene sorting, eco-brick pilots for non-recyclables.',
    safety: ['Avoid burning', 'Separate food-contaminated plastics', 'Keep film plastic out of rigid streams'],
    reuse: ['Vertical garden modules', 'Bottle lamp housings', 'Eco-brick community benches', 'Modular pencil holders'],
    resources: ['Polymer identification guide', 'School plastic audit template', 'MRF readiness checklist'],
  },
  {
    name: 'Medical Waste',
    hazard: 'Critical',
    tone: '#e14d45',
    timeline: 'Immediate biohazard risk',
    impact: 'Pathogen exposure, sharps injury, groundwater contamination, illegal incineration emissions.',
    disposal: 'Segregate at source using color-coded bins, seal sharps, document chain of custody, treat via licensed autoclave or incineration.',
    recycle: 'Only sterilized non-hazardous packaging can enter recycling streams; clinical waste must remain controlled.',
    safety: ['Use PPE', 'Never compact sharps', 'Label infectious bags', 'Escalate spills immediately'],
    reuse: ['Training mannequins from sterile packaging', 'Awareness posters from clean cartons'],
    resources: ['Clinic waste segregation SOP', 'Hospital safety audit', 'Sharps response checklist'],
  },
  {
    name: 'Electronic Waste',
    hazard: 'High',
    tone: '#3b82f6',
    timeline: 'Decades with toxic leaching',
    impact: 'Heavy metals, lithium fire risk, data security issues, informal recycling exposure.',
    disposal: 'Remove data, isolate batteries, use certified e-waste collection, track serialed assets for institutions.',
    recycle: 'Board recovery, copper extraction, screen glass handling, certified refurbishment.',
    safety: ['Do not puncture batteries', 'Tape terminals', 'Wipe storage devices', 'Avoid informal acid leaching'],
    reuse: ['Repair cafe inventory', 'STEM teardown kits', 'Refurbished classroom devices'],
    resources: ['E-waste asset register', 'Battery fire protocol', 'Refurbishment quality checklist'],
  },
  {
    name: 'Organic Waste',
    hazard: 'Low',
    tone: '#84a63d',
    timeline: '2 weeks to 6 months',
    impact: 'Methane when landfilled, pest attraction, lost soil nutrients.',
    disposal: 'Separate organics, compost, biodigest, or partner with food recovery programs before spoilage.',
    recycle: 'Aerobic composting, vermiculture, biogas digesters, black soldier fly systems.',
    safety: ['Control moisture', 'Keep meat out of basic compost', 'Manage odors', 'Cover collection bins'],
    reuse: ['Campus compost garden', 'Restaurant herb beds', 'Soil amendment workshops'],
    resources: ['Compost recipe cards', 'Kitchen separation signage', 'Methane reduction explainer'],
  },
  {
    name: 'Chemical Waste',
    hazard: 'Critical',
    tone: '#f59e0b',
    timeline: 'Persistent if released',
    impact: 'Toxic exposure, water contamination, reactive mixing, long-term soil damage.',
    disposal: 'Inventory, label, store by compatibility, and transfer through licensed hazardous waste contractors.',
    recycle: 'Solvent recovery, neutralization by specialists, closed-loop industrial reuse where permitted.',
    safety: ['Never mix unknowns', 'Use secondary containment', 'Keep SDS available', 'Train handlers'],
    reuse: ['Green chemistry substitution plan', 'Lab microscale training kits'],
    resources: ['SDS library template', 'Compatibility storage chart', 'Hazardous pickup manifest'],
  },
  {
    name: 'Industrial Waste',
    hazard: 'High',
    tone: '#64748b',
    timeline: 'Variable by stream',
    impact: 'Bulk emissions, landfill pressure, occupational exposure, process inefficiency.',
    disposal: 'Classify streams, quantify volumes, implement source reduction, and route recoverable materials to industrial symbiosis partners.',
    recycle: 'Scrap recovery, process water reuse, pallet loops, byproduct exchange.',
    safety: ['Audit contractors', 'Isolate hazardous residues', 'Monitor dust', 'Document transfers'],
    reuse: ['Pallet furniture line', 'Material exchange marketplace', 'Factory kaizen waste sprint'],
    resources: ['Waste stream matrix', 'ESG reporting guide', 'Industrial symbiosis playbook'],
  },
]

const trendData = [
  { month: 'Jan', awareness: 42, reuse: 18, diversion: 31 },
  { month: 'Feb', awareness: 51, reuse: 26, diversion: 39 },
  { month: 'Mar', awareness: 59, reuse: 34, diversion: 44 },
  { month: 'Apr', awareness: 66, reuse: 42, diversion: 53 },
  { month: 'May', awareness: 74, reuse: 49, diversion: 61 },
  { month: 'Jun', awareness: 83, reuse: 57, diversion: 69 },
]

const categoryShare = [
  { name: 'Plastic', value: 33, color: '#18a66b' },
  { name: 'Organic', value: 22, color: '#84a63d' },
  { name: 'E-waste', value: 17, color: '#3b82f6' },
  { name: 'Medical', value: 11, color: '#e14d45' },
  { name: 'Industrial', value: 17, color: '#64748b' },
]

const collectionGuides = [
  {
    title: 'Community collection path',
    description: 'A step-by-step system for local waste handoff so households and small groups stop littering and deliver materials to the right recovery partner.',
    tone: '#0f8556',
    steps: [
      'Source-separate waste at home, school, or community hubs using clearly labeled bins for plastic, organic, electronic, medical, and industrial materials.',
      'Use mapped drop-off stations or scheduled pickup services instead of throwing sorted waste onto streets or informal dumps.',
      'Verify each handoff with a local collector, cooperative, or institution that is approved for the specific waste type.',
      'Record the path in the platform and share progress with your community to keep waste out of unsafe or illegal disposal.',
    ],
  },
  {
    title: 'Institutional waste workflow',
    description: 'A professional collection system for schools, hospitals, factories, and NGOs to route waste correctly and avoid cross-contamination.',
    tone: '#2563eb',
    steps: [
      'Adopt a color-coded collection scheme with separate containers and signage for each waste stream.',
      'Train staff on proper segregation, use of PPE, and when to use licensed waste contractors versus in-house reuse options.',
      'Aggregate sorted materials at secure staging points, then dispatch them to certified recovery partners or internal reuse programs.',
      'Review quarterly reports and adjust collection routes, labels, and accepted waste categories to reduce improper littering.',
    ],
  },
]

const wasteCollectionSteps = [
  'Identify the material and hazard category',
  'Choose the correct collection bin or drop-off option',
  'Send to a verified partner or institutional recovery channel',
  'Track diversion metrics and update your community report',
]

const courseCatalog = [
  {
    id: 'course-waste-segregation',
    title: 'Global Waste Segregation Foundations',
    level: 'Beginner',
    audience: 'Individuals, schools, NGOs',
    certification: 'Waste Segregation Practitioner',
    summary: 'Learn how source separation, labeling, contamination control, and local collection systems determine whether materials can be recovered safely.',
    lessons: [
      { id: 'seg-1', type: 'article', title: 'Why source segregation determines recycling success', duration: '9 min', content: 'Waste segregation works when materials are separated before contamination occurs. Organic residue, mixed hazardous items, and wet materials can lower recovery value or make recycling unsafe. A practical segregation system starts with clear categories, consistent labels, staff training, and a feedback loop from collectors or material recovery facilities.' },
      { id: 'seg-2', type: 'video', title: 'Designing a color-coded bin station', duration: '6 min', content: 'Video lesson script: map user behavior, place bins together, use picture labels, and audit contamination weekly.' },
      { id: 'seg-3', type: 'quiz', title: 'Segregation decision quiz', duration: '5 questions', questions: ['What should happen to food-contaminated paper?', 'Why should batteries be isolated?', 'What makes signage effective?'] },
    ],
  },
  {
    id: 'course-circular-economy',
    title: 'Circular Economy And Sustainable Consumption',
    level: 'Intermediate',
    audience: 'Communities, institutions, product teams',
    certification: 'Circular Economy Advocate',
    summary: 'Move beyond disposal into prevention, reuse, repair, refill models, procurement choices, and lifecycle thinking.',
    lessons: [
      { id: 'circ-1', type: 'article', title: 'From linear waste to circular value', duration: '11 min', content: 'A circular economy designs out waste by keeping products and materials in use. Priority actions are refusal, reduction, reuse, repair, remanufacturing, and recycling only after higher-value loops are exhausted.' },
      { id: 'circ-2', type: 'article', title: 'Sustainable consumption in daily procurement', duration: '8 min', content: 'Procurement has climate leverage. Choose durable goods, repairable devices, minimal packaging, recycled content, supplier take-back programs, and service models that reduce ownership waste.' },
      { id: 'circ-3', type: 'quiz', title: 'Circular strategy check', duration: '6 questions', questions: ['Which loop preserves the most value?', 'What is a take-back program?', 'How does repair reduce embodied emissions?'] },
    ],
  },
  {
    id: 'course-medical-waste',
    title: 'Medical Waste Safety And Infection Risk',
    level: 'Professional',
    audience: 'Hospitals, clinics, laboratories',
    certification: 'Healthcare Waste Safety Steward',
    summary: 'Professional handling of infectious waste, sharps, color-coded segregation, spill response, and chain-of-custody documentation.',
    lessons: [
      { id: 'med-1', type: 'article', title: 'Clinical waste streams and hazard boundaries', duration: '12 min', content: 'Medical waste requires segregation at the point of generation. Sharps, infectious waste, pharmaceutical waste, and general non-hazardous packaging should never be collapsed into one stream because treatment, transport, and worker protections differ.' },
      { id: 'med-2', type: 'video', title: 'Sharps container placement and closure protocol', duration: '7 min', content: 'Video lesson script: place containers at point of care, do not overfill, never recap needles by hand, and document container transfer.' },
      { id: 'med-3', type: 'quiz', title: 'Healthcare waste safety quiz', duration: '7 questions', questions: ['When is a sharps container full?', 'What PPE is needed for spill response?', 'Which waste can be recycled after sterilization?'] },
    ],
  },
  {
    id: 'course-industrial-sustainability',
    title: 'Industrial Sustainability And Waste Stream Mapping',
    level: 'Advanced',
    audience: 'Industry, ESG teams, municipalities',
    certification: 'Industrial Circularity Analyst',
    summary: 'Build a material flow map, identify high-volume waste streams, reduce process loss, and find safe industrial symbiosis opportunities.',
    lessons: [
      { id: 'ind-1', type: 'article', title: 'Material flow mapping for operational teams', duration: '10 min', content: 'Industrial waste reduction begins with a mass-balance view of inputs, outputs, rejects, water, energy, packaging, and hazardous residues. Teams should quantify streams, identify root causes, and prioritize source reduction before downstream disposal.' },
      { id: 'ind-2', type: 'article', title: 'Industrial symbiosis and byproduct exchange', duration: '9 min', content: 'One facility’s byproduct can become another facility’s input when quality, safety, transport, and regulatory requirements are met. Documentation and testing are essential.' },
      { id: 'ind-3', type: 'quiz', title: 'Waste stream mapping quiz', duration: '5 questions', questions: ['What is a mass balance?', 'Why verify byproduct quality?', 'What should be tracked in a transfer manifest?'] },
    ],
  },
  {
    id: 'course-organics-climate',
    title: 'Composting And Climate Impact Of Waste',
    level: 'Beginner',
    audience: 'Households, restaurants, schools',
    certification: 'Organics Recovery Builder',
    summary: 'Understand methane, compost recipes, food recovery hierarchy, contamination prevention, and behavior change for organic waste.',
    lessons: [
      { id: 'org-1', type: 'article', title: 'Why landfilled food waste becomes a climate issue', duration: '8 min', content: 'Organic waste in landfills decomposes without oxygen and can release methane, a powerful greenhouse gas. Prevention, food donation, animal feed where appropriate, composting, and anaerobic digestion are preferred pathways.' },
      { id: 'org-2', type: 'video', title: 'Balancing greens, browns, air, and moisture', duration: '6 min', content: 'Video lesson script: combine nitrogen-rich food scraps with carbon-rich dry matter, maintain airflow, and manage moisture to reduce odor.' },
      { id: 'org-3', type: 'quiz', title: 'Composting operations quiz', duration: '6 questions', questions: ['What causes odors?', 'Why add browns?', 'When is food recovery better than composting?'] },
    ],
  },
  {
    id: 'course-ewaste',
    title: 'Electronic Waste And Battery Management',
    level: 'Intermediate',
    audience: 'Schools, offices, repair communities',
    certification: 'E-waste Recovery Coordinator',
    summary: 'Handle electronics, batteries, data-bearing devices, collection events, refurbishment, and certified recycling responsibly.',
    lessons: [
      { id: 'ew-1', type: 'article', title: 'E-waste hazards and recovery value', duration: '10 min', content: 'Electronic waste can contain valuable metals and hazardous components. Safe programs protect data, isolate batteries, prevent fires, and route devices to repair, refurbishment, or certified recycling.' },
      { id: 'ew-2', type: 'article', title: 'Battery collection and fire prevention', duration: '7 min', content: 'Lithium batteries should be protected from puncture and short circuits. Tape terminals, store in a cool dry container, and use approved collection partners.' },
      { id: 'ew-3', type: 'quiz', title: 'E-waste triage quiz', duration: '5 questions', questions: ['Why wipe data?', 'How do you store loose batteries?', 'When is repair preferred?'] },
    ],
  },
  {
    id: 'course-plastic-waste',
    title: 'Plastic Waste, Microplastics, And Reduction Systems',
    level: 'Intermediate',
    audience: 'Schools, households, businesses, municipalities',
    certification: 'Plastic Reduction Planner',
    summary: 'Study plastic pollution pathways, polymer sorting, contamination, microplastics, recycling limits, and practical alternatives to single-use plastics.',
    lessons: [
      { id: 'pla-1', type: 'article', title: 'How plastic pollution moves through communities and waterways', duration: '12 min', content: 'Plastic waste becomes an environmental problem when collection, sorting, and product design fail at the same time. Lightweight packaging can escape bins, enter stormwater, fragment under sunlight, and become difficult to recover. Reducing plastic leakage requires prevention, reusable systems, collection access, and clear separation of recyclable materials.' },
      { id: 'pla-2', type: 'video', title: 'Understanding polymer codes and real recycling constraints', duration: '8 min', content: 'Video lesson script: compare PET, HDPE, PVC, LDPE, PP, PS, and mixed plastics; explain why clean single-polymer streams are easier to recycle than multilayer packaging.' },
      { id: 'pla-3', type: 'project', title: 'Single-use plastic audit', duration: 'Field activity', content: 'Learners document one week of avoidable single-use items, identify refill or reuse alternatives, and create a reduction plan with procurement or household behavior changes.' },
      { id: 'pla-4', type: 'quiz', title: 'Plastic reduction quiz', duration: '7 questions', questions: ['Why are multilayer sachets difficult to recycle?', 'How do microplastics form?', 'Which intervention prevents waste before it exists?'] },
    ],
  },
  {
    id: 'course-climate-waste',
    title: 'Climate Change And Waste Systems',
    level: 'Intermediate',
    audience: 'Community leaders, educators, institutions',
    certification: 'Waste And Climate Literacy Certificate',
    summary: 'Connect landfill methane, embodied carbon, product lifecycles, food waste, and circular practices to climate mitigation.',
    lessons: [
      { id: 'cli-1', type: 'article', title: 'Landfill methane and organic waste', duration: '10 min', content: 'When organic waste decomposes without oxygen in landfills, methane can be produced. Methane control, food waste prevention, composting, and anaerobic digestion are important climate strategies when adapted to local infrastructure and public health requirements.' },
      { id: 'cli-2', type: 'article', title: 'Embodied emissions in products', duration: '9 min', content: 'A product carries emissions from raw material extraction, manufacturing, transport, use, and disposal. Repair, reuse, and longer product lifetimes can reduce demand for new production and avoid unnecessary embodied emissions.' },
      { id: 'cli-3', type: 'project', title: 'Climate-aware waste action plan', duration: 'Workshop', content: 'Learners choose one waste stream, identify prevention and recovery options, and document climate-related benefits and tradeoffs without overstating impact.' },
      { id: 'cli-4', type: 'quiz', title: 'Waste and climate quiz', duration: '6 questions', questions: ['Why does food waste matter for climate?', 'What are embodied emissions?', 'When is reuse more impactful than recycling?'] },
    ],
  },
  {
    id: 'course-sustainable-consumption',
    title: 'Sustainable Consumption And Everyday Systems Change',
    level: 'Beginner',
    audience: 'Individuals, families, schools, workplaces',
    certification: 'Sustainable Consumption Builder',
    summary: 'Build practical habits around purchasing, maintenance, sharing, reuse, repair, and lower-waste living without relying on perfection or greenwashing.',
    lessons: [
      { id: 'sus-1', type: 'article', title: 'Conscious purchasing without greenwashing', duration: '10 min', content: 'Sustainable purchasing begins by asking whether a product is needed, whether an existing item can be repaired, borrowed, refilled, or bought secondhand, and whether claims are backed by transparent materials, durability, and end-of-life information.' },
      { id: 'sus-2', type: 'video', title: 'Building a low-waste household or workplace routine', duration: '7 min', content: 'Video lesson script: focus on repeat systems such as refill stations, shared supplies, repair corners, meal planning, and consistent sorting rather than one-time eco purchases.' },
      { id: 'sus-3', type: 'project', title: 'Footprint reduction sprint', duration: '14-day activity', content: 'Learners select three recurring waste habits, test realistic alternatives, and record barriers such as cost, access, convenience, or policy constraints.' },
      { id: 'sus-4', type: 'quiz', title: 'Sustainable consumption quiz', duration: '6 questions', questions: ['What is greenwashing?', 'Why is durability important?', 'When can sharing reduce material demand?'] },
    ],
  },
  {
    id: 'course-environmental-innovation',
    title: 'Environmental Innovation And Sustainable Entrepreneurship',
    level: 'Advanced',
    audience: 'Creators, NGOs, students, founders',
    certification: 'Circular Innovation Builder',
    summary: 'Turn environmental problems into responsible innovations using problem discovery, material safety, prototyping, impact evidence, and community partnerships.',
    lessons: [
      { id: 'inn-1', type: 'article', title: 'From waste problem to responsible product idea', duration: '11 min', content: 'Good environmental innovation starts with a clearly observed problem, not a desire to reuse any material at all costs. Teams should validate the waste stream, safety risks, user needs, durability, repairability, and whether the solution improves outcomes compared with existing alternatives.' },
      { id: 'inn-2', type: 'article', title: 'Evidence, safety, and impact claims', duration: '9 min', content: 'Creators should document materials used, quantities diverted, safety precautions, expected product lifetime, and limits of their claims. Honest evidence builds trust and prevents harmful reuse of hazardous materials.' },
      { id: 'inn-3', type: 'project', title: 'Circular prototype canvas', duration: 'Studio activity', content: 'Learners map a waste source, user need, product concept, safety check, repair plan, and end-of-life pathway before building a prototype.' },
      { id: 'inn-4', type: 'quiz', title: 'Innovation readiness quiz', duration: '7 questions', questions: ['Why validate material safety?', 'What makes an impact claim credible?', 'How can partnerships improve circular innovation?'] },
    ],
  },
]

const communitySpaces = [
  { name: 'Waste Sorting Help Desk', focus: 'Ask practical sorting questions and compare local disposal systems.' },
  { name: 'School Sustainability Programs', focus: 'Share curriculum ideas, student projects, and campus audit methods.' },
  { name: 'Circular Innovation Studio', focus: 'Find collaborators for reuse products, repair programs, and material experiments.' },
  { name: 'NGO & Community Campaigns', focus: 'Coordinate cleanup drives, awareness programs, and local partnerships.' },
]

const campaigns = [
  ['Zero Waste Week', 'Citywide challenge to reduce single-use plastic and publish daily waste audits.', 78, '14 institutions'],
  ['School Cleanup League', 'Student-led neighborhood cleanup drives with verified collection weights.', 64, '32 schools'],
  ['Hospital Safety Sprint', 'Clinical waste segregation training and sharps audit campaign.', 51, '9 hospitals'],
]

const starterPosts = []

const starterCampaigns = campaigns.map(([title, desc, progress, inst], index) => ({
  id: `campaign-${index + 1}`,
  title,
  description: desc,
  progress: 0,
  participants: 0,
  location: ['Global', 'Canada', 'Germany'][index],
  joinedBy: [],
  createdBy: 'CircularHub',
  category: ['Plastic Waste', 'Organic Waste', 'Medical Waste'][index],
}))

const starterLearning = courseCatalog.map((course) => ({
  ...course,
  completedBy: [],
  quizScore: 0,
  completedLessonsByUser: {},
  certificatesByUser: {},
}))

const marketplaceSections = [
  'Recycled & Upcycled Products',
  'Eco-Friendly Products',
  'Sustainability Services',
  'DIY Kits & Creative Projects',
  'Educational Resources',
  'Material Exchange Hub',
  'Innovation Collaborations',
  'Institutional Sustainability Services',
]

const marketplaceListingExamples = [
  {
    id: 'market-1',
    title: 'Pallet Timber Modular Study Desk',
    listingType: 'product',
    section: 'Recycled & Upcycled Products',
    price: 'USD 180',
    location: 'Ships from regional creator hubs',
    seller: 'LoopWorks Studio',
    sellerRole: 'Creator Store',
    image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1000&q=80',
    description: 'A flat-pack study desk built from recovered pallet timber, sealed with low-VOC finish, and designed for repairable classroom use.',
    materials: ['Recovered pallet timber', 'Reused steel brackets', 'Low-VOC finish'],
    wasteTypes: ['Industrial Waste', 'Wood surplus'],
    impactScore: 91,
    carbonInsight: 'Extends recovered wood life and avoids virgin desk material demand.',
    sustainabilityStory: 'Each desk includes a material passport showing source, repair notes, and end-of-life reuse options.',
    reuseProcess: 'Pallets are de-nailed, graded, planed, joined into panels, and assembled with replaceable fasteners.',
    certifications: ['Low-VOC finish', 'Repairable design'],
    availability: 'Made to order',
    reviews: [{ author: 'School buyer', rating: 5, text: 'Strong story and practical repair documentation.' }],
    savedBy: [],
    followers: [],
    orders: [],
  },
  {
    id: 'market-2',
    title: 'Hospital Waste Segregation Training Sprint',
    listingType: 'service',
    section: 'Sustainability Services',
    price: 'Custom quote',
    location: 'Remote or onsite globally',
    seller: 'SafeCycle Advisory',
    sellerRole: 'Verified Service Provider',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000&q=80',
    description: 'A professional training and audit package for sharps handling, infectious waste segregation, signage, and chain-of-custody workflows.',
    materials: ['Training curriculum', 'Audit templates', 'PPE protocol cards'],
    wasteTypes: ['Medical Waste'],
    impactScore: 96,
    carbonInsight: 'Reduces unsafe mixing and prevents unnecessary treatment of non-hazardous materials.',
    sustainabilityStory: 'Designed for clinics and hospitals that need safer segregation and measurable compliance readiness.',
    reuseProcess: 'Reusable templates and translated signage packs support repeated staff training cycles.',
    certifications: ['Healthcare waste safety', 'ISO 14001 advisory'],
    availability: 'Booking slots open',
    reviews: [],
    savedBy: [],
    followers: [],
    orders: [],
  },
  {
    id: 'market-3',
    title: 'E-waste Repair Classroom Kit',
    listingType: 'resource',
    section: 'DIY Kits & Creative Projects',
    price: 'USD 45',
    location: 'Digital + shipped toolkit',
    seller: 'Repair Futures Collective',
    sellerRole: 'Education Partner',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80',
    description: 'A guided kit for teaching safe electronics triage, data responsibility, repair-first thinking, and certified recycling pathways.',
    materials: ['Lesson cards', 'Device triage sheets', 'Battery safety labels'],
    wasteTypes: ['Electronic Waste', 'Batteries'],
    impactScore: 88,
    carbonInsight: 'Encourages repair and refurbishment before material recovery.',
    sustainabilityStory: 'Built for schools, repair cafes, and youth innovation groups.',
    reuseProcess: 'Students learn to inspect, classify, document, and route devices responsibly.',
    certifications: ['STEM education resource'],
    availability: 'Available now',
    reviews: [],
    savedBy: [],
    followers: [],
    orders: [],
  },
  {
    id: 'market-4',
    title: 'Fabric Offcut Exchange: 120 kg Mixed Cotton',
    listingType: 'material',
    section: 'Material Exchange Hub',
    price: 'Exchange or pickup',
    location: 'Available for regional pickup',
    seller: 'Circular Textile Mill',
    sellerRole: 'Institutional Storefront',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1000&q=80',
    description: 'Clean textile offcuts suitable for school projects, patchwork products, acoustic panels, or reuse prototyping.',
    materials: ['Cotton offcuts', 'Sorted textile bundles'],
    wasteTypes: ['Textile Waste', 'Industrial Waste'],
    impactScore: 83,
    carbonInsight: 'Diverts clean manufacturing surplus into reuse before downcycling.',
    sustainabilityStory: 'Listed to connect manufacturers with creators and educators.',
    reuseProcess: 'Materials are sorted by fiber type and packed for reuse partners.',
    certifications: ['Material passport available'],
    availability: 'Partner request required',
    reviews: [],
    savedBy: [],
    followers: [],
    orders: [],
  },
]

const starterMarketplaceListings = []

const starterStorefronts = []

function PlatformProvider({ children }) {
  const [communityPosts, setCommunityPosts] = usePersistentState('circularhub.v4.posts', starterPosts)
  const [liveCampaigns, setLiveCampaigns] = usePersistentState('circularhub.v4.campaigns', starterCampaigns)
  const [learning, setLearning] = usePersistentState('circularhub.v4.learning', starterLearning)
  const [scanHistory, setScanHistory] = usePersistentState('circularhub.v4.scans', [])
  const [marketplaceListings, setMarketplaceListings] = usePersistentState('circularhub.v4.marketplace', starterMarketplaceListings)
  const [storefronts, setStorefronts] = usePersistentState('circularhub.v4.storefronts', starterStorefronts)
  const { currentUser } = useAuth()

  const createPost = (payload) => {
    const post = {
      ...payload,
      id: `post-${Date.now()}`,
      author: currentUser?.username || 'Guest contributor',
      role: currentUser?.role || 'Individual',
      country: currentUser?.country || 'Global',
      comments: [],
      savedBy: [],
      createdAt: new Date().toISOString(),
    }
    setCommunityPosts((items) => [post, ...items])
  }

  const commentOnPost = (postId, body) => {
    if (!body.trim()) return
    setCommunityPosts((items) => items.map((post) => post.id === postId ? {
      ...post,
      comments: [...post.comments, { id: `comment-${Date.now()}`, author: currentUser?.username || 'Guest', body }],
    } : post))
  }

  const toggleSave = (postId) => {
    setCommunityPosts((items) => items.map((post) => {
      if (post.id !== postId || !currentUser) return post
      const saved = post.savedBy.includes(currentUser.id)
      return { ...post, savedBy: saved ? post.savedBy.filter((id) => id !== currentUser.id) : [...post.savedBy, currentUser.id] }
    }))
  }

  const createCampaign = (payload) => {
    setLiveCampaigns((items) => [{
      ...payload,
      id: `campaign-${Date.now()}`,
      progress: 5,
      participants: 1,
      joinedBy: currentUser ? [currentUser.id] : [],
      createdBy: currentUser?.username || 'Community',
    }, ...items])
  }

  const joinCampaign = (campaignId) => {
    setLiveCampaigns((items) => items.map((campaign) => {
      if (campaign.id !== campaignId || !currentUser || campaign.joinedBy.includes(currentUser.id)) return campaign
      return { ...campaign, joinedBy: [...campaign.joinedBy, currentUser.id], participants: campaign.participants + 1, progress: Math.min(100, campaign.progress + 7) }
    }))
  }

  const completeLesson = (courseId, lessonId) => {
    setLearning((items) => items.map((course) => {
      if (!currentUser || course.id !== courseId) return course
      const completed = new Set(course.completedLessonsByUser[currentUser.id] || [])
      completed.add(lessonId)
      const completedLessonsByUser = { ...course.completedLessonsByUser, [currentUser.id]: [...completed] }
      const isCertified = completed.size === course.lessons.length
      const certificatesByUser = isCertified ? { ...course.certificatesByUser, [currentUser.id]: new Date().toISOString() } : course.certificatesByUser
      return { ...course, completedLessonsByUser, certificatesByUser }
    }))
  }

  const completeCourse = (courseId) => {
    setLearning((items) => items.map((course) => {
      if (!currentUser || course.id !== courseId) return course
      const completedLessonsByUser = { ...course.completedLessonsByUser, [currentUser.id]: course.lessons.map((lesson) => lesson.id) }
      const certificatesByUser = { ...course.certificatesByUser, [currentUser.id]: new Date().toISOString() }
      const completedBy = course.completedBy.includes(currentUser.id) ? course.completedBy : [...course.completedBy, currentUser.id]
      return { ...course, completedBy, completedLessonsByUser, certificatesByUser, quizScore: 100 }
    }))
  }

  const saveScan = (scan) => {
    setScanHistory((items) => [{ ...scan, id: `scan-${Date.now()}`, userId: currentUser?.id, createdAt: new Date().toISOString() }, ...items])
  }

  const createListing = (payload) => {
    const storefront = storefronts.find((store) => store.ownerId === currentUser?.id)
    const listing = {
      ...payload,
      id: `market-${Date.now()}`,
      seller: storefront?.name || currentUser?.username || 'CircularHub seller',
      sellerRole: storefront?.type || `${currentUser?.role || 'Individual'} storefront`,
      storefrontId: storefront?.id || null,
      reviews: [],
      savedBy: [],
      followers: [],
      orders: [],
      createdAt: new Date().toISOString(),
    }
    setMarketplaceListings((items) => [listing, ...items])
  }

  const createStorefront = (payload) => {
    if (!currentUser) return
    setStorefronts((items) => {
      const existing = items.find((store) => store.ownerId === currentUser.id)
      const store = {
        ...payload,
        id: existing?.id || `store-${Date.now()}`,
        ownerId: currentUser.id,
        ownerName: currentUser.username,
        followers: existing?.followers || [],
        createdAt: existing?.createdAt || new Date().toISOString(),
      }
      return existing ? items.map((item) => item.id === existing.id ? store : item) : [store, ...items]
    })
  }

  const toggleListingSave = (listingId) => {
    setMarketplaceListings((items) => items.map((listing) => {
      if (!currentUser || listing.id !== listingId) return listing
      const saved = listing.savedBy.includes(currentUser.id)
      return { ...listing, savedBy: saved ? listing.savedBy.filter((id) => id !== currentUser.id) : [...listing.savedBy, currentUser.id] }
    }))
  }

  const followSeller = (listingId) => {
    setMarketplaceListings((items) => items.map((listing) => {
      if (!currentUser || listing.id !== listingId || listing.followers.includes(currentUser.id)) return listing
      return { ...listing, followers: [...listing.followers, currentUser.id] }
    }))
  }

  const reviewListing = (listingId, review) => {
    if (!review.text.trim()) return
    setMarketplaceListings((items) => items.map((listing) => listing.id === listingId ? {
      ...listing,
      reviews: [...listing.reviews, { ...review, author: currentUser?.username || 'Community member' }],
    } : listing))
  }

  const requestListing = (listingId) => {
    setMarketplaceListings((items) => items.map((listing) => {
      if (!currentUser || listing.id !== listingId) return listing
      return { ...listing, orders: [...listing.orders, { userId: currentUser.id, status: 'requested', createdAt: new Date().toISOString() }] }
    }))
  }

  return (
    <PlatformContext.Provider value={{ communityPosts, liveCampaigns, learning, scanHistory, marketplaceListings, storefronts, createPost, commentOnPost, toggleSave, createCampaign, joinCampaign, completeLesson, completeCourse, saveScan, createListing, createStorefront, toggleListingSave, followSeller, reviewListing, requestListing }}>
      {children}
    </PlatformContext.Provider>
  )
}

function usePlatform() {
  return useContext(PlatformContext)
}

function classifyWaste(input) {
  const text = input.toLowerCase()
  if (text.includes('battery') || text.includes('phone') || text.includes('cable')) return wasteTypes[2]
  if (text.includes('needle') || text.includes('medical') || text.includes('glove') || text.includes('syringe')) return wasteTypes[1]
  if (text.includes('chemical') || text.includes('paint') || text.includes('solvent')) return wasteTypes[4]
  if (text.includes('food') || text.includes('banana') || text.includes('organic')) return wasteTypes[3]
  if (text.includes('factory') || text.includes('metal') || text.includes('pallet')) return wasteTypes[5]
  return wasteTypes[0]
}

function Card({ children, className = '' }) {
  return <div className={`rounded-lg border border-line bg-white shadow-card ${className}`}>{children}</div>
}

function Stat({ label, value, detail, icon: Icon = Activity }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{detail}</p>
        </div>
        <div className="rounded-md bg-forest-50 p-2 text-forest-700">
          <Icon size={20} />
        </div>
      </div>
    </Card>
  )
}

function SectionHeader({ eyebrow, title, children }) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest-700">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink md:text-3xl">{title}</h2>
      </div>
      {children && <p className="max-w-2xl text-sm leading-6 text-slate-600">{children}</p>}
    </div>
  )
}

function AppShell() {
  const { currentUser, signOut } = useAuth()
  return (
    <div className="min-h-screen bg-mist text-ink">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-line bg-white/95 p-4 lg:block">
        <NavLink to="/app" className="flex items-center gap-3 rounded-lg px-3 py-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-forest-900 text-white"><Leaf size={22} /></span>
          <span>
            <span className="block text-lg font-semibold">CircularHub</span>
            <span className="text-xs text-slate-500">Sustainability intelligence</span>
          </span>
        </NavLink>
        <nav className="mt-6 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/app'} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${isActive ? 'bg-forest-900 text-white' : 'text-slate-600 hover:bg-forest-50 hover:text-forest-900'}`}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <Card className="mt-6 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold"><Sparkles size={16} /> AI system status</div>
          <p className="mt-2 text-sm text-slate-600">Recognition, assistant, and analytics engines are using modular provider adapters.</p>
          <div className="mt-4 h-2 rounded-full bg-slate-100"><div className="h-2 w-[86%] rounded-full bg-forest-500" /></div>
        </Card>
        <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-line bg-mist p-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-forest-900 text-sm font-semibold text-white">{currentUser?.username?.slice(0, 2).toUpperCase()}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{currentUser?.username}</p>
              <p className="truncate text-xs text-slate-500">{currentUser?.role} • {currentUser?.country || 'Global'}</p>
            </div>
            <button onClick={signOut} className="rounded-md border border-line px-2 py-1 text-xs text-slate-600">Sign out</button>
          </div>
        </div>
      </aside>
      <main className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-line bg-white/85 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-line bg-white px-3 py-2 text-slate-500">
              <Search size={18} />
              <span className="truncate text-sm">Search waste categories, campaigns, courses, institutions...</span>
            </div>
            <NavLink to="/app/waste" className="hidden rounded-md bg-forest-900 px-4 py-2 text-sm font-semibold text-white md:inline-flex">Open AI Scanner</NavLink>
          </div>
        </header>
        <div className="px-4 py-8 md:px-8">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="waste" element={<WasteExplorer />} />
            <Route path="learning" element={<Learning />} />
            <Route path="community" element={<Community />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="institution" element={<Institution />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="profile" element={<Profile />} />
            <Route path="admin" element={<Admin />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

function Landing() {
  return (
    <div className="bg-white text-ink">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3 text-lg font-semibold"><span className="grid h-10 w-10 place-items-center rounded-lg bg-forest-900 text-white"><Leaf /></span>CircularHub</div>
        <NavLink to="/auth" className="rounded-md bg-forest-900 px-4 py-2 text-sm font-semibold text-white">Log in</NavLink>
      </header>
      <section className="relative overflow-hidden border-y border-line bg-forest-950 text-white">
        <div className="absolute inset-0 environmental-grid opacity-40" />
        <div className="mx-auto grid min-h-[660px] max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm"><Brain size={16} /> AI-powered sustainability operating system</p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-tight md:text-7xl">CircularHub</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-50">A protected sustainability platform for waste recognition, environmental learning, institutional reporting, circular innovation, and community action.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <NavLink to="/auth" className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-forest-950">Log in or create account</NavLink>
              <span className="inline-flex items-center rounded-md border border-white/25 px-5 py-3 text-sm font-semibold text-white">Members only access</span>
            </div>
          </motion.div>
          <Card className="relative border-white/10 bg-white/10 p-5 text-white shadow-soft backdrop-blur">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-emerald-100">Protected workspace</p><h2 className="mt-1 text-2xl font-semibold">Member access required</h2></div>
              <Sparkles className="text-emerald-200" />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {['AI waste reports', 'Learning progress', 'Marketplace requests', 'Campaign evidence'].map((item) => <div key={item} className="rounded-lg bg-white/10 p-4"><CheckCircle2 className="text-emerald-200" /><p className="mt-3 text-sm text-emerald-100">{item}</p></div>)}
            </div>
            <div className="mt-6 space-y-3">
              {['Create an account to enter the dashboard', 'Sign in before using scanner tools', 'Protected campaign and marketplace workflows', 'Private profile and contribution records'].map((item) => <div key={item} className="rounded-lg bg-white/10 p-3 text-sm text-emerald-50">{item}</div>)}
            </div>
          </Card>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16">
        <SectionHeader eyebrow="Platform modules" title="Built for action, education, and institutional trust">The public page introduces the platform. Account access is required for every dashboard workflow.</SectionHeader>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [ScanLine, 'AI Waste Recognition', 'Classify waste, hazard, risks, disposal routes, recycling methods, and safe handling.'],
            [MessageSquareText, 'Sustainability Assistant', 'Contextual answers for households, schools, hospitals, and industry teams.'],
            [LineChart, 'Impact Analytics', 'Scores, trends, comparisons, and AI-generated recommendations for institutions.'],
          ].map(([Icon, title, text]) => <Card key={title} className="p-6 transition hover:-translate-y-1 hover:shadow-soft"><Icon className="text-forest-700" /><h3 className="mt-5 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></Card>)}
        </div>
        <div className="mt-10 rounded-lg border border-line bg-mist p-6 text-center">
          <h3 className="text-xl font-semibold">Ready to access CircularHub?</h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">Log in or create an account to use the dashboard, scanner, learning tools, campaigns, marketplace, and profile features.</p>
          <NavLink to="/auth" className="mt-5 inline-flex rounded-md bg-forest-900 px-5 py-3 text-sm font-semibold text-white">Continue to login</NavLink>
        </div>
      </section>
    </div>
  )
}

function Dashboard() {
  const { currentUser } = useAuth()
  const { communityPosts, liveCampaigns, learning, scanHistory } = usePlatform()
  const completedLessons = learning.reduce((sum, course) => sum + (course.completedLessonsByUser[currentUser.id]?.length || 0), 0)
  const totalLessons = learning.reduce((sum, course) => sum + course.lessons.length, 0)
  const joined = liveCampaigns.filter((campaign) => campaign.joinedBy.includes(currentUser.id)).length
  const myPosts = communityPosts.filter((post) => post.author === currentUser.username).length
  const myScans = scanHistory.filter((scan) => scan.userId === currentUser.id).length
  const activityTrend = [
    { month: 'Posts', awareness: myPosts, reuse: 0, diversion: 0 },
    { month: 'Lessons', awareness: 0, reuse: completedLessons, diversion: 0 },
    { month: 'Campaigns', awareness: 0, reuse: 0, diversion: joined },
    { month: 'Scans', awareness: myScans, reuse: myScans, diversion: 0 },
  ]
  const roleInsight = {
    Individual: 'AI suggests joining one global campaign and completing the waste literacy foundations course.',
    School: 'AI detected strong student engagement. Next best action: publish a monthly plastic audit.',
    Hospital: 'AI recommends a sharps segregation refresher and tighter contractor documentation.',
    Industry: 'AI recommends mapping byproduct streams for industrial symbiosis partners.',
    NGO: 'AI suggests recruiting regional coordinators for multilingual campaign facilitation.',
    Admin: 'AI moderation queue has safety-sensitive medical content requiring review.',
  }[currentUser.role] || 'AI recommends one practical sustainability action this week.'
  return (
    <>
      <SectionHeader eyebrow="Home dashboard" title={`Good morning, ${currentUser.username}. Your ${currentUser.role.toLowerCase()} workspace is live.`}>{roleInsight}</SectionHeader>
      {!currentUser.onboardingComplete && <OnboardingPrompt />}
      {myPosts + joined + completedLessons + myScans === 0 && (
        <Card className="mb-6 p-6">
          <h3 className="text-xl font-semibold">Start building your real CircularHub record</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Your dashboard is intentionally empty until you participate. Scan a waste item, complete a lesson, join a campaign, or publish a project to generate your own analytics.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <NavLink to="/app/waste" className="rounded-md bg-forest-900 px-4 py-2 text-sm font-semibold text-white">Run first AI scan</NavLink>
            <NavLink to="/app/learning" className="rounded-md border border-line px-4 py-2 text-sm font-semibold">Begin learning</NavLink>
          </div>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Stat label="Contribution record" value={myPosts + joined + completedLessons + myScans} detail="Counted from completed actions" icon={Leaf} />
        <Stat label="Campaigns joined" value={joined} detail={`${liveCampaigns.reduce((sum, c) => sum + c.participants, 0)} global participants`} icon={Recycle} />
        <Stat label="Learning progress" value={`${totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0}%`} detail={`${completedLessons} of ${totalLessons} lessons completed`} icon={BookOpen} />
        <Stat label="AI scans saved" value={myScans} detail="Scanner history from real analyses" icon={ScanLine} />
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-[1.3fr_.7fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between"><h3 className="font-semibold">Your activity signals</h3><span className="text-sm text-forest-700">Generated from real actions</span></div>
          <div className="h-80"><TrendChart data={activityTrend} /></div>
        </Card>
        <AssistantPanel />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {liveCampaigns.slice(0, 3).map((campaign) => <CampaignCard key={campaign.id} title={campaign.title} desc={campaign.description} progress={campaign.progress} meta={`${campaign.participants} participants`} />)}
      </div>
    </>
  )
}

function OnboardingPrompt() {
  return (
    <Card className="mb-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold">Personalize your CircularHub workspace</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Choose your interests and learning goals so recommendations start from your real priorities.</p>
        </div>
        <NavLink to="/onboarding" className="rounded-md bg-forest-900 px-4 py-2 text-sm font-semibold text-white">Continue onboarding</NavLink>
      </div>
    </Card>
  )
}

function WasteExplorer() {
  const { saveScan, createPost, scanHistory, liveCampaigns, learning, marketplaceListings } = usePlatform()
  const { currentUser, token } = useAuth()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [report, setReport] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [step, setStep] = useState(0)
  const scanningSteps = ['Analyzing waste composition...', 'Detecting sustainability risks...', 'Generating recycling insights...']

  useEffect(() => {
    if (status !== 'scanning') return undefined
    const timer = setInterval(() => setStep((value) => (value + 1) % scanningSteps.length), 1200)
    return () => clearInterval(timer)
  }, [status])

  const chooseFile = (selected) => {
    const image = selected?.[0]
    if (!image) return
    setFile(image)
    setPreview(URL.createObjectURL(image))
    setReport(null)
    setError('')
  }

  const analyze = async () => {
    if (!file) return
    setStatus('scanning')
    setError('')
    const body = new FormData()
    body.append('file', file)
    try {
      const response = await fetch(`${API_BASE_URL}/ai/scanner/analyze`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body,
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'AI scanner analysis failed.')
      setReport(data.report)
      setStatus('complete')
    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }

  const saveCurrentScan = () => {
    if (!report) return
    saveScan({ report, preview })
  }

  const shareScan = () => {
    if (!report) return
    createPost({
      title: `AI scan: ${report.waste_category}`,
      description: `${report.environmental_impact} Recommended action: ${report.sorting_guidance}`,
      category: report.waste_category,
      impact: 'AI-analyzed waste item',
      tags: ['ai-scan', 'waste-intelligence', currentUser.role.toLowerCase()],
      image: preview,
    })
  }
  const recommendedLearning = report ? learning.filter((course) => `${course.title} ${course.summary}`.toLowerCase().includes(report.waste_category.split(' ')[0].toLowerCase())).slice(0, 2) : []
  const recommendedListings = report ? marketplaceListings.filter((listing) => `${listing.title} ${listing.description} ${listing.wasteTypes.join(' ')}`.toLowerCase().includes(report.waste_category.split(' ')[0].toLowerCase())).slice(0, 2) : []

  return (
    <>
      <SectionHeader eyebrow="Waste intelligence explorer" title="AI-guided environmental encyclopedia">Search, scan, and learn the correct handling path for complex waste streams.</SectionHeader>
      <div className="grid gap-4 xl:grid-cols-[.9fr_1.1fr]">
        <Card className="p-5">
          <h3 className="flex items-center gap-2 font-semibold"><Camera size={18} /> AI waste scanner</h3>
          <label onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); chooseFile(e.dataTransfer.files) }} className="mt-4 block cursor-pointer rounded-lg border border-dashed border-forest-300 bg-forest-50 p-8 text-center transition hover:bg-forest-100">
            <input type="file" accept="image/png,image/jpeg,image/webp" capture="environment" onChange={(e) => chooseFile(e.target.files)} className="hidden" />
            <Upload className="mx-auto text-forest-700" />
            <p className="mt-3 font-semibold">Drag, upload, or capture a waste image</p>
            <p className="mt-2 text-sm text-slate-600">The image is sent to the FastAPI scanner endpoint and analyzed by OpenAI Vision when `OPENAI_API_KEY` is configured.</p>
          </label>
          {preview && <img src={preview} alt="Waste scan preview" className="mt-4 max-h-72 w-full rounded-lg object-cover" />}
          {status === 'scanning' && <div className="mt-4 rounded-lg bg-ink p-4 text-white"><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-2/3 animate-pulse rounded-full bg-emerald-300" /></div><p className="mt-3 text-sm font-semibold">{scanningSteps[step]}</p></div>}
          {error && <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm leading-6 text-red-700">{error}</div>}
          <button disabled={!file || status === 'scanning'} onClick={analyze} className="mt-4 w-full rounded-md bg-forest-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">Analyze with AI Vision</button>
          {report && (
            <div className="mt-4 rounded-lg border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-sm text-slate-500">AI analysis report</p><h3 className="mt-1 text-2xl font-semibold">{report.waste_category}</h3></div>
                <span className="rounded-full bg-forest-50 px-3 py-1 text-sm font-semibold text-forest-700">{Math.round(report.confidence * 100)}% confidence</span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Insight title="Hazard level" value={report.hazard_level} />
                <Insight title="Decomposition" value={report.decomposition_timeline} />
                <Insight title="Environmental impact" value={report.environmental_impact} wide />
                <Insight title="Sorting guidance" value={report.sorting_guidance} wide />
              </div>
              <ResultList title="Disposal recommendations" items={report.disposal_recommendations} />
              <ResultList title="Recycling methods" items={report.recycling_methods} />
              <ResultList title="Reuse opportunities" items={report.reuse_opportunities} />
              <ResultList title="Safety precautions" items={report.safety_precautions} />
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-lg bg-mist p-3"><p className="font-semibold">Related learning</p>{recommendedLearning.length ? recommendedLearning.map((course) => <p key={course.id} className="mt-2 text-sm text-slate-600">{course.title}</p>) : <p className="mt-2 text-sm text-slate-600">No exact course match yet. Start with Waste Segregation Foundations for general handling principles.</p>}</div>
                <div className="rounded-lg bg-mist p-3"><p className="font-semibold">Marketplace support</p>{recommendedListings.length ? recommendedListings.map((listing) => <p key={listing.id} className="mt-2 text-sm text-slate-600">{listing.title}</p>) : <p className="mt-2 text-sm text-slate-600">Relevant products or services will appear after sellers publish matching listings.</p>}</div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={saveCurrentScan} className="rounded-md bg-forest-900 px-3 py-2 text-sm font-semibold text-white">Save scan history</button>
                <button onClick={shareScan} className="rounded-md border border-line px-3 py-2 text-sm font-semibold">Share as innovation post</button>
              </div>
            </div>
          )}
        </Card>
        <div className="grid gap-4">
          <Card className="p-5">
            <h3 className="font-semibold">Your scan history</h3>
            <div className="mt-4 space-y-3">
              {scanHistory.filter((scan) => scan.userId === currentUser.id).length === 0 && <p className="text-sm text-slate-600">No saved scans yet. Your history begins after a real AI analysis is saved.</p>}
              {scanHistory.filter((scan) => scan.userId === currentUser.id).slice(0, 4).map((scan) => <div key={scan.id} className="rounded-lg bg-mist p-3"><p className="font-medium">{scan.report.waste_category}</p><p className="text-sm text-slate-500">{new Date(scan.createdAt).toLocaleString()}</p></div>)}
            </div>
          </Card>
          <Card className="p-5"><h3 className="font-semibold">Connect scan to campaigns</h3><div className="mt-4 space-y-3">{liveCampaigns.slice(0, 3).map((campaign) => <div key={campaign.id} className="rounded-lg border border-line p-3"><p className="font-medium">{campaign.title}</p><p className="text-sm text-slate-500">{campaign.location} • {campaign.category}</p></div>)}</div></Card>
          <div className="grid gap-4 md:grid-cols-2">{wasteTypes.map((w) => <WasteCard key={w.name} waste={w} />)}</div>
        </div>
      </div>
      <Card className="mt-6 p-5 bg-gradient-to-r from-emerald-50 via-slate-50 to-cyan-50 shadow-soft">
        <SectionHeader eyebrow="Collection system" title="Clear collection paths for communities and institutions">This waste collection plan helps homes, schools, hospitals, and factories move material to the right recovery path instead of littering or unsafe disposal.</SectionHeader>
        <div className="grid gap-4 lg:grid-cols-2">
          {collectionGuides.map((plan) => <CollectionPlanCard key={plan.title} plan={plan} />)}
        </div>
      </Card>
    </>
  )
}

function Insight({ title, value, wide = false }) {
  return <div className={`rounded-lg bg-mist p-3 ${wide ? 'md:col-span-2' : ''}`}><p className="text-xs font-semibold uppercase tracking-[0.12em] text-forest-700">{title}</p><p className="mt-2 text-sm leading-6 text-slate-700">{value}</p></div>
}

function ResultList({ title, items }) {
  return <div className="mt-4"><p className="font-semibold">{title}</p><div className="mt-2 grid gap-2">{items.map((item) => <div key={item} className="flex gap-2 rounded-md bg-mist p-3 text-sm leading-6 text-slate-700"><CheckCircle2 className="mt-1 shrink-0 text-forest-700" size={16} />{item}</div>)}</div></div>
}

function WasteCard({ waste }) {
  return (
    <Card className="p-5 transition hover:-translate-y-1 hover:shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{waste.name}</h3>
        <span className="rounded-full px-2.5 py-1 text-xs font-semibold text-white" style={{ backgroundColor: waste.tone }}>{waste.hazard}</span>
      </div>
      <p className="mt-3 text-sm text-slate-500">Timeline: {waste.timeline}</p>
      <p className="mt-3 text-sm leading-6 text-slate-700">{waste.impact}</p>
      <div className="mt-4 space-y-2 text-sm">
        <p><strong>Recycling:</strong> {waste.recycle}</p>
        <p><strong>AI reuse:</strong> {waste.reuse.slice(0, 2).join(', ')}</p>
      </div>
    </Card>
  )
}

function CollectionPlanCard({ plan }) {
  return (
    <div className="rounded-3xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-700">{plan.title}</p>
          <p className="mt-3 text-lg font-semibold text-ink">{plan.description}</p>
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-forest-900" style={{ backgroundColor: plan.tone, color: '#fff' }}><Recycle size={20} /></span>
      </div>
      <div className="mt-5 space-y-3">
        {plan.steps.map((step, index) => (
          <div key={step} className="rounded-2xl bg-mist p-3 text-sm text-slate-700">
            <span className="font-semibold text-forest-700">Step {index + 1}.</span> {step}
          </div>
        ))}
      </div>
    </div>
  )
}

function Learning() {
  const { currentUser } = useAuth()
  const { learning, completeLesson } = usePlatform()
  const [activeCourseId, setActiveCourseId] = useState(learning[0]?.id)
  const activeCourse = learning.find((course) => course.id === activeCourseId) || learning[0]
  const completed = activeCourse?.completedLessonsByUser[currentUser.id] || []
  const progress = activeCourse ? Math.round((completed.length / activeCourse.lessons.length) * 100) : 0
  return (
    <>
      <SectionHeader eyebrow="Learning hub" title="Environmental education designed like a serious learning product">Courses, guides, quizzes, and institutional training paths organized by audience and waste stream.</SectionHeader>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {learning.map((course) => {
          const done = course.completedLessonsByUser[currentUser.id]?.length || 0
          const certified = Boolean(course.certificatesByUser[currentUser.id])
          return <Card key={course.id} className={`p-5 transition ${activeCourseId === course.id ? 'ring-2 ring-forest-500' : ''}`}><BookOpen className="text-forest-700" /><h3 className="mt-4 font-semibold">{course.title}</h3><p className="mt-2 text-sm text-slate-600">{course.lessons.length} lessons - {course.level}</p><p className="mt-3 text-sm leading-6 text-slate-500">{course.summary}</p><div className="mt-5 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-forest-500" style={{ width: `${Math.round((done / course.lessons.length) * 100)}%` }} /></div><button onClick={() => setActiveCourseId(course.id)} className="mt-4 w-full rounded-md border border-line px-3 py-2 text-sm font-semibold text-forest-800">{certified ? 'View certificate pathway' : 'Open course'}</button></Card>
        })}
      </div>
      <Card className="mt-6 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div><h3 className="text-xl font-semibold">{activeCourse.title}</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{activeCourse.summary}</p></div>
          <div className="rounded-lg bg-forest-50 p-3 text-sm font-semibold text-forest-800">{progress}% complete</div>
        </div>
        <div className="mt-5 grid gap-3">
          {activeCourse.lessons.map((lesson, index) => {
            const done = completed.includes(lesson.id)
            return <div key={lesson.id} className="rounded-lg border border-line p-4"><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-700">{lesson.type} - Lesson {index + 1}</p><h4 className="mt-2 font-semibold">{lesson.title}</h4><p className="mt-2 text-sm leading-6 text-slate-600">{lesson.content}</p>{lesson.questions && <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">{lesson.questions.map((q) => <li key={q}>{q}</li>)}</ul>}</div><button onClick={() => completeLesson(activeCourse.id, lesson.id)} className="rounded-md bg-forest-900 px-3 py-2 text-sm font-semibold text-white">{done ? 'Completed' : 'Mark complete'}</button></div></div>
          })}
        </div>
        {activeCourse.certificatesByUser[currentUser.id] && <div className="mt-5 rounded-lg bg-forest-900 p-4 text-white"><p className="font-semibold">{activeCourse.certification}</p><p className="mt-1 text-sm text-emerald-100">Certification earned from completed lessons and quiz work.</p></div>}
      </Card>
    </>
  )
}

function Community() {
  const { currentUser } = useAuth()
  const { communityPosts, createPost, commentOnPost, toggleSave } = usePlatform()
  const [draft, setDraft] = useState({ title: '', description: '', category: 'Plastic Waste', impact: '', tags: 'global, collaboration', image: '' })
  const [comments, setComments] = useState({})
  const submit = (event) => {
    event.preventDefault()
    if (!draft.title.trim() || !draft.description.trim()) return
    createPost({ ...draft, tags: draft.tags.split(',').map((tag) => tag.trim()).filter(Boolean), image: draft.image || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=900&q=80' })
    setDraft({ title: '', description: '', category: 'Plastic Waste', impact: '', tags: 'global, collaboration', image: '' })
  }
  return (
    <>
      <SectionHeader eyebrow="Community innovation feed" title="Professional sharing for reuse projects and environmental initiatives">Structured posts prioritize materials, safety, outcomes, and collaboration over virality.</SectionHeader>
      <Card className="mb-6 p-5">
        <h3 className="font-semibold">Share a sustainability project</h3>
        <form onSubmit={submit} className="mt-4 grid gap-3 lg:grid-cols-2">
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm" placeholder="Project title" />
          <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm">{wasteTypes.map((w) => <option key={w.name}>{w.name}</option>)}</select>
          <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="min-h-24 rounded-md border border-line px-3 py-3 text-sm lg:col-span-2" placeholder="Describe methods, safety notes, materials, and what others can learn." />
          <input value={draft.impact} onChange={(e) => setDraft({ ...draft, impact: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm" placeholder="Impact, e.g. 120 kg diverted" />
          <input value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm" placeholder="Tags, comma separated" />
          <button className="rounded-md bg-forest-900 px-4 py-3 text-sm font-semibold text-white lg:col-span-2">Publish to global feed</button>
        </form>
      </Card>
      <div className="grid gap-4">
        {communityPosts.length === 0 && <Card className="p-6"><h3 className="text-xl font-semibold">No community posts yet</h3><p className="mt-2 text-sm leading-6 text-slate-600">The global feed starts when members publish real projects, questions, audits, or collaboration requests. Choose a space below or share the first documented initiative.</p><div className="mt-4 grid gap-3 md:grid-cols-2">{communitySpaces.map((space) => <div key={space.name} className="rounded-lg bg-mist p-4"><p className="font-semibold">{space.name}</p><p className="mt-1 text-sm leading-6 text-slate-600">{space.focus}</p></div>)}</div></Card>}
        {communityPosts.map((post) => {
          const saved = post.savedBy.includes(currentUser.id)
          return <Card key={post.id} className="overflow-hidden"><div className="grid md:grid-cols-[220px_1fr]"><img src={post.image} alt="" className="h-full min-h-56 w-full object-cover" /><div className="p-5"><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><span className="rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-700">{post.category}</span><h3 className="mt-3 text-xl font-semibold">{post.title}</h3><p className="mt-1 text-sm text-slate-500">{post.author} • {post.role} • {post.country}</p><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{post.description}</p><div className="mt-4 flex flex-wrap gap-2">{post.tags.map((t) => <span key={t} className="rounded-md bg-mist px-2 py-1 text-xs text-slate-600">#{t}</span>)}</div></div><div className="min-w-40 rounded-lg bg-forest-900 p-4 text-white"><p className="text-sm text-emerald-100">Verified impact</p><p className="mt-2 text-xl font-semibold">{post.impact || 'Impact pending'}</p></div></div><div className="mt-5 flex flex-wrap gap-2"><button onClick={() => toggleSave(post.id)} className="rounded-md border border-line px-3 py-2 text-sm">{saved ? 'Saved' : 'Save'}</button><button className="rounded-md border border-line px-3 py-2 text-sm">Request collaboration</button></div><div className="mt-5 space-y-2">{post.comments.map((comment) => <p key={comment.id} className="rounded-md bg-mist p-3 text-sm"><strong>{comment.author}:</strong> {comment.body}</p>)}</div><form onSubmit={(e) => { e.preventDefault(); commentOnPost(post.id, comments[post.id] || ''); setComments({ ...comments, [post.id]: '' }) }} className="mt-3 flex gap-2"><input value={comments[post.id] || ''} onChange={(e) => setComments({ ...comments, [post.id]: e.target.value })} className="min-w-0 flex-1 rounded-md border border-line px-3 py-2 text-sm" placeholder="Add a professional discussion comment" /><button className="rounded-md bg-forest-900 px-3 py-2 text-sm text-white">Comment</button></form></div></div></Card>
        })}
      </div>
    </>
  )
}

function Marketplace() {
  const { currentUser } = useAuth()
  const { marketplaceListings, storefronts, createListing, createStorefront, toggleListingSave, followSeller, reviewListing, requestListing } = usePlatform()
  const [section, setSection] = useState('All')
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState(marketplaceListings[0]?.id)
  const [draft, setDraft] = useState({
    title: '',
    listingType: 'product',
    section: 'Recycled & Upcycled Products',
    price: '',
    location: 'Global',
    image: '',
    description: '',
    materials: '',
    wasteTypes: '',
    impactScore: 70,
    carbonInsight: '',
    sustainabilityStory: '',
    reuseProcess: '',
    certifications: '',
    availability: 'Available',
  })
  const [reviewText, setReviewText] = useState('')
  const myStorefront = storefronts.find((store) => store.ownerId === currentUser.id)
  const [storeDraft, setStoreDraft] = useState({
    name: myStorefront?.name || '',
    type: myStorefront?.type || 'Creator Store',
    mission: myStorefront?.mission || '',
    bio: myStorefront?.bio || '',
    banner: myStorefront?.banner || '',
    certifications: myStorefront?.certifications?.join(', ') || '',
  })
  const filtered = marketplaceListings.filter((listing) => {
    const matchesSection = section === 'All' || listing.section === section
    const text = `${listing.title} ${listing.description} ${listing.seller} ${listing.section}`.toLowerCase()
    return matchesSection && text.includes(query.toLowerCase())
  })
  const active = marketplaceListings.find((listing) => listing.id === activeId) || filtered[0] || marketplaceListings[0]
  const savedCount = marketplaceListings.filter((listing) => listing.savedBy.includes(currentUser.id)).length
  const requestCount = marketplaceListings.reduce((sum, listing) => sum + listing.orders.filter((order) => order.userId === currentUser.id).length, 0)
  const materialsReused = marketplaceListings.reduce((sum, listing) => sum + listing.materials.length, 0)

  const submit = (event) => {
    event.preventDefault()
    if (!draft.title.trim() || !draft.description.trim()) return
    createListing({
      ...draft,
      image: draft.image || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80',
      materials: draft.materials.split(',').map((item) => item.trim()).filter(Boolean),
      wasteTypes: draft.wasteTypes.split(',').map((item) => item.trim()).filter(Boolean),
      certifications: draft.certifications.split(',').map((item) => item.trim()).filter(Boolean),
      impactScore: Number(draft.impactScore),
    })
    setDraft({ ...draft, title: '', price: '', image: '', description: '', materials: '', wasteTypes: '', carbonInsight: '', sustainabilityStory: '', reuseProcess: '', certifications: '' })
  }

  const submitStorefront = (event) => {
    event.preventDefault()
    if (!storeDraft.name.trim() || !storeDraft.mission.trim()) return
    createStorefront({
      ...storeDraft,
      banner: storeDraft.banner || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
      certifications: storeDraft.certifications.split(',').map((item) => item.trim()).filter(Boolean),
    })
  }

  return (
    <>
      <SectionHeader eyebrow="Sustainability marketplace" title="A curated circular economy marketplace">Discover upcycled products, eco-services, material exchanges, DIY kits, education resources, and collaboration opportunities built around measurable environmental value.</SectionHeader>
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Marketplace listings" value={marketplaceListings.length} detail="Curated circular economy offers" icon={ShoppingBag} />
        <Stat label="Saved listings" value={savedCount} detail="Your procurement shortlist" icon={Star} />
        <Stat label="Requests sent" value={requestCount} detail="Orders, bookings, or exchanges" icon={PackageCheck} />
        <Stat label="Material signals" value={materialsReused} detail="Reusable material types listed" icon={Recycle} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[.95fr_1.05fr]">
        <Card className="p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h3 className="font-semibold">Explore curated sections</h3>
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="rounded-md border border-line px-3 py-2 text-sm" placeholder="Search products, services, materials..." />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {['All', ...marketplaceSections].map((item) => <button key={item} onClick={() => setSection(item)} className={`rounded-md border px-3 py-2 text-sm ${section === item ? 'border-forest-700 bg-forest-50 text-forest-800' : 'border-line text-slate-600'}`}>{item}</button>)}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {marketplaceListings.length === 0 && marketplaceListingExamples.slice(0, 4).map((example) => <div key={example.id} className="rounded-lg border border-dashed border-line bg-mist p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-700">Example listing model</p><h4 className="mt-2 font-semibold">{example.title}</h4><p className="mt-2 text-sm leading-6 text-slate-600">{example.description}</p><p className="mt-3 text-xs text-slate-500">Use this as a quality reference; it is not counted as live marketplace activity.</p></div>)}
            {filtered.map((listing) => {
              const saved = listing.savedBy.includes(currentUser.id)
              return <button key={listing.id} onClick={() => setActiveId(listing.id)} className={`overflow-hidden rounded-lg border bg-white text-left transition hover:-translate-y-1 hover:shadow-soft ${active?.id === listing.id ? 'border-forest-500' : 'border-line'}`}><img src={listing.image} alt="" className="h-40 w-full object-cover" /><div className="p-4"><div className="flex items-start justify-between gap-2"><span className="rounded-full bg-forest-50 px-2 py-1 text-xs font-semibold text-forest-700">{listing.section}</span><span className="text-xs text-slate-500">{saved ? 'Saved' : listing.price}</span></div><h4 className="mt-3 font-semibold">{listing.title}</h4><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{listing.description}</p><div className="mt-3 flex items-center justify-between text-sm"><span className="text-slate-500">{listing.seller}</span><span className="font-semibold text-forest-700">{listing.impactScore}/100</span></div></div></button>
            })}
            {filtered.length === 0 && <div className="rounded-lg border border-dashed border-line p-6 text-sm text-slate-600 md:col-span-2">No listings match this filter yet. Create one to grow the circular marketplace.</div>}
          </div>
        </Card>

        {active && <Card className="overflow-hidden">
          <img src={active.image} alt="" className="h-72 w-full object-cover" />
          <div className="p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div><p className="text-sm font-semibold text-forest-700">{active.section}</p><h3 className="mt-1 text-2xl font-semibold">{active.title}</h3><p className="mt-2 text-sm text-slate-500">{active.seller} - {active.sellerRole} - {active.location}</p></div>
              <div className="rounded-lg bg-forest-900 p-4 text-white"><p className="text-sm text-emerald-100">Seller documentation score</p><p className="mt-1 text-3xl font-semibold">{active.impactScore}</p></div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">{active.description}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Insight title="Environmental insight" value={active.carbonInsight || 'Impact insight pending seller documentation.'} />
              <Insight title="Availability" value={`${active.price} - ${active.availability}`} />
              <Insight title="Sustainability story" value={active.sustainabilityStory} wide />
              <Insight title="Reuse or delivery process" value={active.reuseProcess} wide />
            </div>
            <ResultList title="Materials used" items={active.materials.length ? active.materials : ['Seller has not documented materials yet.']} />
            <ResultList title="Waste streams connected" items={active.wasteTypes.length ? active.wasteTypes : ['General circular economy listing']} />
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => toggleListingSave(active.id)} className="rounded-md bg-forest-900 px-3 py-2 text-sm font-semibold text-white">{active.savedBy.includes(currentUser.id) ? 'Saved' : 'Save listing'}</button>
              <button onClick={() => requestListing(active.id)} className="rounded-md border border-line px-3 py-2 text-sm font-semibold">Request / book</button>
              <button onClick={() => followSeller(active.id)} className="rounded-md border border-line px-3 py-2 text-sm font-semibold">Follow creator</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); reviewListing(active.id, { rating: 5, text: reviewText }); setReviewText('') }} className="mt-4 flex gap-2">
              <input value={reviewText} onChange={(e) => setReviewText(e.target.value)} className="min-w-0 flex-1 rounded-md border border-line px-3 py-2 text-sm" placeholder="Add review or procurement note" />
              <button className="rounded-md bg-forest-900 px-3 py-2 text-sm text-white">Review</button>
            </form>
            <div className="mt-3 space-y-2">{active.reviews.map((review, index) => <p key={`${review.author}-${index}`} className="rounded-md bg-mist p-3 text-sm"><strong>{review.author}:</strong> {review.text}</p>)}</div>
          </div>
        </Card>}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_.8fr]">
        <Card className="p-5 xl:col-span-2">
          <h3 className="font-semibold">Seller account and sustainability storefront</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Create a storefront before publishing listings so buyers can understand your mission, evidence, certifications, and environmental focus.</p>
          <form onSubmit={submitStorefront} className="mt-4 grid gap-3 md:grid-cols-2">
            <input value={storeDraft.name} onChange={(e) => setStoreDraft({ ...storeDraft, name: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm" placeholder="Storefront or organization name" />
            <select value={storeDraft.type} onChange={(e) => setStoreDraft({ ...storeDraft, type: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm"><option>Creator Store</option><option>Sustainability Business</option><option>Institutional Storefront</option><option>NGO Program</option><option>Service Provider</option></select>
            <textarea value={storeDraft.mission} onChange={(e) => setStoreDraft({ ...storeDraft, mission: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm" placeholder="Sustainability mission" />
            <textarea value={storeDraft.bio} onChange={(e) => setStoreDraft({ ...storeDraft, bio: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm" placeholder="Seller bio, methods, or organization background" />
            <input value={storeDraft.certifications} onChange={(e) => setStoreDraft({ ...storeDraft, certifications: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm" placeholder="Certifications, comma separated" />
            <button className="rounded-md bg-forest-900 px-4 py-3 text-sm font-semibold text-white">{myStorefront ? 'Update storefront' : 'Create seller account'}</button>
          </form>
          {myStorefront && <div className="mt-4 rounded-lg bg-forest-50 p-4"><p className="font-semibold text-forest-900">{myStorefront.name}</p><p className="mt-1 text-sm leading-6 text-slate-700">{myStorefront.mission}</p></div>}
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold">Create a sustainability listing</h3>
          {!myStorefront && <p className="mt-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800">Create a seller storefront first. Listings can still be drafted, but a storefront makes the marketplace more trustworthy.</p>}
          <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-2">
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm" placeholder="Listing title" />
            <select value={draft.section} onChange={(e) => setDraft({ ...draft, section: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm">{marketplaceSections.map((item) => <option key={item}>{item}</option>)}</select>
            <select value={draft.listingType} onChange={(e) => setDraft({ ...draft, listingType: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm"><option value="product">Product</option><option value="service">Service</option><option value="material">Material exchange</option><option value="resource">Educational resource</option><option value="collaboration">Collaboration</option></select>
            <input value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm" placeholder="Price, quote, or exchange terms" />
            <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="min-h-24 rounded-md border border-line px-3 py-3 text-sm md:col-span-2" placeholder="Describe the product, service, material, or collaboration opportunity." />
            <input value={draft.materials} onChange={(e) => setDraft({ ...draft, materials: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm" placeholder="Materials used, comma separated" />
            <input value={draft.wasteTypes} onChange={(e) => setDraft({ ...draft, wasteTypes: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm" placeholder="Waste types, comma separated" />
            <input value={draft.carbonInsight} onChange={(e) => setDraft({ ...draft, carbonInsight: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm" placeholder="Carbon or environmental insight" />
            <input value={draft.certifications} onChange={(e) => setDraft({ ...draft, certifications: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm" placeholder="Certifications, comma separated" />
            <textarea value={draft.sustainabilityStory} onChange={(e) => setDraft({ ...draft, sustainabilityStory: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm" placeholder="Sustainability story" />
            <textarea value={draft.reuseProcess} onChange={(e) => setDraft({ ...draft, reuseProcess: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm" placeholder="Reuse process, delivery method, or service workflow" />
            <button className="rounded-md bg-forest-900 px-4 py-3 text-sm font-semibold text-white md:col-span-2">Publish marketplace listing</button>
          </form>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold">Marketplace intelligence</h3>
          <div className="mt-4 space-y-3">
            {['AI recommends documenting material sources and end-of-life guidance for higher buyer trust.', 'Material exchange listings with pickup details receive faster institutional requests.', 'Service providers should include certifications and measurable audit outcomes.'].map((item) => <div key={item} className="flex gap-3 rounded-lg bg-forest-50 p-3"><Brain className="mt-1 shrink-0 text-forest-700" size={18} /><p className="text-sm leading-6 text-slate-700">{item}</p></div>)}
          </div>
          <div className="mt-5 h-64"><ResponsiveContainer><BarChart data={marketplaceSections.map((item) => ({ name: item.split(' ')[0], listings: marketplaceListings.filter((listing) => listing.section === item).length }))}><CartesianGrid strokeDasharray="3 3" stroke="#e5ece7" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="listings" fill="#0f8556" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </Card>
      </div>
    </>
  )
}

function Campaigns() {
  const { currentUser } = useAuth()
  const { liveCampaigns, createCampaign, joinCampaign } = usePlatform()
  const [draft, setDraft] = useState({ title: '', description: '', category: 'Plastic Waste', location: 'Global' })
  const submit = (event) => {
    event.preventDefault()
    if (!draft.title.trim()) return
    createCampaign(draft)
    setDraft({ title: '', description: '', category: 'Plastic Waste', location: 'Global' })
  }
  return (
    <>
      <SectionHeader eyebrow="Challenges & campaigns" title="Mobilize people around measurable environmental action">Track milestones, leaderboards, institution participation, and verified sustainability outcomes.</SectionHeader>
      <Card className="mb-6 p-5">
        <h3 className="font-semibold">Create a global campaign</h3>
        <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-4">
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm md:col-span-2" placeholder="Campaign title" />
          <input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm" placeholder="Country or global" />
          <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm">{wasteTypes.map((w) => <option key={w.name}>{w.name}</option>)}</select>
          <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm md:col-span-4" placeholder="Campaign goals, measurement plan, and participation rules" />
          <button className="rounded-md bg-forest-900 px-4 py-3 text-sm font-semibold text-white md:col-span-4">Launch campaign</button>
        </form>
      </Card>
      <div className="grid gap-4 lg:grid-cols-3">{liveCampaigns.map((campaign) => <Card key={campaign.id} className="p-5"><div className="flex items-start justify-between"><Trophy className="text-forest-700" /><span className="text-sm text-slate-500">{campaign.location}</span></div><h3 className="mt-4 font-semibold">{campaign.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{campaign.description}</p><p className="mt-3 text-sm text-slate-500">{campaign.participants} participants • {campaign.category}</p><div className="mt-5 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-forest-500" style={{ width: `${campaign.progress}%` }} /></div><button disabled={campaign.joinedBy.includes(currentUser.id)} onClick={() => joinCampaign(campaign.id)} className="mt-4 w-full rounded-md border border-line px-3 py-2 text-sm font-semibold text-forest-800 disabled:bg-forest-50">{campaign.joinedBy.includes(currentUser.id) ? 'Joined' : 'Join challenge'}</button></Card>)}</div>
      <Card className="mt-6 p-5"><h3 className="font-semibold">Participation evidence</h3><div className="mt-4 space-y-3">{liveCampaigns.filter((campaign) => campaign.participants > 0).length === 0 && <p className="text-sm leading-6 text-slate-600">Leaderboards will appear only after real users or institutions join campaigns. No participation is invented.</p>}{liveCampaigns.filter((campaign) => campaign.participants > 0).map((campaign) => <div key={campaign.id} className="flex items-center justify-between rounded-lg bg-mist p-3"><span>{campaign.title}</span><span className="font-semibold text-forest-700">{campaign.participants} participants</span></div>)}</div></Card>
    </>
  )
}

function Institution() {
  const { currentUser } = useAuth()
  const { learning, liveCampaigns, scanHistory, communityPosts } = usePlatform()
  const completedLessons = learning.reduce((sum, course) => sum + (course.completedLessonsByUser[currentUser.id]?.length || 0), 0)
  const joinedCampaigns = liveCampaigns.filter((campaign) => campaign.joinedBy.includes(currentUser.id)).length
  const scans = scanHistory.filter((scan) => scan.userId === currentUser.id).length
  const posts = communityPosts.filter((post) => post.author === currentUser.username).length
  return (
    <>
      <SectionHeader eyebrow="Institution dashboard" title={`${currentUser.role} sustainability workspace`}>Institutional reporting starts from documented learning, campaigns, scanner use, and published sustainability evidence.</SectionHeader>
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Documented lessons" value={completedLessons} detail="Completed by this account" icon={GraduationCap} />
        <Stat label="Campaigns joined" value={joinedCampaigns} detail="Participation evidence" icon={Recycle} />
        <Stat label="AI scans saved" value={scans} detail="Waste analysis records" icon={ClipboardCheck} />
        <Stat label="Published evidence" value={posts} detail="Projects or reports shared" icon={AlertTriangle} />
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card className="p-5"><h3 className="font-semibold">Waste stream planning matrix</h3><div className="mt-4 space-y-3">{wasteTypes.slice(0, 5).map((w) => <div key={w.name} className="rounded-lg border border-line p-3"><p className="font-medium">{w.name}</p><p className="text-sm leading-6 text-slate-500">{w.disposal}</p></div>)}</div></Card>
        <Card className="p-5"><h3 className="font-semibold">Recommended next actions</h3><div className="mt-4 space-y-3">{[
          completedLessons === 0 ? 'Complete a relevant learning module before generating training reports.' : 'Document how completed lessons are being applied in your setting.',
          scans === 0 ? 'Use the AI scanner to create the first waste handling record.' : 'Review saved scanner reports and connect them to a campaign or post.',
          joinedCampaigns === 0 ? 'Join or create a campaign with measurable goals and clear evidence requirements.' : 'Add campaign outcomes as evidence when results are available.',
        ].map((x) => <div key={x} className="flex gap-3 rounded-lg bg-forest-50 p-3"><CheckCircle2 className="mt-0.5 text-forest-700" size={18} /><p className="text-sm leading-6 text-slate-700">{x}</p></div>)}</div></Card>
      </div>
    </>
  )
}

function Analytics() {
  const { communityPosts, liveCampaigns, learning, scanHistory, marketplaceListings } = usePlatform()
  const lessonCompletions = learning.reduce((sum, course) => sum + Object.values(course.completedLessonsByUser).reduce((total, lessons) => total + lessons.length, 0), 0)
  const liveTrendData = [
    { month: 'Posts', awareness: communityPosts.length, reuse: 0, diversion: 0 },
    { month: 'Lessons', awareness: 0, reuse: lessonCompletions, diversion: 0 },
    { month: 'Campaigns', awareness: 0, reuse: 0, diversion: liveCampaigns.reduce((sum, campaign) => sum + campaign.joinedBy.length, 0) },
    { month: 'Scans', awareness: scanHistory.length, reuse: scanHistory.length, diversion: 0 },
    { month: 'Market', awareness: marketplaceListings.length, reuse: marketplaceListings.reduce((sum, listing) => sum + listing.orders.length, 0), diversion: marketplaceListings.reduce((sum, listing) => sum + listing.savedBy.length, 0) },
  ]
  const categoryData = wasteTypes.map((waste) => ({
    name: waste.name.replace(' Waste', ''),
    value: communityPosts.filter((post) => post.category === waste.name || post.category === waste.name.replace(' Waste', '')).length + scanHistory.filter((scan) => scan.report?.waste_category?.toLowerCase().includes(waste.name.split(' ')[0].toLowerCase())).length,
    color: waste.tone,
  })).filter((item) => item.value > 0)
  return (
    <>
      <SectionHeader eyebrow="Analytics & impact center" title="Environmental intelligence you can act on">Beautiful reporting for participation, waste category trends, institution comparisons, and AI-generated insights.</SectionHeader>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <Card className="p-5"><h3 className="font-semibold">Impact trend model</h3><div className="mt-4 h-80"><TrendChart data={liveTrendData} /></div></Card>
        <Card className="p-5"><h3 className="font-semibold">Waste category share</h3><div className="mt-4 h-80">{categoryData.length ? <ResponsiveContainer><PieChart><Pie data={categoryData} dataKey="value" innerRadius={70} outerRadius={110}>{categoryData.map((c) => <Cell key={c.name} fill={c.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer> : <div className="grid h-full place-items-center text-center text-sm text-slate-500">Category analytics will appear after posts or AI scans create real signals.</div>}</div></Card>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">{[
        communityPosts.length ? `${communityPosts.length} community contribution${communityPosts.length === 1 ? '' : 's'} available for review.` : 'Community insights will appear after members publish projects or discussions.',
        scanHistory.length ? `${scanHistory.length} AI scanner report${scanHistory.length === 1 ? '' : 's'} saved across users.` : 'Waste category analytics will improve after scanner reports are saved.',
        marketplaceListings.some((listing) => listing.orders.length) ? 'Marketplace requests are creating procurement and collaboration signals.' : 'Marketplace demand signals will appear after users request products, services, or material exchanges.',
      ].map((x) => <Card key={x} className="p-5"><Brain className="text-forest-700" /><p className="mt-4 text-sm leading-6 text-slate-700">{x}</p></Card>)}</div>
    </>
  )
}

function Profile() {
  const { currentUser, updateProfile } = useAuth()
  const { communityPosts, liveCampaigns, learning } = usePlatform()
  const [form, setForm] = useState({ username: currentUser.username, email: currentUser.email, country: currentUser.country || '', bio: currentUser.bio || '' })
  const saved = communityPosts.filter((post) => post.savedBy.includes(currentUser.id)).length
  const joined = liveCampaigns.filter((campaign) => campaign.joinedBy.includes(currentUser.id)).length
  const completed = learning.reduce((sum, course) => sum + (course.completedLessonsByUser[currentUser.id]?.length || 0), 0)
  return (
    <>
      <SectionHeader eyebrow="Profile" title={currentUser.username}>Contribution history, badges, learning progress, campaigns, and innovations shared.</SectionHeader>
      <div className="grid gap-4 lg:grid-cols-[.7fr_1.3fr]">
        <Card className="p-6 text-center"><div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-forest-900 text-3xl font-semibold text-white">{currentUser.username.slice(0, 2).toUpperCase()}</div><h3 className="mt-4 text-xl font-semibold">{currentUser.role}</h3><p className="text-sm text-slate-500">{currentUser.country || 'Global'}</p><div className="mt-6 grid grid-cols-3 gap-2 text-center"><div><p className="font-semibold">{currentUser.points}</p><p className="text-xs text-slate-500">Score</p></div><div><p className="font-semibold">{joined}</p><p className="text-xs text-slate-500">Campaigns</p></div><div><p className="font-semibold">{saved}</p><p className="text-xs text-slate-500">Saved</p></div></div></Card>
        <Card className="p-5"><h3 className="font-semibold">Edit profile</h3><form onSubmit={(e) => { e.preventDefault(); updateProfile(form) }} className="mt-4 grid gap-3 md:grid-cols-2"><input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm" /><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm" /><input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm md:col-span-2" /><textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="rounded-md border border-line px-3 py-3 text-sm md:col-span-2" /><button className="rounded-md bg-forest-900 px-4 py-3 text-sm font-semibold text-white md:col-span-2">Save profile</button></form></Card>
        <Card className="p-5 lg:col-span-2"><h3 className="font-semibold">Badges and progress</h3><div className="mt-4 grid gap-3 md:grid-cols-3">{[...(currentUser.badges || []), completed ? `${completed} Course Finisher` : 'Learning Starter'].map((b) => <div key={b} className="rounded-lg bg-mist p-4"><Flame className="text-forest-700" /><p className="mt-3 font-medium">{b}</p><p className="text-sm text-slate-500">Verified contribution badge</p></div>)}</div></Card>
      </div>
    </>
  )
}

function Admin() {
  const { currentUser } = useAuth()
  const { users } = useAuth()
  const { communityPosts, liveCampaigns, marketplaceListings, learning, storefronts, scanHistory } = usePlatform()
  if (currentUser.role !== 'Admin') {
    return <Card className="p-8"><ShieldCheck className="text-forest-700" /><h2 className="mt-4 text-2xl font-semibold">Admin access required</h2><p className="mt-2 text-slate-600">This operations console is protected for CircularHub administrators.</p></Card>
  }
  return (
    <>
      <SectionHeader eyebrow="Admin & moderation" title="Operational control for trust, safety, and environmental data quality">Moderate content, verify institutions, monitor AI systems, and manage learning/campaign operations.</SectionHeader>
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Users" value={users.length} detail="Registered local accounts" icon={ShieldCheck} />
        <Stat label="Seller storefronts" value={storefronts.length} detail="Creator or service profiles" icon={Building2} />
        <Stat label="AI scan records" value={scanHistory.length} detail="Saved scanner reports" icon={Brain} />
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card className="p-5"><h3 className="font-semibold">Sustainability operations queue</h3><div className="mt-4 space-y-3">{[
          ...communityPosts.filter((post) => post.category.includes('Medical') || post.category.includes('Chemical')).map((post) => `Review safety-sensitive post: ${post.title}`),
          ...marketplaceListings.filter((listing) => listing.certifications.length > 0).map((listing) => `Verify marketplace certification claim: ${listing.title}`),
          ...liveCampaigns.filter((campaign) => campaign.participants > 0).map((campaign) => `Review campaign evidence plan: ${campaign.title}`),
        ].length === 0 && <p className="text-sm leading-6 text-slate-600">No operational review items yet. Queues populate from real posts, marketplace claims, and campaign activity.</p>}{[
          ...communityPosts.filter((post) => post.category.includes('Medical') || post.category.includes('Chemical')).map((post) => `Review safety-sensitive post: ${post.title}`),
          ...marketplaceListings.filter((listing) => listing.certifications.length > 0).map((listing) => `Verify marketplace certification claim: ${listing.title}`),
          ...liveCampaigns.filter((campaign) => campaign.participants > 0).map((campaign) => `Review campaign evidence plan: ${campaign.title}`),
        ].map((x) => <div key={x} className="flex items-center justify-between rounded-lg border border-line p-3"><span>{x}</span><button className="rounded-md bg-forest-900 px-3 py-2 text-sm text-white">Review</button></div>)}</div></Card>
        <Card className="p-5"><h3 className="font-semibold">Admin control hub</h3><div className="mt-4 grid gap-3 md:grid-cols-2">{[
          ['Users', 'Manage roles, onboarding, and trust signals'],
          ['Courses', `${learning.length} course catalogs and certifications`],
          ['Marketplace', `${marketplaceListings.length} listings, sellers, services`],
          ['AI Systems', 'Scanner, assistant, scoring, safety logs'],
          ['Waste Database', 'Categories, hazards, disposal guidance'],
          ['Moderation', 'Posts, reviews, claims, material exchanges'],
        ].map(([title, text]) => <div key={title} className="rounded-lg bg-mist p-4"><p className="font-semibold">{title}</p><p className="mt-1 text-sm leading-6 text-slate-600">{text}</p></div>)}</div></Card>
      </div>
    </>
  )
}

function AssistantPanel() {
  const [prompt, setPrompt] = useState('How can schools reduce plastic waste?')
  const answer = classifyWaste(prompt)
  return (
    <Card className="p-5">
      <h3 className="flex items-center gap-2 font-semibold"><MessageSquareText size={18} /> AI sustainability assistant</h3>
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="mt-4 h-24 w-full resize-none rounded-md border border-line p-3 text-sm outline-none focus:border-forest-500" />
      <div className="mt-4 rounded-lg bg-mist p-4">
        <p className="text-sm font-semibold text-forest-700">Structured guidance</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{answer.disposal}</p>
        <p className="mt-3 text-sm"><strong>Reuse ideas:</strong> {answer.reuse.join(', ')}</p>
      </div>
    </Card>
  )
}

function CampaignCard({ title, desc, progress, meta }) {
  return <Card className="p-5"><div className="flex items-start justify-between"><Trophy className="text-forest-700" /><span className="text-sm text-slate-500">{meta}</span></div><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p><div className="mt-5 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-forest-500" style={{ width: `${progress}%` }} /></div><p className="mt-2 text-sm font-medium text-forest-700">{progress}% milestone completion</p></Card>
}

function TrendChart({ data = trendData }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5ece7" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="awareness" stroke="#0f8556" strokeWidth={3} />
        <Line type="monotone" dataKey="reuse" stroke="#3b82f6" strokeWidth={3} />
        <Line type="monotone" dataKey="diversion" stroke="#84a63d" strokeWidth={3} />
      </RLineChart>
    </ResponsiveContainer>
  )
}

function AuthPage() {
  const { currentUser, token, signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState({ username: '', email: '', password: '', country: 'Global' })
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle')
  const navigate = useNavigate()

  if (currentUser && token) return <Navigate to="/app" replace />

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setStatus('submitting')
    try {
      const user = mode === 'signin'
        ? await signIn({ username: form.username, password: form.password })
        : await signUp({
            username: form.username,
            email: form.email,
            password: form.password,
            country: form.country,
          })
      navigate(user.onboardingComplete ? '/app' : '/onboarding')
    } catch (err) {
      setError(err.message)
    } finally {
      setStatus('idle')
    }
  }

  return (
    <div className="grid min-h-screen bg-forest-950 text-white lg:grid-cols-[1fr_.9fr]">
      <section className="relative overflow-hidden p-8 md:p-14">
        <div className="absolute inset-0 environmental-grid opacity-40" />
        <div className="relative z-10 max-w-2xl">
          <NavLink to="/" className="flex items-center gap-3 text-lg font-semibold"><span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-forest-900"><Leaf /></span>CircularHub</NavLink>
          <h1 className="mt-20 text-5xl font-semibold leading-tight md:text-6xl">Enter the CircularHub workspace.</h1>
          <p className="mt-6 text-lg leading-8 text-emerald-50">Use a real account to access scanner tools, campaigns, marketplace workflows, and protected community features.</p>
        </div>
      </section>
      <section className="grid place-items-center bg-white p-5 text-ink">
        <Card className="w-full max-w-md p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-forest-700">{mode === 'signin' ? 'Sign in' : 'Create account'}</p>
          <h2 className="mt-3 text-2xl font-semibold">{mode === 'signin' ? 'Welcome back' : 'Join CircularHub'}</h2>
          <form onSubmit={submit} className="mt-6 space-y-3">
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full rounded-md border border-line px-3 py-3 text-sm" placeholder="Username or email" required />
            {mode === 'signup' && <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-md border border-line px-3 py-3 text-sm" placeholder="Email" required />}
            {mode === 'signup' && <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full rounded-md border border-line px-3 py-3 text-sm" placeholder="Country" />}
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-md border border-line px-3 py-3 text-sm" placeholder="Password" required />
            {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button disabled={status === 'submitting'} className="w-full rounded-md bg-forest-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{status === 'submitting' ? 'Working...' : mode === 'signin' ? 'Sign in' : 'Create account'}</button>
          </form>
          <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }} className="mt-4 w-full rounded-md border border-line px-4 py-3 text-sm font-semibold text-slate-700">
            {mode === 'signin' ? 'Create a new account' : 'Use an existing account'}
          </button>
        </Card>
      </section>
    </div>
  )
}

function OnboardingPage() {
  const { currentUser, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    interests: currentUser?.interests || [],
    goals: currentUser?.goals || [],
    bio: currentUser?.bio || '',
  })
  const interests = ['Plastic reduction', 'E-waste', 'Composting', 'Medical waste safety', 'Industrial sustainability', 'Circular economy', 'Climate impact', 'Community campaigns']
  const goals = ['Learn responsible disposal', 'Build a campaign', 'Train my institution', 'Publish reuse projects', 'Track impact', 'Use AI scanner']
  const toggle = (key, value) => {
    setForm((current) => {
      const exists = current[key].includes(value)
      return { ...current, [key]: exists ? current[key].filter((item) => item !== value) : [...current[key], value] }
    })
  }
  const submit = (event) => {
    event.preventDefault()
    updateProfile({ ...form, onboardingComplete: true })
    navigate('/app')
  }
  if (!currentUser) return <Navigate to="/auth" replace />
  return (
    <div className="min-h-screen bg-mist p-5">
      <div className="mx-auto max-w-4xl py-10">
        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest-700">Onboarding</p>
          <h1 className="mt-3 text-3xl font-semibold">Set up your sustainability workspace</h1>
          <form onSubmit={submit} className="mt-6 space-y-6">
            <ChoiceGrid title="Sustainability interests" values={interests} selected={form.interests} onToggle={(value) => toggle('interests', value)} />
            <ChoiceGrid title="Learning goals" values={goals} selected={form.goals} onToggle={(value) => toggle('goals', value)} />
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="min-h-28 w-full rounded-md border border-line px-3 py-3 text-sm" placeholder="Tell the community what you want to improve." />
            <button className="w-full rounded-md bg-forest-900 px-4 py-3 text-sm font-semibold text-white">Finish onboarding</button>
          </form>
        </Card>
      </div>
    </div>
  )
}

function ChoiceGrid({ title, values, selected, onToggle }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {values.map((value) => <button type="button" key={value} onClick={() => onToggle(value)} className={`rounded-md border px-3 py-2 text-sm ${selected.includes(value) ? 'border-forest-700 bg-forest-50 text-forest-800' : 'border-line text-slate-600'}`}>{value}</button>)}
      </div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { currentUser, token } = useAuth()
  if (!currentUser || !token) return <Navigate to="/auth" replace />
  if (!currentUser.onboardingComplete && window.location.pathname !== '/onboarding') return <Navigate to="/onboarding" replace />
  return children
}

function Root() {
  return (
    <AuthProvider>
      <PlatformProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
            <Route path="/app/*" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </PlatformProvider>
    </AuthProvider>
  )
}

createRoot(document.getElementById('root')).render(<Root />)
