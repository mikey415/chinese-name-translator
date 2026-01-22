# Chinese Name to English Name Translator - Requirements Document

## 1. Project Overview
A web application that converts Chinese names to suitable English names using AI LLM models. Users input a Chinese name and receive AI-generated English name suggestions with explanations.

---

## 2. Functional Requirements

### 2.1 User Interface Requirements
- **Input Form**
  - Text input field for Chinese name (required)
  - Submit button to process the name
  - Clear/Reset button to start over
  - Input validation (non-empty, reasonable length)

- **Output Display**
  - Display generated English name(s)
  - Show explanation/reasoning from the AI model
  - Allow user to copy the result
  - Option to request alternative names

- **User Experience**
  - Loading indicator while processing
  - Error messages for failed requests
  - Responsive design (mobile and desktop)
  - Optional: History of recent translations (session-based or persistent)

### 2.2 Backend Requirements
- **API Endpoints**
  - `POST /api/translate` - Main endpoint to translate Chinese name
    - Input: `{ chineseName: string }`
    - Output: `{ englishName: string, explanation: string, alternatives?: string[] }`
  - `GET /api/health` - Health check endpoint
  - `GET/POST /api/prompt` - Retrieve/update the translation prompt (admin feature)

- **LLM Integration**
  - Call configured LLM model with Chinese name
  - Handle API timeouts and errors gracefully
  - Log requests for monitoring
  - Respect rate limits and quotas

- **Prompt Management**
  - Store translation prompt in configuration file or database
  - Allow modification of prompt without code changes
  - Support prompt versioning/history
  - Default prompt provided

### 2.3 Configuration Requirements
- **Customizable Prompt Template**
  - Default: A well-crafted prompt for English name generation
  - User-modifiable (through admin interface or config file)
  - Supports variables like `{chineseName}`, `{culturalContext}`, etc.
  - Example default prompt:
    ```
    You are an expert in cross-cultural naming. A user has provided you with a Chinese name: {chineseName}
    
    Generate 3 suitable English names that:
    1. Maintain cultural meaning or phonetic similarity when possible
    2. Sound natural in English
    3. Are easy to pronounce
    
    For each name, provide a brief explanation of why it's suitable.
    Format your response as JSON with fields: englishName, explanation, alternatives
    ```

- **LLM Provider Configuration**
  - API Key/Token (stored securely in environment variables)
  - Model selection (e.g., GPT-4, Claude, etc.)
  - Temperature/creativity settings
  - Max tokens
  - Timeout settings

---

## 3. Non-Functional Requirements

### 3.1 Performance
- Response time: < 5 seconds for LLM call
- Frontend loading: < 2 seconds
- Support for concurrent requests (at least 10 simultaneous users)

### 3.2 Reliability
- Graceful degradation on LLM API failures
- Fallback response or error message to user
- Automatic retry logic (configurable)

### 3.3 Security
- Secure storage of API keys (environment variables or secrets manager)
- Input sanitization to prevent injection attacks
- CORS configuration for cross-origin requests
- Rate limiting to prevent abuse
- No sensitive data logging

### 3.4 Maintainability
- Clean code structure and comments
- Configuration management (separate from code)
- Logging for debugging and monitoring
- Clear error messages

---

## 4. Technology Stack Options

### Option A: Modern Full-Stack (Recommended for Learning)
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: Optional (SQLite for local or PostgreSQL for production)
- **LLM**: OpenAI API (GPT-4) or Claude API
- **Deployment**: Vercel (frontend) + Railway/Heroku (backend)

**Pros**: Modern, easy to learn, good ecosystem
**Cons**: Requires Node.js knowledge

### Option B: Simple Full-Stack (Minimal Setup)
- **Frontend**: Plain HTML/CSS/JavaScript
- **Backend**: Python + Flask/FastAPI
- **LLM**: OpenAI API or Anthropic Claude
- **Deployment**: Replit or local server

**Pros**: Simple, quick to build, great for prototyping
**Cons**: Less scalable

### Option C: Serverless/Lightweight
- **Frontend**: React/Vue + Vite
- **Backend**: AWS Lambda + API Gateway or Google Cloud Functions
- **Database**: Cloud Firestore or DynamoDB
- **LLM**: OpenAI API or Claude API
- **Deployment**: Vercel + AWS/GCP

