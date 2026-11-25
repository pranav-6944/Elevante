export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ProjectStatus =
  | "submitted"
  | "under_review"
  | "clarification_needed"
  | "quoted"
  | "quote_accepted"
  | "in_progress"
  | "review_ready"
  | "revision_requested"
  | "completed"
  | "cancelled";

export type ProjectPriority = "low" | "normal" | "high" | "urgent";

export type QuotationStatus =
  "draft" | "sent" | "viewed" | "accepted" | "revision_requested" | "declined" | "expired";

export type PricingMode = "quote_only" | "starting_from" | "fixed_estimate";

export type FormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "url"
  | "date"
  | "select"
  | "multiselect"
  | "radio"
  | "checkbox"
  | "file";

export type MessageType = "message" | "clarification_request" | "clarification_response" | "system";

export type EnquiryStatus = "new" | "contacted" | "converted" | "archived";
export type MediaType = "image" | "video" | "document";
export type PaymentStatus = "pending" | "authorized" | "paid" | "failed" | "refunded";

export type Database = {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string;
          slug: "customer" | "staff" | "admin" | "super_admin";
          name: string;
          description: string | null;
          is_system: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: "customer" | "staff" | "admin" | "super_admin";
          name: string;
          description?: string | null;
          is_system?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: "customer" | "staff" | "admin" | "super_admin";
          name?: string;
          description?: string | null;
          is_system?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      permissions: {
        Row: {
          id: string;
          code: string;
          module: string;
          description: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          module: string;
          description?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          module?: string;
          description?: string | null;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          role_id: string;
          permission_id: string;
        };
        Insert: {
          role_id: string;
          permission_id: string;
        };
        Update: {
          role_id?: string;
          permission_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          role_id: string;
          full_name: string;
          email: string;
          phone: string | null;
          company_name: string | null;
          job_title: string | null;
          avatar_path: string | null;
          is_active: boolean;
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role_id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          company_name?: string | null;
          job_title?: string | null;
          avatar_path?: string | null;
          is_active?: boolean;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role_id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          company_name?: string | null;
          job_title?: string | null;
          avatar_path?: string | null;
          is_active?: boolean;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      media_assets: {
        Row: {
          id: string;
          bucket: string;
          storage_path: string;
          public_url: string;
          file_name: string;
          mime_type: string;
          file_size: number;
          media_type: MediaType;
          alt_text: string | null;
          caption: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          bucket?: string;
          storage_path: string;
          public_url: string;
          file_name: string;
          mime_type: string;
          file_size: number;
          media_type: MediaType;
          alt_text?: string | null;
          caption?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          bucket?: string;
          storage_path?: string;
          public_url?: string;
          file_name?: string;
          mime_type?: string;
          file_size?: number;
          media_type?: MediaType;
          alt_text?: string | null;
          caption?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          id: string;
          profile_id: string | null;
          full_name: string;
          role_title: string;
          is_founder: boolean;
          bio: string | null;
          avatar_media_id: string | null;
          social_links: Json;
          display_order: number;
          is_public: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          full_name: string;
          role_title: string;
          is_founder?: boolean;
          bio?: string | null;
          avatar_media_id?: string | null;
          social_links?: Json;
          display_order?: number;
          is_public?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string | null;
          full_name?: string;
          role_title?: string;
          is_founder?: boolean;
          bio?: string | null;
          avatar_media_id?: string | null;
          social_links?: Json;
          display_order?: number;
          is_public?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      service_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon_name: string | null;
          display_order: number;
          is_published: boolean;
          seo_title: string | null;
          seo_description: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon_name?: string | null;
          display_order?: number;
          is_published?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon_name?: string | null;
          display_order?: number;
          is_published?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          category_id: string;
          title: string;
          slug: string;
          short_description: string;
          full_description: string;
          deliverables: Json;
          features: Json;
          tech_stack: string[];
          estimated_timeline: string | null;
          pricing_mode: PricingMode;
          starting_price_minor: number | null;
          currency: string;
          thumbnail_media_id: string | null;
          display_order: number;
          is_featured: boolean;
          is_published: boolean;
          seo_title: string | null;
          seo_description: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          title: string;
          slug: string;
          short_description: string;
          full_description: string;
          deliverables?: Json;
          features?: Json;
          tech_stack?: string[];
          estimated_timeline?: string | null;
          pricing_mode?: PricingMode;
          starting_price_minor?: number | null;
          currency?: string;
          thumbnail_media_id?: string | null;
          display_order?: number;
          is_featured?: boolean;
          is_published?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          title?: string;
          slug?: string;
          short_description?: string;
          full_description?: string;
          deliverables?: Json;
          features?: Json;
          tech_stack?: string[];
          estimated_timeline?: string | null;
          pricing_mode?: PricingMode;
          starting_price_minor?: number | null;
          currency?: string;
          thumbnail_media_id?: string | null;
          display_order?: number;
          is_featured?: boolean;
          is_published?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      service_form_fields: {
        Row: {
          id: string;
          service_id: string;
          field_key: string;
          label: string;
          field_type: FormFieldType;
          placeholder: string | null;
          help_text: string | null;
          options: Json;
          validation_rules: Json;
          is_required: boolean;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          field_key: string;
          label: string;
          field_type: FormFieldType;
          placeholder?: string | null;
          help_text?: string | null;
          options?: Json;
          validation_rules?: Json;
          is_required?: boolean;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          field_key?: string;
          label?: string;
          field_type?: FormFieldType;
          placeholder?: string | null;
          help_text?: string | null;
          options?: Json;
          validation_rules?: Json;
          is_required?: boolean;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_requests: {
        Row: {
          id: string;
          project_code: string;
          customer_id: string;
          service_id: string;
          assigned_to: string | null;
          title: string;
          summary: string;
          status: ProjectStatus;
          priority: ProjectPriority;
          desired_deadline: string | null;
          budget_range: string | null;
          form_schema_snapshot: Json;
          submitted_at: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_code?: string;
          customer_id: string;
          service_id: string;
          assigned_to?: string | null;
          title: string;
          summary: string;
          status?: ProjectStatus;
          priority?: ProjectPriority;
          desired_deadline?: string | null;
          budget_range?: string | null;
          form_schema_snapshot?: Json;
          submitted_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_code?: string;
          customer_id?: string;
          service_id?: string;
          assigned_to?: string | null;
          title?: string;
          summary?: string;
          status?: ProjectStatus;
          priority?: ProjectPriority;
          desired_deadline?: string | null;
          budget_range?: string | null;
          form_schema_snapshot?: Json;
          submitted_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_form_responses: {
        Row: {
          id: string;
          project_id: string;
          field_id: string | null;
          field_key: string;
          field_label: string;
          field_type: FormFieldType;
          response_value: Json;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          field_id?: string | null;
          field_key: string;
          field_label: string;
          field_type: FormFieldType;
          response_value: Json;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          field_id?: string | null;
          field_key?: string;
          field_label?: string;
          field_type?: FormFieldType;
          response_value?: Json;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      quotations: {
        Row: {
          id: string;
          project_id: string;
          quote_number: string;
          version: number;
          title: string;
          scope_summary: string;
          subtotal_minor: number;
          discount_minor: number;
          tax_minor: number;
          total_minor: number;
          currency: string;
          estimated_duration: string | null;
          terms: string | null;
          status: QuotationStatus;
          valid_until: string | null;
          customer_response_note: string | null;
          created_by: string;
          sent_at: string | null;
          responded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          quote_number?: string;
          version?: number;
          title: string;
          scope_summary: string;
          subtotal_minor: number;
          discount_minor?: number;
          tax_minor?: number;
          total_minor: number;
          currency?: string;
          estimated_duration?: string | null;
          terms?: string | null;
          status?: QuotationStatus;
          valid_until?: string | null;
          customer_response_note?: string | null;
          created_by: string;
          sent_at?: string | null;
          responded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          quote_number?: string;
          version?: number;
          title?: string;
          scope_summary?: string;
          subtotal_minor?: number;
          discount_minor?: number;
          tax_minor?: number;
          total_minor?: number;
          currency?: string;
          estimated_duration?: string | null;
          terms?: string | null;
          status?: QuotationStatus;
          valid_until?: string | null;
          customer_response_note?: string | null;
          created_by?: string;
          sent_at?: string | null;
          responded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      quotation_items: {
        Row: {
          id: string;
          quotation_id: string;
          title: string;
          description: string | null;
          quantity: number;
          unit_price_minor: number;
          line_total_minor: number;
          display_order: number;
        };
        Insert: {
          id?: string;
          quotation_id: string;
          title: string;
          description?: string | null;
          quantity?: number;
          unit_price_minor: number;
          line_total_minor: number;
          display_order?: number;
        };
        Update: {
          id?: string;
          quotation_id?: string;
          title?: string;
          description?: string | null;
          quantity?: number;
          unit_price_minor?: number;
          line_total_minor?: number;
          display_order?: number;
        };
        Relationships: [];
      };
      project_status_history: {
        Row: {
          id: string;
          project_id: string;
          from_status: ProjectStatus | null;
          to_status: ProjectStatus;
          changed_by: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          from_status?: ProjectStatus | null;
          to_status: ProjectStatus;
          changed_by?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          from_status?: ProjectStatus | null;
          to_status?: ProjectStatus;
          changed_by?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      project_messages: {
        Row: {
          id: string;
          project_id: string;
          sender_id: string;
          message_type: MessageType;
          body: string;
          is_internal_note: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          sender_id: string;
          message_type?: MessageType;
          body: string;
          is_internal_note?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          sender_id?: string;
          message_type?: MessageType;
          body?: string;
          is_internal_note?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      project_files: {
        Row: {
          id: string;
          project_id: string;
          message_id: string | null;
          uploaded_by: string;
          bucket: string;
          storage_path: string;
          original_filename: string;
          mime_type: string;
          file_size: number;
          purpose: "reference" | "message_attachment";
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          message_id?: string | null;
          uploaded_by: string;
          bucket?: string;
          storage_path: string;
          original_filename: string;
          mime_type: string;
          file_size: number;
          purpose: "reference" | "message_attachment";
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          message_id?: string | null;
          uploaded_by?: string;
          bucket?: string;
          storage_path?: string;
          original_filename?: string;
          mime_type?: string;
          file_size?: number;
          purpose?: "reference" | "message_attachment";
          created_at?: string;
        };
        Relationships: [];
      };
      deliverables: {
        Row: {
          id: string;
          project_id: string;
          uploaded_by: string;
          title: string;
          description: string | null;
          version_label: string;
          bucket: string;
          storage_path: string;
          original_filename: string;
          mime_type: string;
          file_size: number;
          is_customer_accessible: boolean;
          download_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          uploaded_by: string;
          title: string;
          description?: string | null;
          version_label?: string;
          bucket?: string;
          storage_path: string;
          original_filename: string;
          mime_type: string;
          file_size: number;
          is_customer_accessible?: boolean;
          download_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          uploaded_by?: string;
          title?: string;
          description?: string | null;
          version_label?: string;
          bucket?: string;
          storage_path?: string;
          original_filename?: string;
          mime_type?: string;
          file_size?: number;
          is_customer_accessible?: boolean;
          download_count?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      portfolio_projects: {
        Row: {
          id: string;
          service_id: string | null;
          title: string;
          slug: string;
          client_name: string | null;
          industry: string | null;
          summary: string;
          challenge: string | null;
          solution: string | null;
          outcomes: Json;
          tech_stack: string[];
          live_url: string | null;
          cover_media_id: string | null;
          gallery_media_ids: string[];
          display_order: number;
          is_featured: boolean;
          is_published: boolean;
          seo_title: string | null;
          seo_description: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id?: string | null;
          title: string;
          slug: string;
          client_name?: string | null;
          industry?: string | null;
          summary: string;
          challenge?: string | null;
          solution?: string | null;
          outcomes?: Json;
          tech_stack?: string[];
          live_url?: string | null;
          cover_media_id?: string | null;
          gallery_media_ids?: string[];
          display_order?: number;
          is_featured?: boolean;
          is_published?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string | null;
          title?: string;
          slug?: string;
          client_name?: string | null;
          industry?: string | null;
          summary?: string;
          challenge?: string | null;
          solution?: string | null;
          outcomes?: Json;
          tech_stack?: string[];
          live_url?: string | null;
          cover_media_id?: string | null;
          gallery_media_ids?: string[];
          display_order?: number;
          is_featured?: boolean;
          is_published?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: string;
          portfolio_project_id: string | null;
          author_name: string;
          author_role: string | null;
          company: string | null;
          quote: string;
          rating: number | null;
          avatar_media_id: string | null;
          display_order: number;
          is_featured: boolean;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          portfolio_project_id?: string | null;
          author_name: string;
          author_role?: string | null;
          company?: string | null;
          quote: string;
          rating?: number | null;
          avatar_media_id?: string | null;
          display_order?: number;
          is_featured?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          portfolio_project_id?: string | null;
          author_name?: string;
          author_role?: string | null;
          company?: string | null;
          quote?: string;
          rating?: number | null;
          avatar_media_id?: string | null;
          display_order?: number;
          is_featured?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      faqs: {
        Row: {
          id: string;
          category: string;
          service_id: string | null;
          question: string;
          answer: string;
          display_order: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category?: string;
          service_id?: string | null;
          question: string;
          answer: string;
          display_order?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category?: string;
          service_id?: string | null;
          question?: string;
          answer?: string;
          display_order?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_sections: {
        Row: {
          id: string;
          page_key: string;
          section_key: string;
          title: string | null;
          subtitle: string | null;
          content: Json;
          seo_metadata: Json;
          is_published: boolean;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page_key: string;
          section_key: string;
          title?: string | null;
          subtitle?: string | null;
          content?: Json;
          seo_metadata?: Json;
          is_published?: boolean;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          page_key?: string;
          section_key?: string;
          title?: string | null;
          subtitle?: string | null;
          content?: Json;
          seo_metadata?: Json;
          is_published?: boolean;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      enquiries: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          company: string | null;
          service_interest: string | null;
          subject: string;
          message: string;
          status: EnquiryStatus;
          assigned_to: string | null;
          converted_project_id: string | null;
          internal_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          company?: string | null;
          service_interest?: string | null;
          subject: string;
          message: string;
          status?: EnquiryStatus;
          assigned_to?: string | null;
          converted_project_id?: string | null;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          company?: string | null;
          service_interest?: string | null;
          subject?: string;
          message?: string;
          status?: EnquiryStatus;
          assigned_to?: string | null;
          converted_project_id?: string | null;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          link_url: string | null;
          is_read: boolean;
          read_at: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          link_url?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          body?: string;
          link_url?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          actor_email: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          actor_email?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          actor_email?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      platform_settings: {
        Row: {
          key: string;
          value: Json;
          description: string | null;
          is_public: boolean;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          description?: string | null;
          is_public?: boolean;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          description?: string | null;
          is_public?: boolean;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      payment_records: {
        Row: {
          id: string;
          project_id: string;
          quotation_id: string | null;
          customer_id: string;
          provider: string;
          provider_payment_id: string | null;
          amount_minor: number;
          currency: string;
          status: PaymentStatus;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          quotation_id?: string | null;
          customer_id: string;
          provider: string;
          provider_payment_id?: string | null;
          amount_minor: number;
          currency?: string;
          status?: PaymentStatus;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          quotation_id?: string | null;
          customer_id?: string;
          provider?: string;
          provider_payment_id?: string | null;
          amount_minor?: number;
          currency?: string;
          status?: PaymentStatus;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      rate_limits: {
        Row: {
          key: string;
          window_start: string;
          request_count: number;
        };
        Insert: {
          key: string;
          window_start: string;
          request_count?: number;
        };
        Update: {
          key?: string;
          window_start?: string;
          request_count?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_role: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      is_admin_or_staff: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_super_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      user_has_permission: {
        Args: { perm_code: string };
        Returns: boolean;
      };
      check_rate_limit: {
        Args: {
          p_key: string;
          p_max_requests: number;
          p_window_seconds: number;
        };
        Returns: {
          allowed: boolean;
          remaining: number;
          reset_at: string;
        }[];
      };
    };
    Enums: {
      project_status: ProjectStatus;
      project_priority: ProjectPriority;
      quotation_status: QuotationStatus;
      pricing_mode: PricingMode;
      form_field_type: FormFieldType;
      message_type: MessageType;
      enquiry_status: EnquiryStatus;
      media_type: MediaType;
      payment_status: PaymentStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
