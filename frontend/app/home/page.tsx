import { createClient } from "@/utils/supabase/client";

export default async function Page() {
    const supabase = createClient()
    const {data: users} = await supabase.from('users').select()

    return <pre> {"Here are the users: " + JSON.stringify(users, null, 2)} </pre>
} 