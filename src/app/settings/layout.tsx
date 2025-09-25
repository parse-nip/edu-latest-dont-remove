import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings",
  description: "Demo settings for hackathon roles",
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}