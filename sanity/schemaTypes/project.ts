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
        defineArrayMember({
          type: 'object',
          name: 'contentImage',
          title: 'תמונה',
          fields: [
            defineField({
              name: 'image',
              title: 'תמונה',
              type: 'image',
              options: {hotspot: true},
              validation: (Rule) => Rule.required(),
            }),
            defineField({name: 'caption', title: 'כיתוב', type: 'string'}),
          ],
          preview: {
            select: {media: 'image', title: 'caption'},
            prepare: ({media, title}) => ({title: title || 'תמונה', media}),
          },
        }),
        defineArrayMember({
          type: 'object',
          name: 'beforeAfter',
          title: 'לפני / אחרי',
          fields: [
            defineField({
              name: 'beforeImage',
              title: 'לפני',
              type: 'image',
              options: {hotspot: true},
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'afterImage',
              title: 'אחרי',
              type: 'image',
              options: {hotspot: true},
              validation: (Rule) => Rule.required(),
            }),
            defineField({name: 'label', title: 'תווית (אופציונלי)', type: 'string'}),
          ],
          preview: {
            select: {media: 'afterImage', title: 'label'},
            prepare: ({media, title}) => ({title: title || 'לפני / אחרי', media}),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'title', media: 'coverImage'},
  },
})
