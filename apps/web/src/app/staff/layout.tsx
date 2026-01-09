import StaffLayout from '@/components/StaffLayout';

export default function StaffPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffLayout>{children}</StaffLayout>;
}