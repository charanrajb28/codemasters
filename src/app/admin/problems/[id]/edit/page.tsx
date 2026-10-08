import React from "react";
import { getProblemWithTestCasesAction } from "@/actions/problem-actions";
import { EditProblemForm } from "@/components/admin/EditProblemForm";
import { notFound } from "next/navigation";

export default async function EditProblemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const problem = await getProblemWithTestCasesAction(id);

  if (!problem) {
    notFound();
  }

  return <EditProblemForm problem={problem} />;
}
