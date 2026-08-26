import {defineField, defineType} from 'sanity'

export const contentImage = defineType({
  name: 'contentImage',
  title: 'תמונה',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'תמונה',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({name: 'caption', title: 'כיתוב', type: 'string'}),
  ],
  preview: {
    select: {media: 'image', title: 'caption'},
    prepare: ({media, title}) => ({title: title || 'תמונה', media}),
  },
})
