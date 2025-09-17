CREATE TYPE "public"."notification_channel" AS ENUM('whatsapp', 'email', 'sms');--> statement-breakpoint
CREATE TYPE "public"."staff_role" AS ENUM('admin', 'manager', 'staff', 'character_performer');--> statement-breakpoint
CREATE TYPE "public"."template_type" AS ENUM('initial_contact', 'staff_notification', 'confirmation', 'reminder', 'invitation_message', 'cancellation', 'rescheduling');--> statement-breakpoint
CREATE TYPE "public"."delivery_channel" AS ENUM('whatsapp', 'email', 'sms');--> statement-breakpoint
CREATE TYPE "public"."message_status" AS ENUM('queued', 'sent', 'delivered', 'read', 'failed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('staff_notification', 'confirmation', 'reminder', 'invitation', 'cancellation', 'rescheduling', 'manual');--> statement-breakpoint
CREATE TYPE "public"."reminder_status" AS ENUM('scheduled', 'sent', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."link_status" AS ENUM('active', 'used', 'expired');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'partial', 'paid', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed', 'rejected');--> statement-breakpoint
CREATE TABLE "invitation_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"template_path" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"content" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "message_templates_type_unique" UNIQUE("type")
);
--> statement-breakpoint
CREATE TABLE "staff_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"phone_number" text,
	"whatsapp_number" text,
	"role" text DEFAULT 'staff' NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" text
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"category" text,
	"data_type" text NOT NULL,
	"updated_by" text,
	"updated_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "additional_services" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(10, 2),
	"emoji" text,
	"category" text DEFAULT 'other' NOT NULL,
	"requires_staff" boolean DEFAULT false NOT NULL,
	"max_quantity" integer,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_types" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"capacity" integer NOT NULL,
	"hourly_rate" numeric(10, 2),
	"setup_time_minutes" integer DEFAULT 30 NOT NULL,
	"cleanup_time_minutes" integer DEFAULT 30 NOT NULL,
	"operating_hours_start" text DEFAULT '09:00' NOT NULL,
	"operating_hours_end" text DEFAULT '21:00' NOT NULL,
	"calendar_id" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"reservation_id" text NOT NULL,
	"template_id" text NOT NULL,
	"template_name" text NOT NULL,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_size" integer,
	"generation_parameters" jsonb,
	"delivered_via" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"generated_by" text NOT NULL,
	"generated_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatsapp_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"external_message_id" text,
	"phone_number" text NOT NULL,
	"recipient_name" text,
	"message_content" text NOT NULL,
	"message_type" text NOT NULL,
	"template_id" text,
	"template_name" text,
	"template_variables" jsonb,
	"status" text DEFAULT 'queued' NOT NULL,
	"error_message" text,
	"error_code" text,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"read_at" timestamp,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"next_retry_at" timestamp,
	"reservation_id" text,
	"sent_by" text,
	"webhook_data" jsonb,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_records" (
	"id" text PRIMARY KEY NOT NULL,
	"reservation_id" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_method" text,
	"payment_reference" text,
	"notes" text,
	"recorded_by" text NOT NULL,
	"recorded_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservation_additional_services" (
	"reservation_id" text NOT NULL,
	"additional_service_id" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price" numeric(10, 2),
	"created_at" timestamp NOT NULL,
	CONSTRAINT "reservation_additional_services_reservation_id_additional_service_id_pk" PRIMARY KEY("reservation_id","additional_service_id")
);
--> statement-breakpoint
CREATE TABLE "reservation_links" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"room_id" text,
	"preferred_date" timestamp,
	"preferred_time" text,
	"status" "link_status" DEFAULT 'active' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_by_staff_id" text NOT NULL,
	"reservation_id" text,
	"viewed_at" timestamp,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "reservation_links_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" text PRIMARY KEY NOT NULL,
	"reference_number" text NOT NULL,
	"child_name" text NOT NULL,
	"child_age" integer NOT NULL,
	"event_type_id" text NOT NULL,
	"room_id" text NOT NULL,
	"event_date" timestamp NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"guest_count_children" integer NOT NULL,
	"guest_count_adults" integer NOT NULL,
	"client_name" text NOT NULL,
	"client_phone" text NOT NULL,
	"client_email" text,
	"special_requests" text,
	"dietary_restrictions" text,
	"status" "reservation_status" DEFAULT 'pending' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"assigned_staff_id" text,
	"confirmed_at" timestamp,
	"confirmed_by" text,
	"calendar_event_id" text,
	"total_amount" numeric(10, 2),
	"paid_amount" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "reservations_reference_number_unique" UNIQUE("reference_number")
);
--> statement-breakpoint
ALTER TABLE "invitation_templates" ADD CONSTRAINT "invitation_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_templates" ADD CONSTRAINT "message_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_invitations" ADD CONSTRAINT "generated_invitations_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_invitations" ADD CONSTRAINT "generated_invitations_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_template_id_message_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."message_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_sent_by_users_id_fk" FOREIGN KEY ("sent_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_additional_services" ADD CONSTRAINT "reservation_additional_services_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_additional_services" ADD CONSTRAINT "reservation_additional_services_additional_service_id_additional_services_id_fk" FOREIGN KEY ("additional_service_id") REFERENCES "public"."additional_services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_links" ADD CONSTRAINT "reservation_links_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_links" ADD CONSTRAINT "reservation_links_created_by_staff_id_users_id_fk" FOREIGN KEY ("created_by_staff_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_links" ADD CONSTRAINT "reservation_links_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_event_type_id_event_types_id_fk" FOREIGN KEY ("event_type_id") REFERENCES "public"."event_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_assigned_staff_id_users_id_fk" FOREIGN KEY ("assigned_staff_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_confirmed_by_users_id_fk" FOREIGN KEY ("confirmed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;