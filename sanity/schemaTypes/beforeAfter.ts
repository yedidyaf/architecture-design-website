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
  // No validation here on purpose: required images would flag the block
  // invalid the moment it's added (before the uploads finish), and async
  // validators destabilize the block's edit dialog.
  preview: {
    select: {media: 'afterImage', title: 'label'},
    // Fall back on both fields so a block with neither image nor label yet
    // still previews instead of throwing.
    prepare: ({media, title}) => ({
      title: typeof title === 'string' && title.trim() ? title : 'לפני / אחרי',
      media,
    }),
  },
})