**Pros**: Pay-per-use, highly scalable, no server management
**Cons**: Complexity, potential cold start issues

### Option D: Full-Stack with Database
- **Frontend**: Next.js (React) + TypeScript + Tailwind
- **Backend**: Next.js API Routes (same codebase)
- **Database**: PostgreSQL + Prisma ORM
- **LLM**: OpenAI API or Claude API
- **Deployment**: Vercel

**Pros**: Single codebase, built-in API routes, easy deployment
**Cons**: Learning curve for Prisma/Next.js

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              React/HTML Frontend                       │   │
│  │  - Input form for Chinese name                         │   │
│  │  - Display results                                     │   │
│  │  - Error/loading states                               │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTP/HTTPS
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                   Backend Server                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Express/FastAPI Server                    │   │
│  │  - POST /api/translate endpoint                        │   │
│  │  - Request validation                                 │   │
│  │  - Error handling                                     │   │
│  │  - Logging                                            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Configuration & Prompt Manager              │   │
│  │  - Load customizable prompt                            │   │
│  │  - Store LLM settings                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬─────────────────────────────────────┘
                         │ API Call
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                   LLM API (External)                          │
│  - OpenAI (GPT-4, GPT-3.5)                                   │
│  - Anthropic (Claude)                                         │
│  - Google (Gemini)                                            │
│  - Local LLM (optional)                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│         Configuration Files (Environment Variables)          │
│  - LLM_API_KEY                                               │
│  - LLM_MODEL                                                 │
│  - PROMPT_TEMPLATE                                           │
│  - API_TIMEOUT                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Data Flow

1. **User Input**: User enters Chinese name in frontend form
2. **Validation**: Frontend validates input (non-empty, reasonable length)
3. **API Request**: Frontend sends POST request to backend with Chinese name
4. **Backend Processing**:
   - Load customizable prompt template
   - Insert Chinese name into prompt
   - Apply LLM settings (temperature, max_tokens, etc.)
   - Call LLM API with prepared prompt
5. **LLM Response**: Receive generated English name(s) and explanation
6. **Response to Frontend**: Backend returns formatted response
7. **Display Results**: Frontend displays English name and explanation
8. **User Actions**: User can copy, request alternatives, or enter new name

---

## 7. Prompt Customization Strategy

### 7.1 Prompt Storage Options

**Option 1: Configuration File**
```
config/
├── prompts.json
├── settings.json
└── llm-config.json
```

**Option 2: Environment Variables**
- Store simple prompts in `.env` file
- Use JSON string for complex prompts

**Option 3: Database**
- Store prompts in database table
- Allow version history
- UI for editing prompts

### 7.2 Prompt Template Example
```
You are an expert in cross-cultural naming conventions. 

Given the Chinese name: "{chineseName}"

Generate 3 suitable English names that:
1. Resonate with the original Chinese name's meaning or phonetics
2. Sound natural and are easy to pronounce in English
3. Are culturally appropriate and professional

Return your response as JSON with this structure:
{
  "primary": "English Name",
  "explanation": "Why this name is suitable",
  "alternatives": ["Alt Name 1", "Alt Name 2"]
}
```

---

## 8. Error Handling & Fallbacks

| Error Type | Handling Strategy |
|-----------|------------------|
| Invalid input | Show user-friendly message, highlight input field |
| LLM API timeout | Retry up to 3 times, then show timeout error |
| LLM API error (rate limit) | Inform user, suggest retry later |
| Invalid response format | Log error, show generic error message |
| Network error | Inform user, check connection message |

---

## 9. Optional Features (Future Enhancements)

- User accounts and translation history
- Save favorite translations
- Export results as PDF/CSV
- Multiple language support
- Admin dashboard for prompt management
- Analytics and usage statistics
- Batch processing (upload CSV of names)
- API for third-party integrations

---

## 10. Success Criteria

- ✅ User can input Chinese name and receive English name
- ✅ Prompt can be modified without redeploying backend
- ✅ System handles errors gracefully
- ✅ Response time < 5 seconds
- ✅ Mobile-responsive UI
- ✅ Clear separation of configuration from code

---

## 11. Next Steps

1. **Choose Technology Stack** (See Section 4)
2. **Set Up Development Environment**
3. **Create Project Structure**
4. **Implement Backend API with LLM Integration**
5. **Implement Frontend UI**
6. **Testing and Error Handling**
7. **Deployment**

