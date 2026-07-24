import { supabase } from "@/integrations/supabase/client";

export interface ParentChild {
  student_user_id: string;
  full_name: string | null;
  student_id: string | null;
  avatar_url: string | null;
  stage_name: string | null;
  linked_at: string;
}

export interface ParentLinkRequest {
  id: string;
  student_user_id: string;
  student_name: string | null;
  student_code: string | null;
  status: "pending" | "approved" | "rejected" | "revoked";
  relationship: string | null;
  request_note: string | null;
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface AdminLinkRow extends ParentLinkRequest {
  parent_user_id: string;
  parent_name: string | null;
  parent_phone: string | null;
  reviewed_by: string | null;
  updated_at: string;
}

export async function requestStudentLink(code: string, relationship?: string, note?: string) {
  const { data, error } = await (supabase as any).rpc("parent_request_student_link", {
    p_student_code: code,
    p_relationship: relationship ?? null,
    p_note: note ?? null,
  });
  if (error) throw error;
  return data as { success: boolean; reason?: string; link_id?: string };
}

export async function listMyChildren(): Promise<ParentChild[]> {
  const { data, error } = await (supabase as any).rpc("parent_list_children");
  if (error) throw error;
  return (data ?? []) as ParentChild[];
}

export async function listMyLinkRequests(): Promise<ParentLinkRequest[]> {
  const { data, error } = await (supabase as any).rpc("parent_list_my_link_requests");
  if (error) throw error;
  return (data ?? []) as ParentLinkRequest[];
}

export async function getChildSnapshot(studentUserId: string) {
  const { data, error } = await (supabase as any).rpc("get_child_snapshot", { _student_id: studentUserId });
  if (error) throw error;
  return data;
}

export async function adminListParentLinkRequests(status?: string): Promise<AdminLinkRow[]> {
  const { data, error } = await (supabase as any).rpc("admin_list_parent_link_requests", {
    p_status: status ?? null,
  });
  if (error) throw error;
  return (data ?? []) as AdminLinkRow[];
}

export async function adminReviewParentLink(linkId: string, action: "approve" | "reject" | "revoke", note?: string) {
  const { data, error } = await (supabase as any).rpc("admin_review_parent_link", {
    p_link_id: linkId,
    p_action: action,
    p_note: note ?? null,
  });
  if (error) throw error;
  return data;
}
