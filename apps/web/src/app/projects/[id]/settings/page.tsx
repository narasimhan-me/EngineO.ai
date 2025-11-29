export default function ProjectSettingsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-gray-600 mb-4">
        This page will let you configure project settings, integrations, and preferences.
      </p>
      <p className="text-sm text-gray-400">Project ID: {params.id}</p>
    </div>
  );
}
