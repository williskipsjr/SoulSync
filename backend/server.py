from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import bcrypt
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Secret
JWT_SECRET = os.environ.get('JWT_SECRET', 'care-companion-secret-key-2024')
JWT_ALGORITHM = 'HS256'

# LLM Config
LLM_API_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ============ MODELS ============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    # Emergency contact opt-in
    consent_given: bool = False
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

class UserSignup(BaseModel):
    email: str
    password: str
    name: str
    consent_given: bool = False
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversation_id: str
    user_id: str
    role: str  # 'user' or 'assistant'
    content: str
    mood: Optional[str] = None  # For user messages: anxious, depressed, positive, neutral, risk
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SendMessageRequest(BaseModel):
    message: str

class Conversation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str = "New Conversation"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_message_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EscalationRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    conversation_id: str
    message_content: str
    mood_detected: str
    risk_score: float
    status: str = "pending"  # pending, approved, rejected, sent
    user_consent_given: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    reviewed_at: Optional[datetime] = None
    sms_sent_at: Optional[datetime] = None

class AuditLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id_hash: str
    action: str
    details: dict
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============ HELPER FUNCTIONS ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, email: str) -> str:
    payload = {"user_id": user_id, "email": email}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

async def detect_mood_and_generate_response(user_message: str, conversation_history: List[dict], user: User) -> tuple:
    """
    Returns: (mood, response, risk_score, needs_escalation)
    """
    # System prompt for mood detection
    mood_detection_prompt = """You are CareCompanion, an empathetic mental health support assistant.

Your role:
1. Detect the user's mood from their message and classify it as: anxious, depressed, positive, neutral, or risk
2. Provide an empathetic, supportive response
3. Suggest short, actionable coping strategies when appropriate
4. Never diagnose or provide clinical advice

Mood Classification:
- anxious: worry, panic, stress, fear, nervousness
- depressed: sadness, hopelessness, emptiness, worthlessness
- positive: happy, content, grateful, hopeful, motivated
- neutral: general conversation, questions, neutral topics
- risk: self-harm mentions, suicidal thoughts, immediate danger signals

Response Format:
MOOD: [one of: anxious, depressed, positive, neutral, risk]
RISK_SCORE: [0.0 to 1.0 - only for 'risk' mood, otherwise 0.0]
RESPONSE: [your empathetic response]

For 'risk' mood:
- Be extremely supportive and gentle
- Ask if they would like you to contact their emergency contact
- Provide crisis helpline numbers
- Never be judgmental

Important: You are NOT a replacement for professional mental health care."""

    try:
        # Create LLM chat session
        session_id = f"mood_detection_{uuid.uuid4()}"
        chat = LlmChat(
            api_key=LLM_API_KEY,
            session_id=session_id,
            system_message=mood_detection_prompt
        ).with_model("openai", "gpt-4o-mini")

        # Build context from conversation history
        context = ""
        if conversation_history:
            context = "Previous conversation context:\n"
            for msg in conversation_history[-5:]:  # Last 5 messages
                context += f"{msg['role']}: {msg['content']}\n"
            context += "\n"

        # Send message
        prompt = f"{context}Current user message: {user_message}\n\nAnalyze and respond."
        user_msg = UserMessage(text=prompt)
        response = await chat.send_message(user_msg)

        # Parse response
        mood = "neutral"
        risk_score = 0.0
        ai_response = response

        lines = response.split('\n')
        for line in lines:
            if line.startswith('MOOD:'):
                mood = line.replace('MOOD:', '').strip().lower()
            elif line.startswith('RISK_SCORE:'):
                try:
                    risk_score = float(line.replace('RISK_SCORE:', '').strip())
                except:
                    risk_score = 0.0
            elif line.startswith('RESPONSE:'):
                ai_response = '\n'.join([l for l in lines if l.startswith('RESPONSE:')])
                ai_response = ai_response.replace('RESPONSE:', '').strip()

        # Determine if escalation needed
        needs_escalation = mood == 'risk' and risk_score > 0.6

        return mood, ai_response, risk_score, needs_escalation

    except Exception as e:
        logging.error(f"LLM Error: {str(e)}")
        # Fallback response
        return "neutral", "I'm here to listen and support you. How are you feeling today?", 0.0, False

# ============ AUTH ROUTES ============

