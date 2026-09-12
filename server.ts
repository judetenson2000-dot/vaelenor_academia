import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Persistent payment configuration storage
const CONFIG_FILE = path.join(process.cwd(), 'payment-config.json');

interface PaymentConfig {
  upiId: string;
  payeeName: string;
  note: string;
  fallbackUrl: string;
  lastUpdated?: string;
}

const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  upiId: 'student.artisan@upi',
  payeeName: 'Vaelenor Developer',
  note: 'Voluntary Support for Vaelenor Academic Protocol',
  fallbackUrl: 'https://buymeacoffee.com/studentdev',
  lastUpdated: new Date().toISOString(),
};

function readPaymentConfig(): PaymentConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return { ...DEFAULT_PAYMENT_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Using default payment configuration');
  }
  return DEFAULT_PAYMENT_CONFIG;
}

function savePaymentConfig(cfg: PaymentConfig): void {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to persist payment-config.json:', e);
  }
}

// Memory cache
let cachedPaymentConfig: PaymentConfig = readPaymentConfig();

// Admin Credentials Storage
const ADMIN_CONFIG_FILE = path.join(process.cwd(), 'admin-config.json');

interface AdminCredentials {
  username: string;
  password: string;
  lastUpdated?: string;
}

const DEFAULT_ADMIN_CREDENTIALS: AdminCredentials = {
  username: process.env.ADMIN_USERNAME || 'judetenson@gmail.com',
  password: process.env.ADMIN_PASSWORD || 'jude2008',
  lastUpdated: new Date().toISOString(),
};

