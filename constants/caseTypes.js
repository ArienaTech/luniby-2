// Case Management Constants
// Definitions for veterinarian case tracking and workflow

export const CASE_STATUS = {
  NEW: 'new',
  ASSIGNED: 'assigned',
  IN_REVIEW: 'in_review',
  COMPLETED: 'completed',
  ESCALATED: 'escalated',
  CANCELLED: 'cancelled'
};

export const CASE_PRIORITY = {
  URGENT: 'urgent',
  HIGH: 'high',
  NORMAL: 'normal',
  LOW: 'low'
};

export const CASE_TYPE = {
  TRIAGE_REVIEW: 'triage_review',
  SOAP_NOTE: 'soap_note',
  CONSULTATION: 'consultation',
  FOLLOW_UP: 'follow_up'
};

// Status display configuration
export const CASE_STATUS_CONFIG = {
  [CASE_STATUS.NEW]: {
    label: 'New',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: '🆕'
  },
  [CASE_STATUS.ASSIGNED]: {
    label: 'Assigned',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    icon: '📋'
  },
  [CASE_STATUS.IN_REVIEW]: {
    label: 'In Review',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    icon: '👀'
  },
  [CASE_STATUS.COMPLETED]: {
    label: 'Completed',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: '✅'
  },
  [CASE_STATUS.ESCALATED]: {
    label: 'Escalated',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: '⬆️'
  },
  [CASE_STATUS.CANCELLED]: {
    label: 'Cancelled',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    icon: '❌'
  }
};

// Priority display configuration
export const CASE_PRIORITY_CONFIG = {
  [CASE_PRIORITY.URGENT]: {
    label: 'Urgent',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300',
    icon: '🚨'
  },
  [CASE_PRIORITY.HIGH]: {
    label: 'High',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300',
    icon: '⚡'
  },
  [CASE_PRIORITY.NORMAL]: {
    label: 'Normal',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
    icon: '📄'
  },
  [CASE_PRIORITY.LOW]: {
    label: 'Low',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-300',
    icon: '📝'
  }
};

// Case type configuration
export const CASE_TYPE_CONFIG = {
  [CASE_TYPE.TRIAGE_REVIEW]: {
    label: 'Triage Review',
    icon: '🩺',
    description: 'Review LuniTriage assessment and provide recommendations'
  },
  [CASE_TYPE.SOAP_NOTE]: {
    label: 'SOAP Note',
    icon: '📋',
    description: 'Create or review SOAP note documentation'
  },
  [CASE_TYPE.CONSULTATION]: {
    label: 'Consultation',
    icon: '💬',
    description: 'Direct consultation with pet owner'
  },
  [CASE_TYPE.FOLLOW_UP]: {
    label: 'Follow-up',
    icon: '🔄',
    description: 'Follow-up on previous case or treatment'
  }
};