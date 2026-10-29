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
      description:
        'טקסט קצר שמוצג מתחת ללוגו ולשם בראש האתר, עד שתי שורות. Enter מתחיל שורה חדשה. טקסט רגיל, ללא עיצוב.',
      // `text` stores a plain string like the old `string` type, so existing
      // values carry over; it just allows line breaks.
      type: 'text',
      rows: 2,
      validation: (rule) =>
        rule.custom((value) =>
          typeof value === 'string' && value.trim().split('\n').length > 2
            ? 'מומלץ עד שתי שורות'
            : true,
        ).warning(),
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
    defineField({
      name: 'bioAlign',
      title: 'יישור טקסט האודות',
      description: 'איך הטקסט המלא מיושר בחלון "קצת עליי".',
      type: 'string',
      options: {
        list: [
          {title: 'מיושר לימין', value: 'right'},
          {title: 'ממורכז', value: 'center'},
          {title: 'מיושר לשני הצדדים', value: 'justify'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'right',
    }),
  ],
})
