export default function DefaultPreview({ gameData }) {
  return (
    <div className="rounded-lg border bg-yellow-50 p-4">
      <h3 className="mb-2 text-lg font-semibold">Preview Not Available</h3>
      <pre className="text-sm">{JSON.stringify(gameData, null, 2)}</pre>
    </div>
  );
}
