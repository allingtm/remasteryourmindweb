export function JsonLd({ data, id }: { data: object; id?: string }) {
  // Generate a stable ID from the schema type to prevent duplicate scripts
  const schemaType = (data as { "@type"?: string })["@type"] || "Schema";
  const scriptId = id || `json-ld-${schemaType.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <script
      id={scriptId}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      suppressHydrationWarning
    />
  );
}
