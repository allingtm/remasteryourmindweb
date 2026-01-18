import { notFound } from "next/navigation";
import { SurveyForm } from "@/components/admin/surveys/survey-form";
import { getSurveyById } from "@/lib/supabase/queries/surveys";

export const metadata = {
  title: "Edit Survey - Admin",
};

interface EditSurveyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSurveyPage({ params }: EditSurveyPageProps) {
  const { id } = await params;
  const survey = await getSurveyById(id);

  if (!survey) {
    notFound();
  }

  return <SurveyForm survey={survey} />;
}
