// Keeps the admin panel out of Google and gives it its own browser tab title.
export const metadata = {
  title: 'Marjan Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return children;
}
