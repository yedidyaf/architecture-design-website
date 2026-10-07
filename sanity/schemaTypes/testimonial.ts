import {defineField, defineType} from 'sanity'

export const testimonial = defineType({
  name: 'testimonial',
  title: 'המלצה',
  type: 'document',
  fields: [
    defineField({
      name: 'clientName',
      title: 'שם הלקוח',
      description: 'שם הלקוח שתחתיו תופיע ההמלצה.',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'quote',
      title: 'ציטוט',
      description: 'תוכן ההמלצה, כפי שיוצג באתר.',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'סדר תצוגה',
      description: 'מספר שקובע את סדר הצגת ההמלצות (מספר קטן יותר = מוצגת קודם).',
      type: 'number',
    }),
  ],
  preview: {
    select: {title: 'clientName', subtitle: 'quote'},
  },
})
