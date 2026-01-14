export interface PesertaProfile {
  nokapst_masked: string;
  status_kepesertaan: string;
  kelas_rawat: string;
  pekerjaan?: string;
  jumlah_tanggungan: number;
  usia: number;
  gender: string;
  no_hp_masked?: string;
  flag_rehab_eligible?: boolean;
  flag_autodebit?: boolean;
  flag_mobile_jkn?: boolean;
}

export interface BillingInfo {
  total_tunggakan: number;
  bulan_menunggak: string[];
  durasi_bulan: number;
  last_payment_date: string;
  last_payment_method?: string;
  iuran_per_bulan?: number;
  iuran_per_jiwa?: number;
  tanggal_jatuh_tempo?: number;
  last_payment_amount?: number;
  payment_frequency_6months?: number;
  avg_delay_days?: number;
}

export interface InteractionHistory {
  last_contact: {
    agent_name: string;
    date: string;
    time?: string;
    channel: string;
    outcome: string;
    respon?: string;
    alasan_tunggak: string | null;
    notes?: string;
  };
  total_call_attempts?: number;
  total_successful_contacts?: number;
  first_contact_date?: string;
  contact_history?: Array<{
    date: string;
    channel: string;
    outcome: string;
    agent: string;
  }>;
}

export interface PaymentPromise {
  promised_date: string;
  promised_amount?: number;
  actual_payment_date?: string | null;
  status: string;
  days_overdue: number;
}

export interface PaymentCommitmentHistory {
  credibility_score: number;
  last_promise?: PaymentPromise; // Legacy support
  total_promises?: number;
  fulfilled_promises?: number;
  broken_promises?: number;
  promises?: PaymentPromise[];
}

export interface ClaimHistory {
  last_claim: {
    date: string;
    type: string;
    diagnosis: string;
    hospital: string;
    claim_amount: number;
    out_of_pocket?: number;
    los_days?: number;
  };
  total_claims_lifetime?: number;
  total_amount_claimed?: number;
  total_iuran_paid_lifetime?: number;
  roi_ratio?: number;
  claim_summary_1year?: {
    total_claims: number;
    total_amount: number;
    most_frequent_type: string | null;
  };
}

export interface BehavioralSegment {
  persona: string;
  pain_points: string[];
  motivators: string[];
  objection_patterns: string[];
  communication_style: string;
  payment_behavior: string;
}

export interface Strategy {
  approach: string;
  urgency: string;
  tone: string;
  primary_goal?: string;
  secondary_goal?: string;
  recommended_actions?: Array<{
    action: string;
    timing: string;
    priority: number;
    script_template: string;
  }>;
  escalation_rule?: {
    if_no_payment_by?: string;
    if_no_response_by?: string;
    then: string;
    if_broken_promise_again?: string;
  };
}

export interface ConversationContext {
  is_first_contact: boolean;
  has_previous_conversation: boolean;
  last_conversation_summary: string | null;
  current_conversation_goal: string;
  sentiment_last_interaction: string | null;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CustomerData {
  id: string;
  dataset_type?: string;
  timestamp_created?: string;
  peserta_profile: PesertaProfile;
  billing_info: BillingInfo;
  interaction_history: InteractionHistory;
  payment_commitment_history: PaymentCommitmentHistory;
  claim_history: ClaimHistory;
  behavioral_segment?: BehavioralSegment;
  strategy: Strategy;
  conversation_context?: ConversationContext;
  messages: Message[];
}

// Knowledge Base Types
export interface KbFaq {
  question: string;
  answer: string;
}

export interface KbContent {
  summary: string;
  detail: any;
  faq?: KbFaq[];
  related_kb?: string[];
}

export interface KbEntry {
  kb_id: string;
  category: string;
  topic: string;
  keywords: string[];
  content: KbContent;
  last_verified: string;
}

export interface KbMetadata {
  version: string;
  last_updated: string;
  total_entries: number;
  categories: string[];
}

export interface KnowledgeBase {
  metadata: KbMetadata;
  kb_entries: KbEntry[];
}