import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/dim/AppShell";
import { PageHeader } from "@/components/dim/PageHeader";
import { FoundingBadge } from "@/components/dim/FoundingBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useMember } from "@/hooks/use-member";
import { awardAchievement } from "@/lib/member-actions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/community")({
  component: Community;
});

function Community() {
  return null;
}
