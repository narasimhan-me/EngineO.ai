export default function AutomationPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Automation</h1>
      <p className="text-gray-600 mb-4">
        This page will let you configure automated SEO tasks and scheduled scans.
      </p>
      <p className="text-sm text-gray-400">Project ID: {params.id}</p>
    </div>
  );
}
