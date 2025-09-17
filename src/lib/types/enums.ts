// Staff-related enums
export enum StaffRole {
  ADMIN = "admin",
  MANAGER = "manager", 
  STAFF = "staff",
  CHARACTER_PERFORMER = "character_performer",
}

export enum TemplateType {
  INITIAL_CONTACT = "initial_contact",
  STAFF_NOTIFICATION = "staff_notification",
  CONFIRMATION = "confirmation",
  REMINDER = "reminder",
  INVITATION_MESSAGE = "invitation_message",
  CANCELLATION = "cancellation",
  RESCHEDULING = "rescheduling",
}

export enum NotificationChannel {
  WHATSAPP = "whatsapp",
  EMAIL = "email",
  SMS = "sms",
}

// Business-related enums  
export enum ServiceCategory {
  CHARACTER = "character",
  FOOD = "food",
  ENTERTAINMENT = "entertainment",
  DECORATION = "decoration",
  OTHER = "other",
}

// Communication-related enums
export enum MessageStatus {
  QUEUED = "queued",
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  FAILED = "failed",
  EXPIRED = "expired",
}

export enum MessageType {
  STAFF_NOTIFICATION = "staff_notification",
  CONFIRMATION = "confirmation",
  REMINDER = "reminder",
  INVITATION = "invitation",
  CANCELLATION = "cancellation",
  RESCHEDULING = "rescheduling",
  MANUAL = "manual",
}

export enum DeliveryChannel {
  WHATSAPP = "whatsapp",
  EMAIL = "email",
  SMS = "sms",
}

export enum ReminderStatus {
  SCHEDULED = "scheduled",
  SENT = "sent",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

// Reservation-related enums
export enum ReservationStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  REJECTED = "rejected",
}

export enum PaymentStatus {
  PENDING = "pending",
  PARTIAL = "partial",
  PAID = "paid",
  REFUNDED = "refunded",
}

export enum LinkStatus {
  ACTIVE = "active",
  USED = "used",
  EXPIRED = "expired",
}