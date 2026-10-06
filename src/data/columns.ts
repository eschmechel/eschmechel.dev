export const COLUMNS = [
  { id: 'whoami', key: '1', label: 'whoami', href: '/', title: 'Elliott Schmechel' },
  { id: 'projects', key: '2', label: 'projects', href: '/projects', title: 'projects · Elliott Schmechel' },
  { id: 'resume', key: '3', label: 'resume', href: '/resume', title: 'resume · Elliott Schmechel' },
  { id: 'blog', key: '4', label: 'blog', href: '/blog', title: 'blog · Elliott Schmechel' },
  { id: 'home', key: '5', label: '~/', href: '/~', title: '~/ · Elliott Schmechel' },
] as const;

export type ColumnId = (typeof COLUMNS)[number]['id'];
