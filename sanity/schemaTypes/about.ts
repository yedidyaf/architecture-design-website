import {defineField, defineType} from 'sanity'

export const about = defineType({
  name: 'about',
  title: 'אודות ולוגו',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'שם',
      description: 'השם שמוצג באתר.',
      type: 'string',
    }),
    defineField({
      name: 'logo',
      title: 'לוגו',
      description: 'הלוגו שמוצג בראש האתר.',
      type: 'image',
    }),
    defineField({
      name: 'bio',
      title: 'טקסט אודות',
      description: 'טקסט אודות או סלוגן קצר.',
      type: 'text',
    }),
  ],
})
