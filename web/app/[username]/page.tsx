import { PublicProfile } from "../../components/profile/PublicProfile"
import { createClient } from "../../lib/supabase/server"
import type { Metadata } from "next"

type Props = {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, bio, profile_image')
    .eq('username', username)
    .single()

  if (!profile) {
    return {
      title: 'Vasta',
    }
  }

  return {
    title: `Vasta | @${profile.username}`,
    description: profile.bio || `Confira o perfil de @${profile.username} no Vasta`,
    openGraph: {
      title: `Vasta | @${profile.username}`,
      description: profile.bio || `Confira o perfil de @${profile.username} no Vasta`,
      images: profile.cover_image ? [profile.cover_image] : (profile.profile_image ? [profile.profile_image] : []),
    }
  }
}

export default async function Page({ params }: Props) {
  const { username } = await params
  return <PublicProfile username={username} />
}
