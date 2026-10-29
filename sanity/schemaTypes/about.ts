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
      name: 'tagline',
      title: 'משפט קצר (מתחת ללוגו)',
      description: 'משפט קצר אחד שמוצג מתחת ללוגו ולשם בראש האתר. טקסט רגיל, ללא עיצוב.',
      type: 'string',
    }),
    defineField({
      name: 'bio',
      title: 'אודות (טקסט מלא)',
      description:
        'סיפור האודות המלא, שנפתח בחלון נפרד בלחיצה על "קצת עליי". אפשר להדגיש (מודגש / נטוי), להוסיף פסקאות (Enter) ושורה חדשה בתוך פסקה (Shift+Enter).',
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
