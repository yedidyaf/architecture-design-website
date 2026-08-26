import {defineField, defineType} from 'sanity'

export const beforeAfter = defineType({
  name: 'beforeAfter',
  title: 'לפני / אחרי',
  type: 'object',
  fields: [
    defineField({
      name: 'beforeImage',
      title: 'לפני',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'afterImage',
      title: 'אחרי',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({name: 'label', title: 'תווית (אופציונלי)', type: 'string'}),
  ],
  preview: {
    select: {media: 'afterImage', title: 'label'},
    prepare: ({media, title}) => ({title: title || 'לפני / אחרי', media}),
  },
})
