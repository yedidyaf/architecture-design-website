import {defineField, defineType} from 'sanity'

export const testimonial = defineType({
  name: 'testimonial',
  title: 'המלצה',
  type: 'document',
  fields: [
    defineField({
      name: 'clientName',
      title: 'שם הלקוח',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'quote',
      title: 'ציטוט',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'order', title: 'סדר תצוגה', type: 'number'}),
  ],
  preview: {
    select: {title: 'clientName', subtitle: 'quote'},
  },
})
