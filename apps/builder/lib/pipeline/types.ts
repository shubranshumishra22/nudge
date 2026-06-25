export interface UserInput {
  business_name: string;
  business_type: "cafe" | "bakery" | "clothing" | "fitness" | "handmade" | "restaurant" | "beauty" | "generic";
  description: string;
  primary_color: string;
  products: Array<{
    name: string;
    price: number;
    description?: string;
    image_url?: string;
  }>;
  language?: string;
  original_description?: string;
  original_business_name?: string;
}

export interface ResearchOutput {
  top_sites: Array<{ url: string; title: string }>;
  common_sections: string[];
  headline_patterns: string[];
  cta_patterns: string[];
  tone: "warm" | "professional" | "playful" | "minimal" | "bold";
  competitor_summary: string;
}

export interface DesignOutput {
  primary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_heading: string;
  font_body: string;
  border_radius: string;
  spacing_unit: string;
  hero_style: "fullbleed" | "split" | "centered" | "minimal";
  card_style: "shadow" | "border" | "flat";
  template_name: string;
}

export interface ContentOutput {
  hero_headline: string;
  hero_subheadline: string;
  hero_cta: string;
  about_title: string;
  about_body: string;
  products_section_title: string;
  contact_tagline: string;
  footer_tagline: string;
  seo_title: string;
  seo_description: string;
  whatsapp_message: string;
}

export interface BuildOutput {
  html: string;
  css: string;
  js: string;
}

export interface QAOutput {
  passed: boolean;
  issues_found: string[];
  issues_fixed: string[];
  html: string;
  css: string;
  js: string;
}

export interface PipelineResult {
  success: boolean;
  store_id: string;
  slug: string;
  research: ResearchOutput;
  design: DesignOutput;
  content: ContentOutput;
  build: BuildOutput;
  qa: QAOutput;
  duration_ms: number;
  models_used: string[];
  error?: string;
  // V2 Diagnostic fields
  iterations?: number;
  final_score?: number;
  critic_reports?: CriticPanelResult;
}

export interface ComponentBlock {
  name: string; // e.g. "HeroV1"
  props: Record<string, any>;
}

export interface LayoutPlan {
  style: DesignOutput;
  components: ComponentBlock[];
}

export interface CriticReport {
  score: number; // 1 to 10
  critique: string;
  weaknesses: string[];
}

export interface CriticPanelResult {
  design: CriticReport;
  ux: CriticReport;
  accessibility: CriticReport;
  seo: CriticReport;
  conversion: CriticReport;
  overall_score: number;
}

export interface PatchAction {
  component: string; // e.g. "hero"
  action: 'replace' | 'style_tweak' | 'content_tweak';
  target: string; // e.g. "HeroV1"
  value: any; // new name or properties
  reasoning: string;
}

