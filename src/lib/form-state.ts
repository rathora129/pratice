export type LeadFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  reference?: string;
  fieldErrors?: Record<string, string>;
};

export const initialLeadState: LeadFormState = { status: "idle" };

export type ProductFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialProductState: ProductFormState = { status: "idle" };

export type VariantFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialVariantState: VariantFormState = { status: "idle" };

export type LoginFormState = {
  status: "idle" | "error";
  message?: string;
};

export const initialLoginState: LoginFormState = { status: "idle" };

export type AdminFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialAdminFormState: AdminFormState = { status: "idle" };
