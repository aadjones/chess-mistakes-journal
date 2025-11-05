import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to mistakes page - that's the real home
  redirect('/mistakes');
}