@api_router.post("/auth/signup")
async def signup(input: UserSignup):
    # Check if user exists
    existing = await db.users.find_one({"email": input.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    user_dict = input.model_dump(exclude={'password'})
    user_obj = User(**user_dict)
    user_doc = user_obj.model_dump()
    user_doc['password'] = hash_password(input.password)
    user_doc['created_at'] = user_doc['created_at'].isoformat()

    await db.users.insert_one(user_doc)

    # Create token
    token = create_token(user_obj.id, user_obj.email)

    # Audit log
    audit = AuditLog(
        user_id_hash=str(hash(user_obj.id)),
        action="user_signup",
        details={"consent_given": input.consent_given}
    )
    audit_doc = audit.model_dump()
    audit_doc['timestamp'] = audit_doc['timestamp'].isoformat()
    await db.audit_logs.insert_one(audit_doc)

    return {"token": token, "user": user_obj.model_dump()}

@api_router.post("/auth/login")
async def login(input: UserLogin):
    user = await db.users.find_one({"email": input.email}, {"_id": 0})
    if not user or not verify_password(input.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(user['id'], user['email'])
    user.pop('password', None)

    return {"token": token, "user": user}

@api_router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    return user

# ============ CONVERSATION ROUTES ============

@api_router.get("/conversations")
async def get_conversations(user: User = Depends(get_current_user)):
    convos = await db.conversations.find(
        {"user_id": user.id},
        {"_id": 0}
    ).sort("last_message_at", -1).to_list(100)

    for convo in convos:
        if isinstance(convo.get('created_at'), str):
            convo['created_at'] = datetime.fromisoformat(convo['created_at'])
        if isinstance(convo.get('last_message_at'), str):
            convo['last_message_at'] = datetime.fromisoformat(convo['last_message_at'])

    return convos

@api_router.post("/conversations")
async def create_conversation(user: User = Depends(get_current_user)):
    convo = Conversation(user_id=user.id)
    doc = convo.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['last_message_at'] = doc['last_message_at'].isoformat()
    await db.conversations.insert_one(doc)
    return convo

@api_router.get("/conversations/{conversation_id}/messages")
async def get_messages(conversation_id: str, user: User = Depends(get_current_user)):
    # Verify ownership
    convo = await db.conversations.find_one({"id": conversation_id, "user_id": user.id})
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = await db.messages.find(
        {"conversation_id": conversation_id},
        {"_id": 0}
    ).sort("timestamp", 1).to_list(1000)

    for msg in messages:
        if isinstance(msg.get('timestamp'), str):
            msg['timestamp'] = datetime.fromisoformat(msg['timestamp'])

    return messages

@api_router.post("/conversations/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    request: SendMessageRequest,
    user: User = Depends(get_current_user)
):
    # Verify conversation ownership
    convo = await db.conversations.find_one({"id": conversation_id, "user_id": user.id})
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Get conversation history
    history = await db.messages.find(
        {"conversation_id": conversation_id},
        {"_id": 0}
    ).sort("timestamp", 1).to_list(1000)

    # Detect mood and generate response
    mood, ai_response, risk_score, needs_escalation = await detect_mood_and_generate_response(
        request.message, history, user
    )

    # Save user message
    user_msg = Message(
        conversation_id=conversation_id,
        user_id=user.id,
        role="user",
        content=request.message,
        mood=mood
    )
    user_doc = user_msg.model_dump()
    user_doc['timestamp'] = user_doc['timestamp'].isoformat()
    await db.messages.insert_one(user_doc)

    # Save assistant message
    assistant_msg = Message(
        conversation_id=conversation_id,
        user_id=user.id,
        role="assistant",
        content=ai_response
    )
    assistant_doc = assistant_msg.model_dump()
    assistant_doc['timestamp'] = assistant_doc['timestamp'].isoformat()
    await db.messages.insert_one(assistant_doc)

    # Update conversation timestamp
    await db.conversations.update_one(
        {"id": conversation_id},
        {"$set": {"last_message_at": datetime.now(timezone.utc).isoformat()}}
    )

    # Handle escalation if needed
    escalation_triggered = False
    if needs_escalation and user.consent_given:
        # Create escalation request
        escalation = EscalationRequest(
            user_id=user.id,
            conversation_id=conversation_id,
            message_content=request.message,
            mood_detected=mood,
            risk_score=risk_score
        )
        esc_doc = escalation.model_dump()
        esc_doc['created_at'] = esc_doc['created_at'].isoformat()
        await db.escalation_requests.insert_one(esc_doc)
        escalation_triggered = True

        # Audit log
        audit = AuditLog(
            user_id_hash=str(hash(user.id)),
            action="escalation_triggered",
            details={"conversation_id": conversation_id, "risk_score": risk_score}
        )
        audit_doc = audit.model_dump()
        audit_doc['timestamp'] = audit_doc['timestamp'].isoformat()
        await db.audit_logs.insert_one(audit_doc)

    return {
        "user_message": user_msg.model_dump(),
        "assistant_message": assistant_msg.model_dump(),
        "mood": mood,
        "risk_score": risk_score,
        "escalation_triggered": escalation_triggered
    }

# ============ ESCALATION ROUTES ============

@api_router.post("/escalation/consent")
async def give_escalation_consent(
    conversation_id: str,
    user: User = Depends(get_current_user)
):
    """User gives consent for escalation after being prompted"""
    # Find pending escalation
    escalation = await db.escalation_requests.find_one({
        "conversation_id": conversation_id,
        "user_id": user.id,
        "status": "pending"
    })

    if not escalation:
        raise HTTPException(status_code=404, detail="No pending escalation found")

    # Update escalation with consent
    await db.escalation_requests.update_one(
        {"id": escalation["id"]},
        {"$set": {"user_consent_given": True}}
    )

    return {"message": "Consent recorded. Your request is now in the moderator queue."}

# ============ MODERATOR ROUTES ============

@api_router.get("/moderator/queue")
async def get_moderator_queue():
    """Get all pending escalations (in production, add moderator auth)"""
    escalations = await db.escalation_requests.find(
        {"status": "pending"},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)

    # Enrich with user details
    for esc in escalations:
        user = await db.users.find_one({"id": esc["user_id"]}, {"_id": 0})
        if user:
            esc["user_name"] = user["name"]
            esc["user_email"] = user["email"]
            esc["emergency_contact_name"] = user.get("emergency_contact_name")
            esc["emergency_contact_phone"] = user.get("emergency_contact_phone")

        if isinstance(esc.get('created_at'), str):
            esc['created_at'] = datetime.fromisoformat(esc['created_at'])

    return escalations

@api_router.post("/moderator/escalation/{escalation_id}/approve")
async def approve_escalation(escalation_id: str):
    """Moderator approves and sends SMS (mock)"""
    escalation = await db.escalation_requests.find_one({"id": escalation_id})
    if not escalation:
        raise HTTPException(status_code=404, detail="Escalation not found")

    # Get user details
    user = await db.users.find_one({"id": escalation["user_id"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Mock SMS send
    sms_body = f"""Hi {user.get('emergency_contact_name', 'there')}, this is a notification from CareCompanion.

We received a consented message about {user['name']} that indicates they may be in distress. Please check on them kindly.

Suggested approach: 'Hey {user['name']}, I got a message and I'm worried — are you okay? Can I help?'

If this is an emergency, please call local emergency services immediately.

Crisis Helplines:
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741"""

    # Log mock SMS
    mock_sms_log = {
        "id": str(uuid.uuid4()),
        "escalation_id": escalation_id,
        "to_phone": user.get('emergency_contact_phone', 'N/A'),
        "body": sms_body,
        "sent_at": datetime.now(timezone.utc).isoformat(),
        "status": "mock_sent"
    }
    await db.sms_logs.insert_one(mock_sms_log)

    # Update escalation
    await db.escalation_requests.update_one(
        {"id": escalation_id},
        {"$set": {
            "status": "approved",
            "reviewed_at": datetime.now(timezone.utc).isoformat(),
            "sms_sent_at": datetime.now(timezone.utc).isoformat()
        }}
    )

    # Audit log
    audit = AuditLog(
        user_id_hash=str(hash(user['id'])),
        action="escalation_approved",
        details={"escalation_id": escalation_id}
    )
    audit_doc = audit.model_dump()
    audit_doc['timestamp'] = audit_doc['timestamp'].isoformat()
    await db.audit_logs.insert_one(audit_doc)

    return {"message": "SMS sent (mock)", "sms_body": sms_body}

@api_router.post("/moderator/escalation/{escalation_id}/reject")
async def reject_escalation(escalation_id: str):
    """Moderator rejects escalation"""
    await db.escalation_requests.update_one(
        {"id": escalation_id},
        {"$set": {
            "status": "rejected",
            "reviewed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"message": "Escalation rejected"}

# ============ USER PROFILE ROUTES ============

@api_router.put("/profile/emergency-contact")
async def update_emergency_contact(
    consent_given: bool,
    emergency_contact_name: Optional[str] = None,
    emergency_contact_phone: Optional[str] = None,
    user: User = Depends(get_current_user)
):
    await db.users.update_one(
        {"id": user.id},
        {"$set": {
            "consent_given": consent_given,
            "emergency_contact_name": emergency_contact_name,
            "emergency_contact_phone": emergency_contact_phone
        }}
    )
    return {"message": "Emergency contact updated"}

@api_router.delete("/profile/conversations")
async def delete_all_conversations(user: User = Depends(get_current_user)):
    await db.conversations.delete_many({"user_id": user.id})
    await db.messages.delete_many({"user_id": user.id})
    return {"message": "All conversations deleted"}

# ============ HEALTH CHECK ============

@api_router.get("/")
async def root():
    return {"message": "CareCompanion API is running"}

@api_router.get("/health")
async def health():
    return {
        "status": "healthy",
        "disclaimer": "CareCompanion is not a substitute for professional care. If you are in immediate danger, call emergency services."
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()