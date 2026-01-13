import StaffLayout from '@/components/StaffLayout/StaffLayout';

export default function StaffPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffLayout>{children}</StaffLayout>;
}