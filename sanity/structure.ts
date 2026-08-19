import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .id('root')
    .title('תוכן')
    .items([
      S.documentTypeListItem('project').title('פרויקטים'),
      S.documentTypeListItem('about').title('אודות ולוגו'),
      S.documentTypeListItem('testimonial').title('המלצות'),
    ])
