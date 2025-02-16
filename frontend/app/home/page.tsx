import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const {data: profile_data, error} = await supabase.from('profiles').select('display_name').eq('id', user.id).single()

  const display_name = profile_data?.display_name

  return (
    <h1> Hi, {display_name} </h1>
  );
}
