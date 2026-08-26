import {defineArrayMember, defineField, defineType} from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'פרויקט',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'שם הפרויקט',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'קישור (Slug)',
      type: 'slug',
      options: {source: 'title'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'תמונת שער',
      type: 'image',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'order', title: 'סדר תצוגה', type: 'number'}),
    defineField({
      name: 'body',
      title: 'תוכן הפרויקט',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'טקסט רגיל', value: 'normal'},
            {title: 'כותרת', value: 'h2'},
            {title: 'כותרת משנה', value: 'h3'},
          ],
          lists: [
            {title: 'רשימה', value: 'bullet'},
            {title: 'רשימה ממוספרת', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'מודגש', value: 'strong'},
              {title: 'נטוי', value: 'em'},
            ],
          },
        }),
        defineArrayMember({type: 'contentImage'}),
        defineArrayMember({type: 'beforeAfter'}),
      ],
    }),
  ],
  preview: {
    select: {title: 'title', media: 'coverImage'},
  },
})
