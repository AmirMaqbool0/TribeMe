import { redirect } from 'next/navigation';
import LoginPage from "./login/page";

export default function RootLayout() {
  redirect('/login');
  return <LoginPage />;
}
