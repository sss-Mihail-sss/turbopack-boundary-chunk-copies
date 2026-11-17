import { SharedButton } from '../lib/shared-button';
import { SignInLink } from '../lib/sign-in-link';

export default function Unauthorized() {
  return (
    <main>
      <h1>unauthorized</h1>
      <SignInLink />
      <SharedButton>Go home</SharedButton>
    </main>
  );
}
