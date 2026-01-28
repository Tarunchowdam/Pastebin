import { redirect } from 'next/navigation';

export default function PagesRedirect() {
  // This file is kept for compatibility but redirects to home
  redirect('/');
}