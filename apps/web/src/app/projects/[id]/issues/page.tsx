export default function IssuesPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Issues & Fixes</h1>
      <p className="text-gray-600 mb-4">
        This page will show SEO issues and recommended fixes for your website.
      </p>
      <p className="text-sm text-gray-400">Project ID: {params.id}</p>
    </div>
  );
}
