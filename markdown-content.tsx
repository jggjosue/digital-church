'use client';

import * as React from 'react';

type Props = {
  markdown: string;
};

export function MarkdownContent({ markdown }: Props) {
  const [html, setHtml] = React.useState('');

  React.useEffect(() => {
    import('marked').then((marked) => {
      setHtml(marked.parse(markdown) as string);
    });
  }, [markdown]);

  if (!html) {
    return <div className="prose prose-slate max-w-none lg:prose-lg" />;
  }
  return <div className="prose prose-slate max-w-none lg:prose-lg" dangerouslySetInnerHTML={{ __html: html }} />;
}