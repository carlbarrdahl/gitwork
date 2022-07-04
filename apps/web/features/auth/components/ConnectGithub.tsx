import { Button } from "ui";
import { useSession, signIn, signOut } from "next-auth/react";

export default function ConnectGithub() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        <Button onClick={() => signOut()}>Sign out</Button>
      </>
    );
  }
  return (
    <Button
      onClick={() =>
        signIn("github", {
          callbackUrl: `${window.location.origin}?redirect=${window.location.href}`,
        })
      }
    >
      Sign in
    </Button>
  );
}
