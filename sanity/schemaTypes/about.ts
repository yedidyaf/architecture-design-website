import {defineArrayMember, defineField, defineType} from 'sanity'

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
      description:
        'טקסט אודות או סלוגן קצר. אפשר להדגיש (מודגש / נטוי), להוסיף פסקאות (Enter) ושורה חדשה בתוך פסקה (Shift+Enter).',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          // Plain paragraphs only: no headings, lists, links or images.
          styles: [{title: 'טקסט רגיל', value: 'normal'}],
          lists: [],
          marks: {
            decorators: [
              {title: 'מודגש', value: 'strong'},
              {title: 'נטוי', value: 'em'},
            ],
            annotations: [],
          },
        }),
      ],
    }),
  ],
})
