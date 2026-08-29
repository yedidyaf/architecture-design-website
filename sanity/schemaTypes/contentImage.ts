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
  // No validation here on purpose: a required image would flag the block
  // invalid the moment it's added (before the upload finishes), and async
  // validators destabilize the block's edit dialog.
  preview: {
    select: {media: 'image', title: 'caption'},
    // Fall back on both fields so a block with no image and no caption yet
    // still previews instead of throwing.
    prepare: ({media, title}) => ({
      title: typeof title === 'string' && title.trim() ? title : 'תמונה',
      media,
    }),
  },
})
