import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Section {
  heading: string;
  content: string;
  bulletPoints?: string[];
}

interface Props {
  content: string;
  sections?: Section[];
  keyPoints?: string[];
}

export function SummaryViewer({ content, sections = [], keyPoints = [] }: Props) {
  if (!content && sections.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          No summary available yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {content && <p className="text-gray-700">{content}</p>}

        {keyPoints.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-gray-900 mb-2">Key Points</h4>
            <ul className="list-disc list-inside space-y-1">
              {keyPoints.map((point, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Key points are stable
                <li key={i} className="text-sm text-gray-600">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {sections.map((section, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Sections are stable
          <div key={index}>
            <h4 className="font-medium text-gray-900 mb-2">{section.heading}</h4>
            <p className="text-sm text-gray-600 mb-2">{section.content}</p>
            {section.bulletPoints && section.bulletPoints.length > 0 && (
              <ul className="list-disc list-inside space-y-1 ml-2">
                {section.bulletPoints.map((point, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: List items are stable
                  <li key={i} className="text-sm text-gray-500">
                    {point}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
