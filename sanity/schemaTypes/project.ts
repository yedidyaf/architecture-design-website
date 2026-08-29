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
      options: {
        source: 'title',
        // Sanity's default slugify strips non-Latin characters, so a Hebrew
        // title would "Generate" into an empty slug. Keep the Hebrew block
        // (U+0590..U+05FF) alongside lowercase Latin and digits instead.
        slugify: (input) =>
          input
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\u0590-\u05FFa-z0-9-]/g, '')
            .slice(0, 96),
        // The default uniqueness check queries the dataset on every keystroke;
        // when that request hangs it destabilizes the whole form. Slugs are
        // authored by hand here, so skip the network round-trip.
        isUnique: () => true,
      },
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
