"use client";

import React, { useTransition } from "react";
import { deleteProblemAction } from "@/actions/problem-actions";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";

export const DeleteProblemButton: React.FC<{ problemId: string }> = ({ problemId }) => {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this problem and all its test cases?")) {
      startTransition(async () => {
        await deleteProblemAction(problemId);
      });
    }
  };

  return (
    <Button
      variant="danger"
      size="sm"
      disabled={isPending}
      onClick={handleDelete}
      icon={<Trash2 size={14} />}
    >
      Delete
    </Button>
  );
};
