// src/app/(dashboard)/student/assignments/[id]/page.tsx

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import AssignmentDetail from '@/components/assignments/AssignmentDetail';

interface PageProps {
  params: {
    id: string;
  };
}

export const metadata = {
  title: 'Assignment Details | Student Dashboard',
  description: 'View assignment details and submit your work',
};

export default function StudentAssignmentDetailPage({ params }: PageProps) {
  return (
    <DashboardLayout>
      <AssignmentDetail assignmentId={params.id} />
    </DashboardLayout>
  );
}
