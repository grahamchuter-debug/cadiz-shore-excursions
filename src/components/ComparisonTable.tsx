export function ComparisonTable({
  rows,
  optionA,
  optionB,
}: {
  rows: { category: string; optionA: string; optionB: string }[];
  optionA: string;
  optionB: string;
}) {
  return (
    <div className="mt-8 overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-coastal-800 text-white">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">{optionA}</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">{optionB}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.map((row) => (
            <tr key={row.category}>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.category}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{row.optionA}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{row.optionB}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
