import ProjectSideNav from '@/components/layout/ProjectSideNav';

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        <ProjectSideNav />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