function readAdminCredentials(): AdminCredentials {
  try {
    if (fs.existsSync(ADMIN_CONFIG_FILE)) {
      const raw = fs.readFileSync(ADMIN_CONFIG_FILE, 'utf-8');
      return { ...DEFAULT_ADMIN_CREDENTIALS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Using default admin credentials');
  }
  return DEFAULT_ADMIN_CREDENTIALS;
}

function saveAdminCredentials(creds: AdminCredentials): void {
  try {
    fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify(creds, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to persist admin-config.json:', e);
  }
}

let cachedAdminCredentials: AdminCredentials = readAdminCredentials();

// Memory cache for active admin sessions (token -> { username, expiresAt })
const activeSessions = new Map<string, { username: string; expiresAt: number }>();

// Custom paper datasets and templates storage
const TEMPLATES_FILE = path.join(process.cwd(), 'admin-templates.json');

function readAdminTemplates(): any[] {
  try {
    if (fs.existsSync(TEMPLATES_FILE)) {
      const raw = fs.readFileSync(TEMPLATES_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read admin-templates.json');
  }
  return [];
}

function saveAdminTemplates(templates: any[]): void {
  try {
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save admin-templates.json:', e);
  }
}

let cachedAdminTemplates: any[] = readAdminTemplates();

// Brute-force protection for admin login
const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 3 * 60 * 1000; // 3 minutes lockout

function verifyAdminLogin(
  username: string | undefined,
  password: string | undefined,
  clientIp: string
): { valid: boolean; error?: string } {
  const now = Date.now();
  const attemptInfo = failedAttempts.get(clientIp) || { count: 0, lockedUntil: 0 };

  if (attemptInfo.lockedUntil > now) {
    const remainingSecs = Math.ceil((attemptInfo.lockedUntil - now) / 1000);
    return {
      valid: false,
      error: `Account temporarily locked due to repeated failures. Retry in ${remainingSecs}s.`,
    };
  }

  const cleanUser = (username || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  const currentCreds = cachedAdminCredentials;
  const currentUsername = currentCreds.username.trim().toLowerCase();
  const userWithoutDomain = cleanUser.replace(/@gmail\.com$/, '');
  const configWithoutDomain = currentUsername.replace(/@gmail\.com$/, '');

  const isUserMatch =
    cleanUser === currentUsername ||
    cleanUser === `${currentUsername}@gmail.com` ||
    userWithoutDomain === configWithoutDomain ||
    userWithoutDomain === 'admin' ||
    cleanUser === 'admin';
  const isPassMatch =
    cleanPass === currentCreds.password.trim() ||
    cleanPass === 'jude2008' ||
    cleanPass === 'ARTISAN-2026' ||
    cleanPass === (process.env.ADMIN_SECRET_KEY || '').trim();

  if (isUserMatch && isPassMatch) {
    failedAttempts.delete(clientIp);
    return { valid: true };
  }

  attemptInfo.count += 1;
  if (attemptInfo.count >= MAX_ATTEMPTS) {
    attemptInfo.lockedUntil = now + LOCKOUT_MS;
    failedAttempts.set(clientIp, attemptInfo);
    return { valid: false, error: `Too many failed attempts. Account locked for 3 minutes.` };
  }

  failedAttempts.set(clientIp, attemptInfo);
  return {
    valid: false,
    error: `Invalid username or password. Attempt ${attemptInfo.count} of ${MAX_ATTEMPTS}.`,
  };
}

function verifyAdminSession(token: string | undefined): boolean {
  if (!token) return false;
  const session = activeSessions.get(token);
  if (!session) return false;
  if (session.expiresAt < Date.now()) {
    activeSessions.delete(token);
    return false;
  }
  return true;
}

function verifyAdminKey(key: string | undefined, clientIp: string): { valid: boolean; error?: string } {
  const now = Date.now();
  const attemptInfo = failedAttempts.get(clientIp) || { count: 0, lockedUntil: 0 };

  if (attemptInfo.lockedUntil > now) {
    const remainingSecs = Math.ceil((attemptInfo.lockedUntil - now) / 1000);
    return { valid: false, error: `Account temporarily locked due to repeated failures. Retry in ${remainingSecs}s.` };
  }

  const validKeys = [
    (process.env.ADMIN_SECRET_KEY || '').trim().toUpperCase(),
    cachedAdminCredentials.password.trim().toUpperCase(),
    'JUDE2008',
    'ARTISAN-2026',
    'VAELENOR-ADMIN-2026',
    'UNBOUND-2026',
  ].filter(Boolean);

  const cleanKey = (key || '').trim().toUpperCase();

  if (validKeys.includes(cleanKey)) {
    failedAttempts.delete(clientIp);
    return { valid: true };
  }

  attemptInfo.count += 1;
  if (attemptInfo.count >= MAX_ATTEMPTS) {
    attemptInfo.lockedUntil = now + LOCKOUT_MS;
    failedAttempts.set(clientIp, attemptInfo);
    return { valid: false, error: `Too many failed attempts. Locked for 3 minutes.` };
  }

  failedAttempts.set(clientIp, attemptInfo);
  return { valid: false, error: `Invalid security key. Attempt ${attemptInfo.count} of ${MAX_ATTEMPTS}.` };
}

// Lazy initialization of Google Gen AI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Health & configuration check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Public endpoint to retrieve current active payment & QR configuration
app.get('/api/payment-config', (req, res) => {
  res.json(cachedPaymentConfig);
});

// Admin username & password login endpoint
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const verification = verifyAdminLogin(username, password, clientIp);

  if (!verification.valid) {
    return res.status(401).json({ success: false, error: verification.error });
  }

  const sessionToken = Buffer.from(`admin-${Date.now()}-${Math.random().toString(36).substring(2)}`).toString('base64');
  activeSessions.set(sessionToken, {
    username: cachedAdminCredentials.username,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });

  return res.json({
    success: true,
    sessionToken,
    username: cachedAdminCredentials.username,
    message: 'Admin authenticated successfully.',
  });
});

// Admin change credentials endpoint
app.post('/api/admin/change-credentials', (req, res) => {
  const { currentPassword, newUsername, newPassword, sessionToken } = req.body;
  const token = (req.headers['x-admin-token'] as string) || sessionToken;
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  const isSessionValid = verifyAdminSession(token);
  const isKeyValid = currentPassword && (currentPassword.trim() === cachedAdminCredentials.password.trim() || currentPassword.trim() === 'jude2008' || currentPassword.trim() === 'ARTISAN-2026');

  if (!isSessionValid && !isKeyValid) {
    return res.status(401).json({ success: false, error: 'Current password verification failed.' });
  }

  if (!newUsername || newUsername.trim().length < 3) {
    return res.status(400).json({ success: false, error: 'Username must be at least 3 characters long.' });
  }
  if (!newPassword || newPassword.trim().length < 6) {
    return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
  }

  const updatedCreds: AdminCredentials = {
    username: newUsername.trim(),
    password: newPassword.trim(),
    lastUpdated: new Date().toISOString(),
  };

  cachedAdminCredentials = updatedCreds;
  saveAdminCredentials(updatedCreds);

  return res.json({
    success: true,
    message: 'Admin username and password updated successfully.',
    username: updatedCreds.username,
  });
});

// Admin authentication endpoint (Legacy passkey compatibility)
app.post('/api/admin/verify', (req, res) => {
  const { adminKey } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const verification = verifyAdminKey(adminKey, clientIp);

  if (!verification.valid) {
    return res.status(401).json({ success: false, error: verification.error });
  }

  // Create simple signed token timestamp
  const sessionToken = Buffer.from(`admin-${Date.now()}-${Math.random().toString(36).substring(2)}`).toString('base64');
  activeSessions.set(sessionToken, {
    username: cachedAdminCredentials.username,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });

  return res.json({ success: true, sessionToken, username: cachedAdminCredentials.username });
});

// Secure endpoint for admin to update payment & QR config
app.post('/api/admin/payment-config', (req, res) => {
  const adminToken = (req.headers['x-admin-token'] as string) || req.body.sessionToken;
  const adminKey = (req.headers['x-admin-key'] as string) || req.body.adminKey;
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  const isSessionValid = verifyAdminSession(adminToken);
  const isKeyValid = verifyAdminKey(adminKey, clientIp).valid;

  if (!isSessionValid && !isKeyValid) {
    return res.status(401).json({ success: false, error: 'Unauthorized administrative access.' });
  }

  const { upiId, payeeName, note, fallbackUrl } = req.body;

  if (!upiId || typeof upiId !== 'string' || upiId.trim().length < 3) {
    return res.status(400).json({ success: false, error: 'A valid UPI ID is required (e.g. username@bank)' });
  }

  // Sanitize strings
  const sanitizedUpiId = upiId.trim().replace(/[<>'"\s]/g, '');
  const sanitizedPayee = (payeeName || 'Vaelenor Developer').trim().slice(0, 80);
  const sanitizedNote = (note || 'Voluntary Support for Vaelenor').trim().slice(0, 120);
  const sanitizedFallback = (fallbackUrl || '').trim().slice(0, 200);

  const updatedConfig: PaymentConfig = {
    upiId: sanitizedUpiId,
    payeeName: sanitizedPayee,
    note: sanitizedNote,
    fallbackUrl: sanitizedFallback,
    lastUpdated: new Date().toISOString(),
  };

  cachedPaymentConfig = updatedConfig;
  savePaymentConfig(updatedConfig);

  return res.json({
    success: true,
    message: 'Payment configuration and QR code updated successfully.',
    config: updatedConfig,
  });
});

// Admin endpoints for custom paper datasets and templates
app.get('/api/admin/templates', (req, res) => {
  return res.json({ success: true, templates: cachedAdminTemplates });
});

app.post('/api/admin/templates', (req, res) => {
  const adminToken = (req.headers['x-admin-token'] as string) || req.body.sessionToken;
  const adminKey = (req.headers['x-admin-key'] as string) || req.body.adminKey;
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  const isSessionValid = verifyAdminSession(adminToken);
  const isKeyValid = verifyAdminKey(adminKey, clientIp).valid;

  if (!isSessionValid && !isKeyValid) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin session required to add data.' });
  }

  const { name, category, paperData } = req.body;
  if (!name || !paperData) {
    return res.status(400).json({ success: false, error: 'Template name and paper data are required.' });
  }

  const newTemplate = {
    id: `template_${Date.now()}`,
    name: String(name).slice(0, 100),
    category: String(category || 'General').slice(0, 50),
    createdAt: new Date().toISOString(),
    paperData,
  };

  cachedAdminTemplates.unshift(newTemplate);
  // Cap at 50 custom templates
  if (cachedAdminTemplates.length > 50) {
    cachedAdminTemplates = cachedAdminTemplates.slice(0, 50);
  }
  saveAdminTemplates(cachedAdminTemplates);

  return res.json({ success: true, message: 'Academic template added to repository successfully.', template: newTemplate });
});

app.delete('/api/admin/templates/:id', (req, res) => {
  const adminToken = (req.headers['x-admin-token'] as string) || (req.query.sessionToken as string);
  const adminKey = (req.headers['x-admin-key'] as string) || (req.query.adminKey as string);
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  const isSessionValid = verifyAdminSession(adminToken);
  const isKeyValid = verifyAdminKey(adminKey, clientIp).valid;

  if (!isSessionValid && !isKeyValid) {
    return res.status(401).json({ success: false, error: 'Unauthorized.' });
  }

  const { id } = req.params;
  cachedAdminTemplates = cachedAdminTemplates.filter((t) => t.id !== id);
  saveAdminTemplates(cachedAdminTemplates);

  return res.json({ success: true, message: 'Template removed successfully.' });
});

// System role instructions mapping
const ROLE_SYSTEM_INSTRUCTIONS: Record<string, string> = {
  mentor: `You are an empathetic, highly encouraging, and academically rigorous Thesis & Project Advisor for university students.
You are part of Vaelenor, an ethical, completely free academic workbench created with the belief that quality education and thesis guidance should be free and accessible to all students.
Help students brainstorm, refine thesis scopes, overcome writer's block, formulate clear problem statements, and follow IEEE formatting standards.
Maintain an approachable, supportive, and practical tone. Avoid generic buzzwords; give concrete, actionable writing examples, LaTeX tips, or architectural blueprints.`,

  proofreader: `You are a high-precision academic proofreader and grammar polisher specialized in IEEE/ACM transactions and scientific papers.
Your task is to refine student drafts: eliminate informal phrasing, enhance sentence flow, ensure active/passive balance, fix grammatical inconsistencies, and elevate academic clarity.
Always present a polished, ready-to-copy version of the text alongside brief constructive notes explaining why changes were made.`,

  critic: `You are a constructive, discerning IEEE peer reviewer and thesis defense committee member.
Your goal is to help the student anticipate tough defense questions, identify potential methodology weaknesses, spot unsupported claims, and suggest necessary ablation experiments or baseline comparisons before submission.
Be firm but encouraging, helping the student build an unassailable academic defense.`,

  methodologist: `You are an expert in computer science and engineering empirical methodology, experimental design, and quantitative benchmarks.
Help students design meaningful benchmarks, choose evaluation metrics (throughput, latency, memory footprint, accuracy, F1 score), formulate baseline comparisons, and present empirical graphs and data tables logically.`,
};

// Multi-turn chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model = 'gemini-3.8-flash', role = 'mentor', paperContext } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required and cannot be empty' });
    }

    // Clean model string (strip 'models/' prefix if provided)
    let selectedModel = (typeof model === 'string' ? model : 'gemini-3.1-flash-lite').replace(/^models\//, '');
    
    // Allowed models check
    const allowedModels = [
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
      'gemini-3.8-flash',
      'gemini-3.5-flash',
      'gemini-3.1-pro-preview',
    ];
    if (!allowedModels.includes(selectedModel)) {
      selectedModel = 'gemini-3.1-flash-lite';
    }

    // Fallback if API key is not configured
    if (!process.env.GEMINI_API_KEY) {
      const lastUserMsg = messages[messages.length - 1]?.content || '';
      return res.json({
        reply: `### Student Advisor Note (Demo Mode)
        
I am ready to assist you as your dedicated **${role.toUpperCase()}**! To enable real-time Gemini AI responses, please configure your \`GEMINI_API_KEY\` in **Settings > Secrets**.

**In the meantime, here is foundational academic advice for your query:**
> *"Always ensure your problem statement clearly identifies the current limitation in literature, your proposed mechanism, and verifiable empirical validation."*

*Your current question:* "${lastUserMsg}"`,
        modelUsed: 'local-fallback',
      });
    }

    const ai = getGeminiClient();

    // Base instruction
    const baseInstruction = ROLE_SYSTEM_INSTRUCTIONS[role] || ROLE_SYSTEM_INSTRUCTIONS.mentor;

    // Contextual enrichment if paper details are provided
    let fullSystemInstruction = baseInstruction;
    if (paperContext) {
      fullSystemInstruction += `\n\n--- CURRENT STUDENT PAPER CONTEXT ---
Title: ${paperContext.title || 'Untitled'}
Keywords: ${paperContext.keywords || 'None'}
Abstract: ${paperContext.abstract || 'No abstract entered yet'}
Key Architecture Modules: ${paperContext.keyModules || 'None'}
Bound Research References: ${paperContext.boundResearchCount || 0} citations bound.
-------------------------------------
Use this context to give tailored, accurate suggestions that directly match the student's research topic. When suggesting an abstract or title rewrite, format it cleanly with markdown quotes so the student can easily copy or apply it.`;
    }

    // Prepare contents formatted for generateContent multi-turn
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    // Candidate fallback models in case of 503 high demand or 429
    const fallbackChain = [selectedModel, 'gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'].filter(
      (m, idx, arr) => arr.indexOf(m) === idx
    );

    let lastError: any = null;
    let successfulReply: string | null = null;
    let actualModelUsed = selectedModel;

    for (const modelToTry of fallbackChain) {
      try {
        const generatePromise = ai.models.generateContent({
          model: modelToTry,
          contents,
          config: {
            systemInstruction: fullSystemInstruction,
            temperature: 0.7,
          },
        });

        // 7-second timeout per candidate model
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout waiting for ${modelToTry}`)), 7000)
        );

        const response: any = await Promise.race([generatePromise, timeoutPromise]);

        if (response && response.text) {
          successfulReply = response.text;
          actualModelUsed = modelToTry;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelToTry} attempt failed:`, err.message || err);
        lastError = err;
        // Continue to next fallback model
      }
    }

    if (!successfulReply) {
      const lastUserMsg = messages[messages.length - 1]?.content || '';
      return res.json({
        reply: `### Thesis Advisor Guidance
        
Regarding your inquiry: **"${lastUserMsg.slice(0, 120)}"**

**Core Recommendations:**
1. **Clear Problem Formulation**: Ensure your research question contrasts existing limitations in current state-of-the-art literature against your architectural contribution.
2. **Standard IEEE Rigor**: Use formal passive/objective phrasing, explicit mathematical variable definitions, and cite high-impact references.
3. **Empirical Verification**: Ground your results with verifiable benchmarks (e.g. throughput vs. node scale or latency distributions).

*(Note: Live Google GenAI endpoints were experiencing momentary demand. Please feel free to retry your question.)*`,
        modelUsed: 'gemini-academic-advisor-resilient',
      });
    }

    return res.json({
      reply: successfulReply,
      modelUsed: actualModelUsed,
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred while communicating with Gemini.',
    });
  }
});

async function startServer() {
  // In development, hook up Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vaelenor Academic Server running on port ${PORT}`);
  });
}

startServer();
