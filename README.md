# Trade Finance AI Copilot
An agentic RAG system for analyzing trade finance compliance (UCP 600) and risk.

## 🏗️ Architecture
- **Multi-Agent Orchestration**: Built with **LangGraph**, utilizing a 4-node state machine:
  1. `Parser`: Normalizes unstructured trade data.
  2. `Compliance`: Validates data against international trade rules.
  3. `Risk Assessor`: Determines risk levels (Low/Medium/High).
  4. `Escalator`: (Conditional) Generates a supervisor memo for High-risk cases.
- **RAG Engine**: Uses **ChromaDB** and **Sentence Transformers** to retrieve grounded policy context.
- **Security**: Automated **PII Masking** layer scrubs sensitive data (Emails, IBANs) before LLM interaction.
- **MCP Tools**: AI capabilities are exposed via standardized JSON schemas.

## 🚀 Setup Instructions

### Backend
1. `cd backend`
2. `npm install`
3. Create `.env` (use `.env.example` as template)
4. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## 🔐 Security Features
- **JWT Authentication**: Secured routes for all API calls.
- **Sanitization**: Regular Expression-based PII masking for HIPAA/GDPR-style data protection.
- **Controlled Handoff**: LangGraph state management prevents prompt leakage.